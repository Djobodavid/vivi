import { drizzleDb } from "@/app/config/db";
import {
  StockSchema, ProduitSchema, VenteSchema,
  VenteItemSchema, UniteSchema, ParametreSchema, ConsultationSchema,
} from "@/app/config/db/schema";
import { eq, sql } from "drizzle-orm";

function apiResponse(success: boolean, message: string, data?: any, status = 200) {
  return Response.json({ success, message, data }, { status });
}

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const periode = searchParams.get("periode") || "mois";

    // 🔥 Plage de dates (partagée pour bénéfice ET pertes)
    let dateRangeFrom = "";
    let dateRangeTo = "";

    if (periode === "jour") {
      dateRangeFrom = "CURRENT_DATE";
      dateRangeTo = "CURRENT_DATE + INTERVAL '1 day'";
    } else if (periode === "semaine") {
      dateRangeFrom = "CURRENT_DATE - INTERVAL '7 days'";
      dateRangeTo = "CURRENT_DATE + INTERVAL '1 day'";
    } else if (periode === "mois") {
      dateRangeFrom = "DATE_TRUNC('month', CURRENT_DATE)";
      dateRangeTo = "DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'";
    } else if (periode === "custom" && dateFrom && dateTo) {
      dateRangeFrom = `'${dateFrom}'::date`;
      dateRangeTo = `'${dateTo}'::date + INTERVAL '1 day'`;
    } else {
      dateRangeFrom = "DATE_TRUNC('month', CURRENT_DATE)";
      dateRangeTo = "DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'";
    }

    // 🔥 1. Ventes du jour
    const ventesJour = await drizzleDb
      .select({
        count: sql<number>`COUNT(*)`,
        total: sql<number>`COALESCE(SUM(CAST(${VenteSchema.total} AS NUMERIC)), 0)`,
      })
      .from(VenteSchema)
      .where(sql`DATE(${VenteSchema.date_vente}) = CURRENT_DATE`);

    // 🔥 2. CA du mois
    const venteMois = await drizzleDb
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${VenteSchema.total} AS NUMERIC)), 0)`,
      })
      .from(VenteSchema)
      .where(sql`DATE_TRUNC('month', ${VenteSchema.date_vente}) = DATE_TRUNC('month', CURRENT_DATE)`);

    // 🔥 3. Bénéfice avec filtre période
    const beneficeResult = await drizzleDb
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
      .where(
        sql`${VenteSchema.date_vente} >= ${sql.raw(dateRangeFrom)}
        AND ${VenteSchema.date_vente} < ${sql.raw(dateRangeTo)}`
      );

    // 🔥 4. Consultations avec filtre période
    const consultationsResult = await drizzleDb
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${ConsultationSchema.prix} AS NUMERIC)), 0)`,
      })
      .from(ConsultationSchema)
      .where(
        sql`${ConsultationSchema.date_consultation} >= ${sql.raw(dateRangeFrom)}
        AND ${ConsultationSchema.date_consultation} < ${sql.raw(dateRangeTo)}
        AND ${ConsultationSchema.supprime} = false`
      );

    const revenuConsultations = Number(consultationsResult[0]?.total || 0);

    // 🔥 5. Seuil stock
    const seuilParam = await drizzleDb
      .select()
      .from(ParametreSchema)
      .where(eq(ParametreSchema.cle, "seuil_stock_min"));

    const seuilMin = Number(seuilParam[0]?.valeur || 20);

    // 🔥 6. Stock faible
    const stockFaible = await drizzleDb
      .select({
        produitId: StockSchema.produitId,
        nom: ProduitSchema.nom,
        totalRestant: sql<number>`SUM(${StockSchema.quantite_restante})`,
        seuilMin: sql<number>`${seuilMin}`,
      })
      .from(StockSchema)
      .leftJoin(ProduitSchema, eq(StockSchema.produitId, ProduitSchema.id))
      .where(sql`${StockSchema.date_expiration} > NOW() AND ${StockSchema.statut} = 'operationnel'`)
      .groupBy(StockSchema.produitId, ProduitSchema.nom)
      .having(sql`SUM(${StockSchema.quantite_restante}) <= ${seuilMin} AND SUM(${StockSchema.quantite_restante}) > 0`);

    // 🔥 7. Lots périmés
    const lotsPerimes = await drizzleDb
      .select({
        id: StockSchema.id,
        nom: ProduitSchema.nom,
        quantite_restante: StockSchema.quantite_restante,
        date_expiration: StockSchema.date_expiration,
        prix_unitaire_achat: StockSchema.prix_unitaire_achat,
      })
      .from(StockSchema)
      .leftJoin(ProduitSchema, eq(StockSchema.produitId, ProduitSchema.id))
      .where(sql`${StockSchema.date_expiration} < NOW() AND ${StockSchema.quantite_restante} > 0`);

    // 🔥 8. Pertes avec filtre période
    const pertesData = await drizzleDb
      .select({
        nom: ProduitSchema.nom,
        quantite_restante: StockSchema.quantite_restante,
        prix_unitaire_achat: StockSchema.prix_unitaire_achat,
        date_expiration: StockSchema.date_expiration,
        perte: sql<number>`CAST(${StockSchema.quantite_restante} AS NUMERIC) * CAST(${StockSchema.prix_unitaire_achat} AS NUMERIC)`,
      })
      .from(StockSchema)
      .leftJoin(ProduitSchema, eq(StockSchema.produitId, ProduitSchema.id))
      .where(
        sql`${StockSchema.date_expiration} < NOW()
        AND ${StockSchema.quantite_restante} > 0
        AND ${StockSchema.date_expiration} >= ${sql.raw(dateRangeFrom)}
        AND ${StockSchema.date_expiration} < ${sql.raw(dateRangeTo)}`
      )
      .orderBy(sql`CAST(${StockSchema.quantite_restante} AS NUMERIC) * CAST(${StockSchema.prix_unitaire_achat} AS NUMERIC) DESC`);

    const totalPertes = pertesData.reduce((sum, p) => sum + Number(p.perte || 0), 0);

    // 🔥 9. Top 5 produits
    const topProduits = await drizzleDb
      .select({
        nom: ProduitSchema.nom,
        total_vendu: sql<number>`SUM(${VenteItemSchema.quantite})`,
        unite: UniteSchema.nom,
      })
      .from(VenteItemSchema)
      .leftJoin(ProduitSchema, eq(VenteItemSchema.produitId, ProduitSchema.id))
      .leftJoin(StockSchema, eq(VenteItemSchema.stockId, StockSchema.id))
      .leftJoin(UniteSchema, eq(StockSchema.uniteId, UniteSchema.id))
      .groupBy(ProduitSchema.nom, UniteSchema.nom)
      .orderBy(sql`SUM(${VenteItemSchema.quantite}) DESC`)
      .limit(5);

    // 🔥 10. Ventes 7 derniers jours
    const ventes7Jours = await drizzleDb
      .select({
        date: sql<string>`DATE(${VenteSchema.date_vente})`,
        count: sql<number>`COUNT(*)`,
        total: sql<number>`COALESCE(SUM(CAST(${VenteSchema.total} AS NUMERIC)), 0)`,
      })
      .from(VenteSchema)
      .where(sql`${VenteSchema.date_vente} >= CURRENT_DATE - INTERVAL '7 days'`)
      .groupBy(sql`DATE(${VenteSchema.date_vente})`)
      .orderBy(sql`DATE(${VenteSchema.date_vente}) ASC`);

    // 🔥 11. Lots expirant dans 30 jours
    const expirantBientot = await drizzleDb
      .select({
        id: StockSchema.id,
        nom: ProduitSchema.nom,
        quantite_restante: StockSchema.quantite_restante,
        date_expiration: StockSchema.date_expiration,
      })
      .from(StockSchema)
      .leftJoin(ProduitSchema, eq(StockSchema.produitId, ProduitSchema.id))
      .where(
        sql`${StockSchema.date_expiration} > NOW()
        AND ${StockSchema.date_expiration} <= NOW() + INTERVAL '30 days'
        AND ${StockSchema.quantite_restante} > 0`
      )
      .orderBy(StockSchema.date_expiration);

    // 🔥 12. Stocks épuisés
    const stocksEpuises = await drizzleDb
      .select({ produitId: StockSchema.produitId, nom: ProduitSchema.nom })
      .from(StockSchema)
      .leftJoin(ProduitSchema, eq(StockSchema.produitId, ProduitSchema.id))
      .groupBy(StockSchema.produitId, ProduitSchema.nom)
      .having(sql`SUM(CASE WHEN ${StockSchema.date_expiration} > NOW() THEN ${StockSchema.quantite_restante} ELSE 0 END) = 0`);

    // ✅ Calcul final
    const beneficeProduits = Number(beneficeResult[0]?.benefice || 0);
    const beneficeNet = beneficeProduits + revenuConsultations - totalPertes;

    return apiResponse(true, "Dashboard récupéré", {
      ventesJour: {
        count: Number(ventesJour[0]?.count || 0),
        total: Number(ventesJour[0]?.total || 0),
      },
      caMois: Number(venteMois[0]?.total || 0),
      beneficeNet,
      beneficeMois: beneficeProduits,
      revenuConsultations,
      stockFaible,
      lotsPerimes: lotsPerimes.length,
      pertes: { periode, dateFrom, dateTo, total: totalPertes, details: pertesData },
      topProduits,
      ventes7Jours,
      expirantBientot,
      stocksEpuises,
      stocksEpuisesCount: stocksEpuises.length,
      seuilMin,
    });

  } catch (error: any) {
    console.error(error);
    return apiResponse(false, "Erreur serveur: " + error?.message, null, 500);
  }
};