import { drizzleDb } from "@/app/config/db";
import {
  StockSchema,
  ProduitSchema,
  FournisseurSchema,
  UniteSchema,
  CategorySchema,
  UserSchema,
} from "@/app/config/db/schema";
import { eq, sql } from "drizzle-orm";

function apiResponse(success: boolean, message: string, data?: any, status = 200) {
  return Response.json({ success, message, data }, { status });
}

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const offset = (page - 1) * limit;
    const categorie = searchParams.get("categorie");
    const statut = searchParams.get("statut");

    // 🔥 Filtres
    let filters = sql`1=1`;
    if (categorie) filters = sql`${filters} AND ${StockSchema.categoryId} = ${categorie}`;
    if (statut) filters = sql`${filters} AND ${StockSchema.statut} = ${statut}`;

    // 🔥 1. Résumé global
    const resume = await drizzleDb
      .select({
        totalLots: sql<number>`COUNT(*)`,
        totalInitial: sql<number>`SUM(${StockSchema.quantite_stock})`,
        totalRestant: sql<number>`SUM(${StockSchema.quantite_restante})`,
        valeurStock: sql<number>`
          COALESCE(SUM(
            CAST(${StockSchema.quantite_restante} AS NUMERIC) *
            CAST(${StockSchema.prix_unitaire_achat} AS NUMERIC)
          ), 0)
        `,
      })
      .from(StockSchema)
      .where(sql`${StockSchema.date_expiration} > NOW() AND ${filters}`);

    // 🔥 2. Total pour pagination
    const total = await drizzleDb
  .select({ count: sql<number>`COUNT(*)` })
  .from(StockSchema)
  .where(sql`${filters}`);

    // 🔥 3. Liste des lots
    const stocks = await drizzleDb
      .select({
        id: StockSchema.id,
        date_stock: StockSchema.date_stock,
        date_expiration: StockSchema.date_expiration,
        quantite_stock: StockSchema.quantite_stock,
        quantite_restante: StockSchema.quantite_restante,
        quantite_min_stock: StockSchema.quantite_min_stock,
        prix_unitaire_achat: StockSchema.prix_unitaire_achat,
        prix_unitaire_vente: StockSchema.prix_unitaire_vente,
        statut: StockSchema.statut,
        produit: ProduitSchema.nom,
        fournisseur: FournisseurSchema.nom,
        unite: UniteSchema.nom,
        categorie: CategorySchema.nom,
        agent: UserSchema.nom,         // ✅ nom agent
    agentPrenom: UserSchema.prenom, // ✅ prénom agent
      })
      .from(StockSchema)
      .leftJoin(ProduitSchema, eq(StockSchema.produitId, ProduitSchema.id))
      .leftJoin(FournisseurSchema, eq(StockSchema.fournisseurId, FournisseurSchema.id))
      .leftJoin(UniteSchema, eq(StockSchema.uniteId, UniteSchema.id))
      .leftJoin(CategorySchema, eq(StockSchema.categoryId, CategorySchema.id))
      .leftJoin(UserSchema, eq(StockSchema.utilisateurId, UserSchema.id)) // ✅ jointure agent
    .where(
  sql`${filters}` // ✅ plus de filtre quantite_restante
)
      .orderBy(sql`${StockSchema.date_expiration} ASC`)
      .limit(limit)
      .offset(offset);

    // 🔥 4. Catégories pour le filtre
    const categories = await drizzleDb
      .select({ id: CategorySchema.id, nom: CategorySchema.nom })
      .from(CategorySchema);

    return apiResponse(true, "Rapport stock récupéré", {
      resume: {
        totalLots: Number(resume[0]?.totalLots || 0),
        totalInitial: Number(resume[0]?.totalInitial || 0),
        totalRestant: Number(resume[0]?.totalRestant || 0),
        valeurStock: Number(resume[0]?.valeurStock || 0),
      },
      stocks,
      categories,
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