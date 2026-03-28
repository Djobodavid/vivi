import { drizzleDb } from "@/app/config/db";
import { ProduitSchema } from "@/app/config/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { nom, image } = body;
    if (!nom) {
      return new Response(JSON.stringify({ message: "Le nom est requis" }), {
        status: 400,
      });
    }

    const newProduit = await drizzleDb
      .insert(ProduitSchema)
      .values({ id: uuidv4(), nom, image })
      .returning();

    const reponse = {
      message: "Produit enrégistré avec succès",
      data: newProduit,
    };
    return new Response(JSON.stringify(reponse), { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Erreur lors de l'enrégistrement du produit" },
      { status: 500 },
    );
  }
};

export const GET = async () => {
  try {
    const produit = await drizzleDb.select().from(ProduitSchema);

    return new Response(
      JSON.stringify({
        message: "Liste des produit récupérée avec succès",
        data: produit,
      }),
      { status: 200 },
    );
  } catch (error) {}
};

export const PUT = async (req: Request) => {
  try {
    const body = await req.json();
    const { id, nom, image } = body;
    if (!id)
      return new Response(JSON.stringify({ message: "ID manquant" }), {
        status: 400,
      });

    await drizzleDb
      .update(ProduitSchema)
      .set({ id: uuidv4(), nom, image })
      .where(eq(ProduitSchema.id, id));
    return new Response(
      JSON.stringify({ message: "Produit modifié avec succès" }),
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Erreur dans la modification du produit" }),
      {
        status: 500,
      },
    );
  }
};

export const DELETE = async (req: Request) => {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ message: "ID du produit manquant" }),
        { status: 400 },
      );
    }

    await drizzleDb
    .delete(ProduitSchema)
    .where(eq(ProduitSchema.id, id))

    return new Response(
      JSON.stringify({ message: "Produit supprimé avec succès" }),
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
