import { drizzleDb } from "@/app/config/db";
import { FournisseurSchema } from "@/app/config/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

function apiResponse(success: boolean, message: string, data?: any, status = 200) {
  return Response.json({ success, message, data }, { status });
}

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { nom, addresse, telephone } = body;

    // 🔥 validation
    if (!nom || !addresse || !telephone) {
      return apiResponse(false, "Tous les champs sont requis", null, 400);
    }

    // 🔥 vérifier doublon (ex: téléphone unique)
    const existing = await drizzleDb
      .select()
      .from(FournisseurSchema)
      .where(eq(FournisseurSchema.telephone, telephone));

    if (existing.length > 0) {
      return apiResponse(false, "Fournisseur déjà existant", null, 409);
    }

    const newFournisseur = await drizzleDb
      .insert(FournisseurSchema)
      .values({ id: uuidv4(), nom, addresse, telephone })
      .returning();

    return apiResponse(
      true,
      "Fournisseur créé avec succès",
      newFournisseur[0],
      201
    );

  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};

export const GET = async () => {
  try {
    const fournisseurs = await drizzleDb.select().from(FournisseurSchema);

    return apiResponse(
      true,
      "Liste des fournisseurs récupérée",
      fournisseurs,
      200
    );

  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};

export const PUT = async (req: Request) => {
  try {
    const { id, nom, addresse, telephone } = await req.json();

    if (!id) {
      return apiResponse(false, "ID manquant", null, 400);
    }

    const updated = await drizzleDb
      .update(FournisseurSchema)
      .set({ nom, addresse, telephone })
      .where(eq(FournisseurSchema.id, id))
      .returning();

    if (updated.length === 0) {
      return apiResponse(false, "Fournisseur introuvable", null, 404);
    }

    return apiResponse(
      true,
      "Fournisseur modifié avec succès",
      updated[0],
      200
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
      return apiResponse(false, "ID manquant", null, 400);
    }

    const deleted = await drizzleDb
      .delete(FournisseurSchema)
      .where(eq(FournisseurSchema.id, id))
      .returning();

    if (deleted.length === 0) {
      return apiResponse(false, "Fournisseur introuvable", null, 404);
    }

    return apiResponse(true, "Fournisseur supprimé avec succès", null, 200);

  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};