import { drizzleDb } from "@/app/config/db";
import { ClientSchema } from "@/app/config/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { nom, adresse, telephone } = body;

    if (!nom || !adresse || !telephone) {
      return new Response(JSON.stringify({ message: "Données invalides" }), {
        status: 400,
      });
    }

    const newClient = await drizzleDb
      .insert(ClientSchema)
      .values({ id: uuidv4(), nom, adresse, telephone })
      .returning();

    const reponse = {
      message: "Client créée avec succès",
      data: newClient,
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
    const clients = await drizzleDb.select().from(ClientSchema);

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
    const { id, nom, adresse, telephone } = await req.json();

    if (!id)
      return new Response(JSON.stringify({ message: "ID manquant" }), {
        status: 400,
      });

    await drizzleDb
      .update(ClientSchema)
      .set({ nom, adresse, telephone })
      .where(eq(ClientSchema.id, id));

    return new Response(
      JSON.stringify({ message: "client modifié avec succès" }),
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

    await drizzleDb.delete(ClientSchema).where(eq(ClientSchema.id, id));

    return new Response(
      JSON.stringify({ message: "Client supprimée avec succès" }),
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
