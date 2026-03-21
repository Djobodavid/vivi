import { drizzleDb } from "@/app/config/db/index";
import { UserSchema } from "@/app/config/db/schema";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export const POST = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return new Response(JSON.stringify({ message: "Données invalides" }), {
        status: 400,
      });
    }
    const body = await req.json();
    console.log("BODY REÇU :", body);

    const { email, motDePasse, nom, prenom, role, telephone } = body;

    const hashedpwd = await bcrypt.hash(motDePasse, 10);

    const userData: typeof UserSchema.$inferInsert = {
      id: uuidv4(),
      nom: nom,
      prenom: prenom,
      telephone: telephone,
      email: email,
      role: role,
      motDePasse: hashedpwd,
    };
    const newUser = await drizzleDb
      .insert(UserSchema)
      .values(userData)
      .returning();
    const reponse = {
      message: "Utilisateur créé avec succès",
      data: newUser,
    };
    return new Response(JSON.stringify(reponse), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Erreur lors de la création de l'utilisateur",
        error,
        console: console.error(error),
      }),
      { status: 500 },
    );
  }
};

export const GET = async () => {
  try {
    const users = await drizzleDb
      .select({ id: UserSchema.id, nom: UserSchema.nom, role: UserSchema.role })
      .from(UserSchema);

    return new Response(
      JSON.stringify({
        message: "Liste des utilisateurs récupérée avec succès",
        data: users,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Erreur serveur", error }),
      { status: 500 }
    );
  }
};

export const DELETE = async (req: Request) => {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ message: "ID manquant" }), { status: 400 });
    }

    await drizzleDb
      .delete(UserSchema)
      .where(eq(UserSchema.id, id));

    return new Response(
      JSON.stringify({ message: "Utilisateur supprimé avec succès" }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Erreur suppression", error }),
      { status: 500 }
    );
  }
};