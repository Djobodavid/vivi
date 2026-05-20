import { drizzleDb } from "@/app/config/db";
import {
  StockSchema,
  ProduitSchema,
  ParametreSchema,
} from "@/app/config/db/schema";
import { eq, sql } from "drizzle-orm";

function apiResponse(success: boolean, message: string, data?: any, status = 200) {
  return Response.json({ success, message, data }, { status });
}

export const GET = async () => {
  try {
    // 🔥 Seuil depuis paramètres
    const seuilParam = await drizzleDb
      .select()
      .from(ParametreSchema)
      .where(eq(ParametreSchema.cle, "seuil_stock_min"));
    const seuilMin = Number(seuilParam[0]?.valeur || 20);

    // 🔥 1. Lots périmés avec stock restant
    const lotsPerimes = await drizzleDb
      .select({ nom: ProduitSchema.nom, quantite: StockSchema.quantite_restante })
      .from(StockSchema)
      .leftJoin(ProduitSchema, eq(StockSchema.produitId, ProduitSchema.id))
      .where(sql`${StockSchema.date_expiration} < NOW() AND ${StockSchema.quantite_restante} > 0`);

    // 🔥 2. Stock faible
    const stockFaible = await drizzleDb
      .select({
        nom: ProduitSchema.nom,
        totalRestant: sql<number>`SUM(${StockSchema.quantite_restante})`,
      })
      .from(StockSchema)
      .leftJoin(ProduitSchema, eq(StockSchema.produitId, ProduitSchema.id))
      .where(sql`${StockSchema.date_expiration} > NOW() AND ${StockSchema.statut} = 'operationnel'`)
      .groupBy(ProduitSchema.nom)
      .having(sql`SUM(${StockSchema.quantite_restante}) <= ${seuilMin} AND SUM(${StockSchema.quantite_restante}) > 0`);

    // 🔥 3. Expirant dans 30 jours
    const expirantBientot = await drizzleDb
      .select({
        nom: ProduitSchema.nom,
        date_expiration: StockSchema.date_expiration,
        quantite: StockSchema.quantite_restante,
      })
      .from(StockSchema)
      .leftJoin(ProduitSchema, eq(StockSchema.produitId, ProduitSchema.id))
      .where(
        sql`${StockSchema.date_expiration} > NOW()
        AND ${StockSchema.date_expiration} <= NOW() + INTERVAL '30 days'
        AND ${StockSchema.quantite_restante} > 0`
      );

    // 🔥 4. Stocks épuisés
    const stocksEpuises = await drizzleDb
      .select({ nom: ProduitSchema.nom })
      .from(StockSchema)
      .leftJoin(ProduitSchema, eq(StockSchema.produitId, ProduitSchema.id))
      .groupBy(ProduitSchema.nom)
      .having(
        sql`SUM(CASE WHEN ${StockSchema.date_expiration} > NOW()
        THEN ${StockSchema.quantite_restante} ELSE 0 END) = 0`
      );

    const totalAlertes =
      lotsPerimes.length +
      stockFaible.length +
      expirantBientot.length +
      stocksEpuises.length;

    return apiResponse(true, "Alertes récupérées", {
      totalAlertes,
      lotsPerimes,
      stockFaible,
      expirantBientot,
      stocksEpuises,
    });
  } catch (error: any) {
    return apiResponse(false, "Erreur serveur: " + error?.message, null, 500);
  }
};