import { drizzleDb } from "@/app/config/db";
import { UserSchema } from "@/app/config/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { email, motDePasse } = body;

    // Vérification des champs
    if (!email || !motDePasse) {
      return Response.json(
        {
          success: false,
          message: "Email et mot de passe requis",
        },
        { status: 400 }
      );
    }

    // Chercher utilisateur
    const users = await drizzleDb
      .select()
      .from(UserSchema)
      .where(eq(UserSchema.email, email));

    if (users.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Utilisateur non trouvé",
        },
        { status: 404 }
      );
    }

    const utilisateur = users[0];

    // Vérifier mot de passe
    const isPasswordValid = await bcrypt.compare(
      motDePasse,
      utilisateur.motDePasse
    );

    if (!isPasswordValid) {
      return Response.json(
        {
          success: false,
          message: "Mot de passe incorrect",
        },
        { status: 401 }
      );
    }

    // Succès
    return Response.json(
      {
        success: true,
        message: "Connexion réussie",
        data: {
          email: utilisateur.email,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error(error); // important pour debug serveur

    return Response.json(
      {
        success: false,
        message: "Erreur serveur",
        error: (error as Error).message, // optionnel en prod
      },
      { status: 500 }
    );
  }
};