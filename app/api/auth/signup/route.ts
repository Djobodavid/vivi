import { drizzleDb } from "@/app/config/db/index";
import { UserSchema } from "@/app/config/db/schema";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export const POST = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return new Response(JSON.stringify({ message: "Données invalides" }), {
        status: 400,
      });
    }
    const { email, motDePasse, id, nom, prenom, role, telephone, image } =
      (req.body || (await req.json())) as any;
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
    const newUser = drizzleDb.insert(UserSchema).values(userData).returning();
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
      }),
      { status: 500 },
    );
  }
};

