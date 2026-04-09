import { drizzleDb } from "@/app/config/db";
import { ClientSchema } from "@/app/config/db/schema";
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
    const { nom, adresse, telephone } = body;

    // 🔥 validation
    if (!nom || !adresse || !telephone) {
      return apiResponse(false, "Tous les champs sont requis", null, 400);
    }

    // 🔥 vérifier si client existe déjà
    const existingClient = await drizzleDb
      .select()
      .from(ClientSchema)
      .where(eq(ClientSchema.telephone, telephone));

    if (existingClient.length > 0) {
      return apiResponse(false, "Client déjà existant", null, 409);
    }

    // ✅ création
    const newClient = await drizzleDb
      .insert(ClientSchema)
      .values({ id: uuidv4(), nom, adresse, telephone })
      .returning();

    return apiResponse(true, "Client créé avec succès", newClient[0], 201);
  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};

export const GET = async () => {
  try {
    const clients = await drizzleDb.select().from(ClientSchema);

    return apiResponse(true, "Liste des clients récupérée", clients, 200);
  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};
export const PUT = async (req: Request) => {
  try {
    const { id, nom, adresse, telephone } = await req.json();

    if (!id) {
      return apiResponse(false, "ID manquant", null, 400);
    }

    const updated = await drizzleDb
      .update(ClientSchema)
      .set({ nom, adresse, telephone })
      .where(eq(ClientSchema.id, id))
      .returning();

    if (updated.length === 0) {
      return apiResponse(false, "Client introuvable", null, 404);
    }

    return apiResponse(true, "Client modifié avec succès", updated[0], 200);
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
      .delete(ClientSchema)
      .where(eq(ClientSchema.id, id))
      .returning();

    if (deleted.length === 0) {
      return apiResponse(false, "Client introuvable", null, 404);
    }

    return apiResponse(true, "Client supprimé avec succès", null, 200);
  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};
