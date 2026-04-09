import { drizzleDb } from "@/app/config/db";
import { UserSchema } from "@/app/config/db/schema";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

// helper
function apiResponse(success: boolean, message: string, data?: any, status = 200) {
  return Response.json({ success, message, data }, { status });
}

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const { email, motDePasse, nom, prenom, role, telephone } = body;

    // 🔥 Validation
    if (!email || !motDePasse || !nom || !prenom) {
      return apiResponse(false, "Champs obligatoires manquants", null, 400);
    }

    // 🔥 Vérifier si utilisateur existe déjà
    const existingUser = await drizzleDb
      .select()
      .from(UserSchema)
      .where(eq(UserSchema.email, email));

    if (existingUser.length > 0) {
      return apiResponse(false, "Email déjà utilisé", null, 409);
    }

    // 🔐 Hash password
    const hashedpwd = await bcrypt.hash(motDePasse, 10);

    const userData: typeof UserSchema.$inferInsert = {
      id: uuidv4(),
      nom,
      prenom,
      telephone,
      email,
      role,
      motDePasse: hashedpwd,
    };

    const newUser = await drizzleDb
      .insert(UserSchema)
      .values(userData)
      .returning();

    return apiResponse(
      true,
      "Utilisateur créé avec succès",
      { user: newUser[0] },
      201
    );

  } catch (error) {
    console.error(error);

    return apiResponse(
      false,
      "Erreur serveur",
      null,
      500
    );
  }
};

export const GET = async () => {
  try {
    const users = await drizzleDb
      .select({
        id: UserSchema.id,
        nom: UserSchema.nom,
        role: UserSchema.role,
      })
      .from(UserSchema);

    return apiResponse(true, "Liste récupérée", users, 200);

  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};

export const DELETE = async (req: Request) => {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return apiResponse(false, "ID manquant", null, 400);
    }

    const deleted = await drizzleDb
      .delete(UserSchema)
      .where(eq(UserSchema.id, id))
      .returning();

    if (deleted.length === 0) {
      return apiResponse(false, "Utilisateur introuvable", null, 404);
    }

    return apiResponse(true, "Utilisateur supprimé", null, 200);

  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};