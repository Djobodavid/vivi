import { drizzleDb } from "@/app/config/db";
import {
  ProduitSchema,
  VenteItemSchema,
} from "@/app/config/db/schema";
import { eq } from "drizzle-orm";


function apiResponse(
  success: boolean,
  message: string,
  data?: any,
  status = 200,
) {
  return Response.json({ success, message, data }, { status });
}

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = await params; // ✅ OBLIGATOIRE
    const items = await drizzleDb
      .select({
        produitNom: ProduitSchema.nom,
        quantite: VenteItemSchema.quantite,
        prix: VenteItemSchema.prix_unitaire,
        total: VenteItemSchema.total,
      })
      .from(VenteItemSchema)
      .leftJoin(
        ProduitSchema,
        eq(VenteItemSchema.produitId, ProduitSchema.id)
      )
      .where(eq(VenteItemSchema.venteId, id)); // ✅ UTILISER id


    return apiResponse(true, "Détails vente", items);
  } catch (error) {
    return apiResponse(false, "Erreur serveur");
  }
};