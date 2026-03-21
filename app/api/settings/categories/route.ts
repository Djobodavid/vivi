import { drizzleDb } from "@/app/config/db";
import { CategorySchema } from "@/app/config/db/schema";
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

    const newCategory = await drizzleDb
      .insert(CategorySchema)
      .values({ id: uuidv4(), nom, description })
      .returning()

    const reponse = {
      message: "Catégorie créée avec succès",
      data: newCategory,
    };
    return new Response(JSON.stringify(reponse), { status: 201 });
  } catch (error) {
    console.error(error);
  }
};


export const GET = async () => {
  try {
    const unites = await drizzleDb.select().from(CategorySchema);

    return new Response(
      JSON.stringify({
        message: "Liste des catégories récupérée avec succès",
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

export const PUT = async (req: Request) => {
  try {
    const { id, nom, description } = await req.json();

    if (!id) return new Response(JSON.stringify({ message: "ID manquant" }), { status: 400 });

    await drizzleDb.update(CategorySchema)
      .set({ nom, description })
      .where(eq(CategorySchema.id, id));

    return new Response(JSON.stringify({ message: "Catégorie modifiée avec succès" }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
};


export const DELETE = async (req: Request) => {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ message: "ID de la catégorie manquant" }),
        { status: 400 }
      );
    }

    await drizzleDb
      .delete(CategorySchema)
      .where(eq(CategorySchema.id, id));

    return new Response(
      JSON.stringify({ message: "Catégorie supprimée avec succès" }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Erreur serveur lors de la suppression" }),
      { status: 500 }
    );
  }
};

