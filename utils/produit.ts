import { drizzleDb } from "@/app/config/db";
import { StockSchema, ProduitSchema } from "@/app/config/db/schema";
import { sql } from "drizzle-orm";

export const getProduitsCaisse = async () => {
  return await drizzleDb
    .select({
      produitId: StockSchema.produitId,
      nom: ProduitSchema.nom,
      image: ProduitSchema.image,
      stock_total: sql<number>`SUM(${StockSchema.quantite_stock})`,
      prix_min: sql<number>`MIN(${StockSchema.prix_unitaire_vente})`,
      prix_max: sql<number>`MAX(${StockSchema.prix_unitaire_vente})`,
    })
    .from(StockSchema)
    .leftJoin(
      ProduitSchema,
      sql`${StockSchema.produitId} = ${ProduitSchema.id}`
    )
    .groupBy(StockSchema.produitId, ProduitSchema.nom, ProduitSchema.image)
    .having(sql`SUM(${StockSchema.quantite_stock}) > 0`);
};