import { drizzleDb } from "@/app/config/db";
import { ParametreSchema } from "@/app/config/db/schema";
import { eq } from "drizzle-orm";

function apiResponse(success: boolean, message: string, data?: any, status = 200) {
  return Response.json({ success, message, data }, { status });
}

export const GET = async () => {
  try {
    const parametres = await drizzleDb.select().from(ParametreSchema);
    return apiResponse(true, "Paramètres récupérés", parametres);
  } catch (error: any) {
    return apiResponse(false, "Erreur serveur: " + error?.message, null, 500);
  }
};

export const PUT = async (req: Request) => {
  try {
    const { cle, valeur } = await req.json();

    if (!cle || valeur === undefined || valeur === null) {
      return apiResponse(false, "Champs requis manquants", null, 400);
    }

    await drizzleDb
      .insert(ParametreSchema)
      .values({ cle, valeur })
      .onConflictDoUpdate({
        target: ParametreSchema.cle,
        set: { valeur },
      });

    return apiResponse(true, "Paramètre mis à jour");
  } catch (error: any) {
    return apiResponse(false, "Erreur serveur: " + error?.message, null, 500);
  }
};