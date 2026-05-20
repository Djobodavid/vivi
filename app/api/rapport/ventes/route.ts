import { drizzleDb } from "@/app/config/db";
import {
  VenteSchema,
  VenteItemSchema,
  StockSchema,
  ProduitSchema,
  ClientSchema,
  UserSchema,
} from "@/app/config/db/schema";
import { eq, sql } from "drizzle-orm";

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
    const modePaiement = searchParams.get("modePaiement");

    // 🔥 Construction du filtre date
    let dateFilter = sql`1=1`;
    if (dateFrom && dateTo) {
      dateFilter = sql`${VenteSchema.date_vente} >= ${dateFrom}::date
        AND ${VenteSchema.date_vente} < ${dateTo}::date + INTERVAL '1 day'`;
    } else if (dateFrom) {
      dateFilter = sql`${VenteSchema.date_vente} >= ${dateFrom}::date`;
    } else if (dateTo) {
      dateFilter = sql`${VenteSchema.date_vente} < ${dateTo}::date + INTERVAL '1 day'`;
    }

    // 🔥 Filtre mode paiement
    let modeFilter = sql`1=1`;
    if (modePaiement && modePaiement !== "tous") {
      modeFilter = sql`${VenteSchema.mode_paiement} = ${modePaiement}`;
    }

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const offset = (page - 1) * limit;

    // 🔥 1. Résumé de la période
    const resume = await drizzleDb
      .select({
        totalVentes: sql<number>`COUNT(*)`,
        caPeriode: sql<number>`COALESCE(SUM(CAST(${VenteSchema.total} AS NUMERIC)), 0)`,
        panierMoyen: sql<number>`COALESCE(AVG(CAST(${VenteSchema.total} AS NUMERIC)), 0)`,
      })
      .from(VenteSchema)
      .where(sql`${dateFilter} AND ${modeFilter}`);

    // 🔥 2. Bénéfice de la période
    const benefice = await drizzleDb
      .select({
        benefice: sql<number>`
          COALESCE(SUM(
            (CAST(${VenteItemSchema.prix_unitaire} AS NUMERIC) - 
             CAST(${StockSchema.prix_unitaire_achat} AS NUMERIC)) * ${VenteItemSchema.quantite}
          ), 0)
        `,
      })
      .from(VenteItemSchema)
      .leftJoin(StockSchema, eq(VenteItemSchema.stockId, StockSchema.id))
      .leftJoin(VenteSchema, eq(VenteItemSchema.venteId, VenteSchema.id))
      .where(sql`${dateFilter} AND ${modeFilter}`);

    // 🔥 3. Liste des ventes avec détails
    const ventes = await drizzleDb
      .select({
        id: VenteSchema.id,
        date_vente: VenteSchema.date_vente,
        total: VenteSchema.total,
        mode_paiement: VenteSchema.mode_paiement,
        montant_recu: VenteSchema.montant_recu,
        monnaie_rendue: VenteSchema.monnaie_rendue,
        client: ClientSchema.nom,
        agent: UserSchema.nom,
        agentPrenom: UserSchema.prenom,
      })
      .from(VenteSchema)
      .leftJoin(ClientSchema, eq(VenteSchema.clientId, ClientSchema.id))
      .leftJoin(UserSchema, eq(VenteSchema.utilisateurId, UserSchema.id))
      .where(sql`${dateFilter} AND ${modeFilter}`)
      .orderBy(sql`${VenteSchema.date_vente} DESC`)
      .limit(limit)
      .offset(offset);

    // 🔥 4. Détails des items pour chaque vente
    const ventesAvecItems = await Promise.all(
      ventes.map(async (vente) => {
        const items = await drizzleDb
          .select({
            nom: ProduitSchema.nom,
            quantite: VenteItemSchema.quantite,
            prix_unitaire: VenteItemSchema.prix_unitaire,
            total: VenteItemSchema.total,
          })
          .from(VenteItemSchema)
          .leftJoin(
            ProduitSchema,
            eq(VenteItemSchema.produitId, ProduitSchema.id),
          )
          .where(eq(VenteItemSchema.venteId, vente.id));

        return { ...vente, items };
      }),
    );

    // Total pour calculer les pages
    const total = await drizzleDb
      .select({ count: sql<number>`COUNT(*)` })
      .from(VenteSchema)
      .where(sql`${dateFilter} AND ${modeFilter}`);

    // 🔥 5. Résumé par jour
    const parJour = await drizzleDb
      .select({
        date: sql<string>`DATE(${VenteSchema.date_vente})`,
        count: sql<number>`COUNT(*)`,
        total: sql<number>`COALESCE(SUM(CAST(${VenteSchema.total} AS NUMERIC)), 0)`,
      })
      .from(VenteSchema)
      .where(sql`${dateFilter} AND ${modeFilter}`)
      .groupBy(sql`DATE(${VenteSchema.date_vente})`)
      .orderBy(sql`DATE(${VenteSchema.date_vente}) ASC`);

    return apiResponse(true, "Rapport ventes récupéré", {
      resume: {
        totalVentes: Number(resume[0]?.totalVentes || 0),
        caPeriode: Number(resume[0]?.caPeriode || 0),
        panierMoyen: Number(resume[0]?.panierMoyen || 0),
        benefice: Number(benefice[0]?.benefice || 0),
      },
      ventes: ventesAvecItems,
      parJour,
      pagination: {
        page,
        limit,
        total: Number(total[0]?.count || 0),
        totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error(error);
    return apiResponse(false, "Erreur serveur: " + error?.message, null, 500);
  }
};
