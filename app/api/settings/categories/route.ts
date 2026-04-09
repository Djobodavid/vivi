import { drizzleDb } from "@/app/config/db";
import { CategorySchema } from "@/app/config/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

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
    const { nom, description } = body;

    // 🔥 validation
    if (!nom) {
      return apiResponse(false, "Le nom est requis", null, 400);
    }

    // 🔥 vérifier doublon
    const existing = await drizzleDb
      .select()
      .from(CategorySchema)
      .where(eq(CategorySchema.nom, nom));

    if (existing.length > 0) {
      return apiResponse(false, "Catégorie déjà existante", null, 409);
    }

    const newCategory = await drizzleDb
      .insert(CategorySchema)
      .values({ id: uuidv4(), nom, description })
      .returning();

    return apiResponse(
      true,
      "Catégorie créée avec succès",
      newCategory[0],
      201,
    );
  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};

export const GET = async () => {
  try {
    const categories = await drizzleDb.select().from(CategorySchema);

    return apiResponse(
      true,
      "Liste des catégories récupérée",
      categories,
      200
    );

  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};

export const PUT = async (req: Request) => {
  try {
    const { id, nom, description } = await req.json();

    if (!id) {
      return apiResponse(false, "ID manquant", null, 400);
    }

    const updated = await drizzleDb
      .update(CategorySchema)
      .set({ nom, description })
      .where(eq(CategorySchema.id, id))
      .returning();

    if (updated.length === 0) {
      return apiResponse(false, "Catégorie introuvable", null, 404);
    }

    return apiResponse(true, "Catégorie modifiée avec succès", updated[0], 200);

  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};

export const DELETE = async (req: Request) => {
  try {
    const { id } = await req.json();

    if (!id) {
      return apiResponse(false, "ID manquant", null, 400);
    }

    const deleted = await drizzleDb
      .delete(CategorySchema)
      .where(eq(CategorySchema.id, id))
      .returning();

    if (deleted.length === 0) {
      return apiResponse(false, "Catégorie introuvable", null, 404);
    }

    return apiResponse(true, "Catégorie supprimée avec succès", null, 200);

  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};