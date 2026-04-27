import { drizzleDb } from "@/app/config/db";
import { ProduitSchema, StockSchema } from "@/app/config/db/schema";
import { eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

function apiResponse(success: boolean, message: string, data?: any, status = 200) {
  return Response.json({ success, message, data }, { status });
}

export const GET = async () => {
  try {
    const pertes = await drizzleDb
      .select({
        produitId: StockSchema.produitId,
        nom: ProduitSchema.nom,

        quantite_perdue: sql<number>`SUM(${StockSchema.quantite_stock})`,
        
        valeur_perte: sql<number>`
          SUM(${StockSchema.quantite_stock} * ${StockSchema.prix_unitaire_achat})
        `,
      })
      .from(StockSchema)
      .leftJoin(
        ProduitSchema,
        eq(StockSchema.produitId, ProduitSchema.id)
      )
      .where(sql`${StockSchema.date_expiration} < NOW()`)
      .groupBy(StockSchema.produitId, ProduitSchema.nom);

    return apiResponse(true, "Pertes calculées", pertes);
  } catch (error) {
    return apiResponse(false, "Erreur serveur");
  }
};