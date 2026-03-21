import { drizzleDb } from "@/app/config/db";
import { UniteSchema } from "@/app/config/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { nom, description } = body;

    if (!nom || !description) {
      return new Response(
        JSON.stringify({ message: "Données invalides" }),
        { status: 400 }
      );
    }

    const newUnite = await drizzleDb
      .insert(UniteSchema)
      .values({ id: uuidv4(), nom, description })
      .returning()

    return new Response(
      JSON.stringify({ message: "Unité créée", data: newUnite }),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Erreur serveur" }),
      { status: 500 }
    );
  }
};


export const GET = async () => {
  try {
    const unites = await drizzleDb.select().from(UniteSchema);

    return new Response(
      JSON.stringify({
        message: "Liste des unités récupérée avec succès",
        data: unites,
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

export const DELETE = async (req: Request) => {
  try {
    const body = await req.json(); // On récupère l'id depuis le corps
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ message: "ID manquant" }), { status: 400 });
    }

    await drizzleDb
      .delete(UniteSchema)
      .where(eq(UniteSchema.id, id));

    return new Response(
      JSON.stringify({ message: "Unité supprimée avec succès" }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Erreur lors de la suppression", error }),
      { status: 500 }
    );
  }
};

