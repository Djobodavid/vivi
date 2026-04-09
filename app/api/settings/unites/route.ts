import { drizzleDb } from "@/app/config/db";
import { UniteSchema } from "@/app/config/db/schema";
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
      .from(UniteSchema)
      .where(eq(UniteSchema.nom, nom));

    if (existing.length > 0) {
      return apiResponse(false, "Unité déjà existante", null, 409);
    }

    const newUnite = await drizzleDb
      .insert(UniteSchema)
      .values({ id: uuidv4(), nom, description })
      .returning();

    return apiResponse(true, "Unité créée avec succès", newUnite[0], 201);
  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};

export const GET = async () => {
  try {
    const unites = await drizzleDb.select().from(UniteSchema);

    return apiResponse(true, "Liste des unités récupérée", unites, 200);
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
      .delete(UniteSchema)
      .where(eq(UniteSchema.id, id))
      .returning();

    if (deleted.length === 0) {
      return apiResponse(false, "Unité introuvable", null, 404);
    }

    return apiResponse(true, "Unité supprimée avec succès", null, 200);
  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};
