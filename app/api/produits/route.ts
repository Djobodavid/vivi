import { drizzleDb } from "@/app/config/db";
import { ProduitSchema } from "@/app/config/db/schema";
import { eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

function apiResponse(
  success: boolean,
  message: string,
  data?: any,
  status = 200,
) {
  return Response.json({ success, message, data }, { status });
}

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { nom, image } = body;

    if (!nom) {
      return apiResponse(false, "Le nom est requis", null, 400);
    }

    // 🔥 check doublon
    const existing = await drizzleDb
      .select()
      .from(ProduitSchema)
      .where(sql`LOWER(${ProduitSchema.nom}) = LOWER(${nom})`);

    if (existing.length > 0) {
      return apiResponse(false, "Produit déjà existant", null, 409);
    }

    const newProduit = await drizzleDb
      .insert(ProduitSchema)
      .values({
        id: uuidv4(),
        nom,
        image,
      })
      .returning();

    return apiResponse(
      true,
      "Produit enregistré avec succès",
      newProduit[0],
      201,
    );
  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};

export const GET = async () => {
  try {
    const produits = await drizzleDb.select().from(ProduitSchema);

    return apiResponse(
      true,
      "Liste des produits récupérée avec succès",
      produits,
      200,
    );
  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};

export const DELETE = async (req: Request) => {
  try {
    const { id } = await req.json();

    if (!id) {
      return apiResponse(false, "ID du produit manquant", null, 400);
    }

    const deleted = await drizzleDb
      .delete(ProduitSchema)
      .where(eq(ProduitSchema.id, id))
      .returning();

    if (deleted.length === 0) {
      return apiResponse(false, "Produit introuvable", null, 404);
    }

    return apiResponse(true, "Produit supprimé avec succès", null, 200);
  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};

export const PUT = async (req: Request) => {
  try {
    const { id, nom, image } = await req.json();

    if (!id || !nom) {
      return apiResponse(false, "ID et nom requis", null, 400);
    }

    // 🔥 vérifier doublon (sauf lui-même)
    const existing = await drizzleDb
      .select()
      .from(ProduitSchema)
      .where(
        sql`LOWER(${ProduitSchema.nom}) = LOWER(${nom}) AND ${ProduitSchema.id} != ${id}`,
      );

    if (existing.length > 0) {
      return apiResponse(false, "Produit déjà existant", null, 409);
    }

    const updated = await drizzleDb
      .update(ProduitSchema)
      .set({
        nom,
        image,
      })
      .where(eq(ProduitSchema.id, id))
      .returning();

    if (updated.length === 0) {
      return apiResponse(false, "Produit introuvable", null, 404);
    }

    return apiResponse(true, "Produit modifié avec succès", updated[0], 200);
  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};