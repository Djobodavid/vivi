import { drizzleDb } from "@/app/config/db";
import { UserSchema } from "@/app/config/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import  jwt from "jsonwebtoken";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { email, motDePasse } = body;

    // chercher utilisateur
    const user = await drizzleDb
      .select()
      .from(UserSchema)
      .where(eq(UserSchema.email, email));

    if (user.length === 0) {
      return new Response(
        JSON.stringify({ message: "Utilisateur non trouvé" }),
        { status: 404 }
      );
    }

    const utilisateur = user[0];

    // comparer mot de passe
    const isPasswordValid = await bcrypt.compare(
      motDePasse,
      utilisateur.motDePasse
    );

    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ message: "Mot de passe incorrect" }),
        { status: 401 }
      );
    }

     // 🔹 Générer JWT
    const token = jwt.sign(
      {
        id: utilisateur.id,
        email: utilisateur.email,
      },
      process.env.JWT_SECRET!, // ton secret depuis .env
      { expiresIn: "1d" } // durée de validité
    );

    // Retourner le token
    return new Response(
      JSON.stringify({
        message: "Connexion réussie",
        user: {
          id: utilisateur.id,
          email: utilisateur.email,
          nom: utilisateur.nom, // selon ce que tu veux exposer
        },
        token,
      }),
      { status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Erreur lors de la connexion",
        error,
      }),
      { status: 500 }
    );
  }
};