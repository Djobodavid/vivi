import { drizzleDb } from "@/app/config/db";
import { StockSchema, ProduitSchema } from "@/app/config/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "../../auth/auth";

function apiResponse(success: boolean, message: string, data?: any, status = 200) {
  return Response.json({ success, message, data }, { status });
}

export const GET = async () => {
  try {
    const lots = await drizzleDb
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
        AND ${StockSchema.quantite_restante} > 0`
      );

    return apiResponse(true, "Lots périmés", lots, 200);
  } catch (error: any) {
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};

export const DELETE = async (req: Request) => {
  try {
    const { id } = await req.json();
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (role !== "admin")
      return apiResponse(false, "Accès refusé", null, 403);

    await drizzleDb
      .update(StockSchema)
      .set({ quantite_restante: 0 })
      .where(eq(StockSchema.id, id));

    return apiResponse(true, "Lot retiré");
  } catch (error: any) {
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};