import { drizzleDb } from "@/app/config/db";
import { ConsultationSchema, ParametreSchema } from "@/app/config/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "../auth/auth";
import { NextResponse } from "next/server";

function apiResponse(
  success: boolean,
  message: string,
  data?: any,
  status = 200,
) {
  return Response.json({ success, message, data }, { status });
}

export const GET = async () => {
  try {
    const consultations = await drizzleDb
  .select()
  .from(ConsultationSchema)
  .where(eq(ConsultationSchema.supprime, false));
    return apiResponse(true, "Liste des consultations", consultations, 200);
  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};

export const POST = async (req: Request) => {
  try {
    const { nom, prenom, diagnostic, traitement } = await req.json();

    if (!nom || !prenom || !diagnostic || !traitement) {
      return apiResponse(false, "Tous les champs sont requis", null, 400);
    }

    // ✅ Récupérer le prix actuel depuis les paramètres
    const prixParam = await drizzleDb
      .select()
      .from(ParametreSchema)
      .where(eq(ParametreSchema.cle, "prix_consultation"));

    const prix = Number(prixParam[0]?.valeur || 0);

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return apiResponse(false, "Non authentifié", null, 401);

    const newConsultation = await drizzleDb
      .insert(ConsultationSchema)
      .values({
        nom,
        prenom,
        diagnostic,
        traitement,
        prix: String(prix),
        utilisateurId: userId,
      })
      .returning();
    // ...

    return apiResponse(true, "Consultation créée", newConsultation[0], 201);
  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};

export const PUT = async (req: Request) => {
  try {
    const { id, nom, prenom, diagnostic, traitement } = await req.json();
    if (!id) return apiResponse(false, "ID manquant", null, 400);

    const updated = await drizzleDb
      .update(ConsultationSchema)
      .set({ nom, prenom, diagnostic, traitement })
      .where(eq(ConsultationSchema.id, id))
      .returning();

    if (updated.length === 0)
      return apiResponse(false, "Consultation introuvable", null, 404);
    return apiResponse(true, "Consultation modifiée", updated[0], 200);
  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};

export const DELETE = async (req: Request) => {
  try {
    const { id } = await req.json();
    if (!id) return apiResponse(false, "ID manquant", null, 400);

    const deleted = // DELETE → devient un archivage
await drizzleDb
  .update(ConsultationSchema)
  .set({ supprime: true })
  .where(eq(ConsultationSchema.id, id))
  .returning(); // ✅ AJOUT

    if (deleted.length === 0)
      return apiResponse(false, "Consultation introuvable", null, 404);
    return apiResponse(true, "Consultation supprimée", null, 200);
  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};
