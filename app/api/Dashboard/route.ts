import { drizzleDb } from "@/app/config/db";
import {
  StockSchema,
  ProduitSchema,
  VenteSchema,
  VenteItemSchema,
  UniteSchema,
  ParametreSchema,
} from "@/app/config/db/schema";
import { eq, sql } from "drizzle-orm";
import { ConsultationSchema } from "@/app/config/db/schema";
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
    const periode = searchParams.get("periode") || "mois"; // jour | semaine | mois | custom

    // 🔥 Calcul plage de dates pour les pertes
    let perteFrom = "";
    let perteTo = "";

    if (periode === "jour") {
      perteFrom = "CURRENT_DATE";
      perteTo = "CURRENT_DATE + INTERVAL '1 day'";
    } else if (periode === "semaine") {
      perteFrom = "CURRENT_DATE - INTERVAL '7 days'";
      perteTo = "CURRENT_DATE + INTERVAL '1 day'";
    } else if (periode === "mois") {
      perteFrom = "DATE_TRUNC('month', CURRENT_DATE)";
      perteTo = "DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'";
    } else if (periode === "custom" && dateFrom && dateTo) {
      perteFrom = `'${dateFrom}'::date`;
      perteTo = `'${dateTo}'::date + INTERVAL '1 day'`;
    } else {
      perteFrom = "DATE_TRUNC('month', CURRENT_DATE)";
      perteTo = "DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'";
    }

    // Prix consultation depuis paramètres
    const prixConsultParam = await drizzleDb
      .select()
      .from(ParametreSchema)
      .where(eq(ParametreSchema.cle, "prix_consultation"));

    const prixConsultation = Number(prixConsultParam[0]?.valeur || 0);

    // Nombre de consultations du mois
    const consultationsMois = await drizzleDb
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(ConsultationSchema)
      .where(
        sql`DATE_TRUNC('month', ${ConsultationSchema.date_consultation}) = DATE_TRUNC('month', CURRENT_DATE)`,
      );

    const revenuConsultations =
      Number(consultationsMois[0]?.count || 0) * prixConsultation;

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
      .where(
        sql`DATE_TRUNC('month', ${VenteSchema.date_vente}) = DATE_TRUNC('month', CURRENT_DATE)`,
      );

    // 🔥 3. Bénéfice du mois (CA vente - coût achat des items vendus ce mois)
    const beneficeMois = await drizzleDb
      .select({
        benefice: sql<number>`
      COALESCE(SUM(
        (CAST(${VenteItemSchema.prix_unitaire} AS NUMERIC) - CAST(${StockSchema.prix_unitaire_achat} AS NUMERIC)) * ${VenteItemSchema.quantite}
      ), 0)
    `,
      })
      .from(VenteItemSchema)
      .leftJoin(StockSchema, eq(VenteItemSchema.stockId, StockSchema.id))
      .leftJoin(VenteSchema, eq(VenteItemSchema.venteId, VenteSchema.id))
      .where(
        sql`DATE_TRUNC('month', ${VenteSchema.date_vente}) = DATE_TRUNC('month', CURRENT_DATE)`,
      );

    // 🔥 4. Stock faible — basé sur le stock global du produit
    // 🔥 Récupérer le seuil depuis les paramètres
    const seuilParam = await drizzleDb
      .select()
      .from(ParametreSchema)
      .where(eq(ParametreSchema.cle, "seuil_stock_min"));

    const seuilMin = Number(seuilParam[0]?.valeur || 20);

    // 🔥 4. Stock faible — basé sur le seuil global
    const stockFaible = await drizzleDb
      .select({
        produitId: StockSchema.produitId,
        nom: ProduitSchema.nom,
        totalRestant: sql<number>`SUM(${StockSchema.quantite_restante})`,
      })
      .from(StockSchema)
      .leftJoin(ProduitSchema, eq(StockSchema.produitId, ProduitSchema.id))
      .where(
        sql`${StockSchema.date_expiration} > NOW()
    AND ${StockSchema.statut} = 'operationnel'`,
      )
      .groupBy(StockSchema.produitId, ProduitSchema.nom)
      .having(
        sql`SUM(${StockSchema.quantite_restante}) <= ${seuilMin}
    AND SUM(${StockSchema.quantite_restante}) > 0`,
      );

    // 🔥 5. Lots périmés avec stock restant
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
      .where(
        sql`${StockSchema.date_expiration} < NOW()
        AND ${StockSchema.quantite_restante} > 0`,
      );

    // 🔥 6. Pertes sur la période choisie
    const pertesData = await drizzleDb
      .select({
        nom: ProduitSchema.nom,
        quantite_restante: StockSchema.quantite_restante,
        prix_unitaire_achat: StockSchema.prix_unitaire_achat,
        date_expiration: StockSchema.date_expiration,
        perte: sql<number>`
      CAST(${StockSchema.quantite_restante} AS NUMERIC) *
      CAST(${StockSchema.prix_unitaire_achat} AS NUMERIC)
    `,
      })
      .from(StockSchema)
      .leftJoin(ProduitSchema, eq(StockSchema.produitId, ProduitSchema.id))
      .where(
        sql`${StockSchema.date_expiration} < NOW()
    AND ${StockSchema.quantite_restante} > 0
    AND ${StockSchema.date_expiration} >= ${sql.raw(perteFrom)}
    AND ${StockSchema.date_expiration} < ${sql.raw(perteTo)}`,
      )
      .orderBy(
        sql`CAST(${StockSchema.quantite_restante} AS NUMERIC) * CAST(${StockSchema.prix_unitaire_achat} AS NUMERIC) DESC`,
      ); // ✅ expression complète

    const totalPertes = pertesData.reduce(
      (sum, p) => sum + Number(p.perte || 0),
      0,
    );

    // 🔥 7. Top 5 produits vendus
    const topProduits = await drizzleDb
      .select({
        nom: ProduitSchema.nom,
        total_vendu: sql<number>`SUM(${VenteItemSchema.quantite})`,
        unite: UniteSchema.nom, // ✅ on récupère l'unité
      })
      .from(VenteItemSchema)
      .leftJoin(ProduitSchema, eq(VenteItemSchema.produitId, ProduitSchema.id))
      .leftJoin(StockSchema, eq(VenteItemSchema.stockId, StockSchema.id)) // ✅ via le stock
      .leftJoin(UniteSchema, eq(StockSchema.uniteId, UniteSchema.id)) // ✅ unité du stock
      .groupBy(ProduitSchema.nom, UniteSchema.nom)
      .orderBy(sql`SUM(${VenteItemSchema.quantite}) DESC`)
      .limit(5);

    // 🔥 8. Ventes 7 derniers jours
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

    // 🔥 9. Lots expirant dans 30 jours
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
        AND ${StockSchema.quantite_restante} > 0`,
      )
      .orderBy(StockSchema.date_expiration);

    // 🔥 10. Stocks épuisés — tout stock restant = 0 peu importe le statut
    const stocksEpuises = await drizzleDb
      .select({
        produitId: StockSchema.produitId,
        nom: ProduitSchema.nom,
      })
      .from(StockSchema)
      .leftJoin(ProduitSchema, eq(StockSchema.produitId, ProduitSchema.id))
      .groupBy(StockSchema.produitId, ProduitSchema.nom)
      .having(
        sql`SUM(CASE WHEN ${StockSchema.date_expiration} > NOW() 
    THEN ${StockSchema.quantite_restante} ELSE 0 END) = 0`,
      );

    // ✅ AJOUTEZ CES DEUX LIGNES juste avant le return
    const beneficeProduits = Number(beneficeMois[0]?.benefice || 0);
    const beneficeNet = beneficeProduits + revenuConsultations - totalPertes;

    return apiResponse(true, "Dashboard récupéré", {
      ventesJour: {
        count: Number(ventesJour[0]?.count || 0),
        total: Number(ventesJour[0]?.total || 0),
      },
      caMois: Number(venteMois[0]?.total || 0),
      // ✅ beneficeNet = produits + consultations - pertes (pas deux fois)
      beneficeNet, // ✅ variable déclarée
      beneficeMois: beneficeProduits, // ✅ variable déclarée
      revenuConsultations,
      stockFaible,
      lotsPerimes: lotsPerimes.length,
      pertes: {
        periode,
        dateFrom,
        dateTo,
        total: totalPertes,
        details: pertesData,
      },
      topProduits,
      ventes7Jours,
      expirantBientot,
      stocksEpuises,
      stocksEpuisesCount: stocksEpuises.length, // ← pour la métrique
      seuilMin,
    });
  } catch (error: any) {
    console.error(error);
    return apiResponse(false, "Erreur serveur: " + error?.message, null, 500);
  }
};
