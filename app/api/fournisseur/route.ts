import { drizzleDb } from "@/app/config/db";
import { FournisseurSchema } from "@/app/config/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { nom, addresse, telephone } = body;

    if (!nom || !addresse || !telephone) {
      return new Response(JSON.stringify({ message: "Données invalides" }), {
        status: 400,
      });
    }

    const newFournisseur = await drizzleDb
      .insert(FournisseurSchema)
      .values({ id: uuidv4(), nom, addresse, telephone })
      .returning();

    const reponse = {
      message: "Fournisseur créée avec succès",
      data: newFournisseur,
    };
    return new Response(JSON.stringify(reponse), { status: 201 });
  } catch (error) {
    console.error(error);
     return Response.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
};

export const GET = async () => {
  try {
    const clients = await drizzleDb.select().from(FournisseurSchema);

    return new Response(
      JSON.stringify({
        message: "Liste des clients récupérée avec succès",
        data: clients,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return new Response(JSON.stringify({ message: "Erreur serveur" }), {
      status: 500,
    });
  }
};

export const PUT = async (req: Request) => {
  try {
    const { id, nom, addresse, telephone } = await req.json();

    if (!id)
      return new Response(JSON.stringify({ message: "ID manquant" }), {
        status: 400,
      });

    await drizzleDb
      .update(FournisseurSchema)
      .set({ nom, addresse, telephone })
      .where(eq(FournisseurSchema.id, id));

    return new Response(
      JSON.stringify({ message: "Fournisseur modifié avec succès" }),
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), {
      status: 500,
    });
  }
};

export const DELETE = async (req: Request) => {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ message: "ID du client manquant" }),
        { status: 400 },
      );
    }

    await drizzleDb.delete(FournisseurSchema).where(eq(FournisseurSchema.id, id));

    return new Response(
      JSON.stringify({ message: "Fournisseur supprimée avec succès" }),
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Erreur serveur lors de la suppression" }),
      { status: 500 },
    );
  }
};
