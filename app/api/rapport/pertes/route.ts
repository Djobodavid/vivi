import { drizzleDb } from "@/app/config/db";
import {
  StockSchema,
  ProduitSchema,
  FournisseurSchema,
  UserSchema,
  CategorySchema,
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
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const offset = (page - 1) * limit;

    // 🔥 Filtre date sur date_expiration
    let dateFilter = sql`${StockSchema.date_expiration} < NOW()
      AND ${StockSchema.quantite_restante} > 0`;

    if (dateFrom && dateTo) {
      dateFilter = sql`${StockSchema.date_expiration} < NOW()
        AND ${StockSchema.quantite_restante} > 0
        AND ${StockSchema.date_expiration} >= ${dateFrom}::date
        AND ${StockSchema.date_expiration} < ${dateTo}::date + INTERVAL '1 day'`;
    } else if (dateFrom) {
      dateFilter = sql`${StockSchema.date_expiration} < NOW()
        AND ${StockSchema.quantite_restante} > 0
        AND ${StockSchema.date_expiration} >= ${dateFrom}::date`;
    } else if (dateTo) {
      dateFilter = sql`${StockSchema.date_expiration} < NOW()
        AND ${StockSchema.quantite_restante} > 0
        AND ${StockSchema.date_expiration} < ${dateTo}::date + INTERVAL '1 day'`;
    }

    // 🔥 1. Résumé
    const resume = await drizzleDb
      .select({
        totalLots: sql<number>`COUNT(*)`,
        totalUnites: sql<number>`SUM(${StockSchema.quantite_restante})`,
        valeurPerdue: sql<number>`
          COALESCE(SUM(
            CAST(${StockSchema.quantite_restante} AS NUMERIC) *
            CAST(${StockSchema.prix_unitaire_achat} AS NUMERIC)
          ), 0)
        `,
        valeurVentePerdue: sql<number>`
          COALESCE(SUM(
            CAST(${StockSchema.quantite_restante} AS NUMERIC) *
            CAST(${StockSchema.prix_unitaire_vente} AS NUMERIC)
          ), 0)
        `,
      })
      .from(StockSchema)
      .where(dateFilter);

    // 🔥 2. Total pour pagination
    const total = await drizzleDb
      .select({ count: sql<number>`COUNT(*)` })
      .from(StockSchema)
      .where(dateFilter);

    // 🔥 3. Liste des pertes
    const pertes = await drizzleDb
      .select({
        id: StockSchema.id,
        date_expiration: StockSchema.date_expiration,
        date_stock: StockSchema.date_stock,
        quantite_restante: StockSchema.quantite_restante,
        prix_unitaire_achat: StockSchema.prix_unitaire_achat,
        prix_unitaire_vente: StockSchema.prix_unitaire_vente,
        produit: ProduitSchema.nom,
        categorie: CategorySchema.nom,
        fournisseur: FournisseurSchema.nom,
        agent: UserSchema.nom,
        agentPrenom: UserSchema.prenom,
        valeurPerdue: sql<number>`
          CAST(${StockSchema.quantite_restante} AS NUMERIC) *
          CAST(${StockSchema.prix_unitaire_achat} AS NUMERIC)
        `,
        valeurVentePerdue: sql<number>`
          CAST(${StockSchema.quantite_restante} AS NUMERIC) *
          CAST(${StockSchema.prix_unitaire_vente} AS NUMERIC)
        `,
      })
      .from(StockSchema)
      .leftJoin(ProduitSchema, eq(StockSchema.produitId, ProduitSchema.id))
      .leftJoin(CategorySchema, eq(StockSchema.categoryId, CategorySchema.id))
      .leftJoin(FournisseurSchema, eq(StockSchema.fournisseurId, FournisseurSchema.id))
      .leftJoin(UserSchema, eq(StockSchema.utilisateurId, UserSchema.id))
      .where(dateFilter)
      .orderBy(sql`
        CAST(${StockSchema.quantite_restante} AS NUMERIC) *
        CAST(${StockSchema.prix_unitaire_achat} AS NUMERIC) DESC
      `)
      .limit(limit)
      .offset(offset);

    return apiResponse(true, "Rapport pertes récupéré", {
      resume: {
        totalLots: Number(resume[0]?.totalLots || 0),
        totalUnites: Number(resume[0]?.totalUnites || 0),
        valeurPerdue: Number(resume[0]?.valeurPerdue || 0),
        valeurVentePerdue: Number(resume[0]?.valeurVentePerdue || 0),
      },
      pertes,
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