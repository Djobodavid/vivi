import { drizzleDb } from "@/app/config/db";
import {
  ClientSchema,
  ProduitSchema,
  StockSchema,
  VenteItemSchema,
  VenteSchema,
} from "@/app/config/db/schema";
import { eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

function apiResponse(
  success: boolean,
  message: string,
  data?: any,
  status = 200,
) {
  return Response.json({ success, message, data }, { status });
}

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);

    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    let whereClause = sql`1=1`;

    if (dateFrom) {
      whereClause = sql`${whereClause} AND ${VenteSchema.date_vente} >= ${new Date(dateFrom)}`;
    }

    if (dateTo) {
      whereClause = sql`${whereClause} AND ${VenteSchema.date_vente} <= ${new Date(dateTo)}`;
    }

    const data = await drizzleDb
      .select({
        venteId: VenteSchema.id,
        date: VenteSchema.date_vente,
        total: VenteSchema.total,
        clientNom: ClientSchema.nom,
        montantRecu: VenteSchema.montant_recu,
        monnaie: VenteSchema.monnaie_rendue,
        produitNom: ProduitSchema.nom,
        quantite: VenteItemSchema.quantite,
        prix: VenteItemSchema.prix_unitaire,
        totalLigne: VenteItemSchema.total, // ✅ AJOUT IMPORTANT
      })
      .from(VenteSchema)
      .where(whereClause)
      .leftJoin(ClientSchema, eq(VenteSchema.clientId, ClientSchema.id))
      .leftJoin(VenteItemSchema, eq(VenteSchema.id, VenteItemSchema.venteId))
      .leftJoin(ProduitSchema, eq(VenteItemSchema.produitId, ProduitSchema.id))
      .orderBy(sql`${VenteSchema.date_vente} DESC`);

    // 🔥 GROUP BY PROPRE
    const grouped = Object.values(
      data.reduce((acc: any, item: any) => {
        if (!acc[item.venteId]) {
          acc[item.venteId] = {
            id: item.venteId,
            date: item.date,
            total: Number(item.total),
            clientNom: item.clientNom,
            montantRecu: Number(item.montantRecu),
            monnaie: Number(item.monnaie),
            produits: [],
          };
        }

        acc[item.venteId].produits.push({
          nom: item.produitNom,
          quantite: item.quantite,
          prix: Number(item.prix),
          total: Number(item.totalLigne), // ✅
        });

        return acc;
      }, {}),
    );

    return apiResponse(true, "Historique récupéré", grouped);
  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};
