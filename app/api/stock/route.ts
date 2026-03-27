import { drizzleDb } from "@/app/config/db";
import { StockSchema } from "@/app/config/db/schema";
import { v4 as uuidv4 } from "uuid";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const {
      date_stock,
      quantite_stock,
      quantite_min_stock,
      prix_unitaire_achat,
      autre_frais,
      observation,
      date_expiration,
      produitId,
      fournisseurId,
      utilisateurId,
      uniteId,
    } = body;

    if (
      !date_stock ||
      !quantite_stock ||
      !quantite_min_stock ||
      !prix_unitaire_achat ||
      !date_expiration ||
      !produitId ||
      !fournisseurId ||
      !utilisateurId ||
      !uniteId
    ) {
      return new Response(
        JSON.stringify({ message: "Champs requis manquants" }),
        {
          status: 400,
        },
      );
    }

    const newStock = await drizzleDb
      .insert(StockSchema)
      .values({
        id: uuidv4(),
        date_stock: new Date(date_stock),
        quantite_stock: Number(quantite_stock),
        quantite_min_stock: Number(quantite_min_stock),
        prix_unitaire_achat: prix_unitaire_achat.toString(),
        autre_frais: autre_frais ? autre_frais.toString() : null,
        observation,
        date_expiration: new Date(date_expiration),
        produitId,
        fournisseurId,
        utilisateurId,
        uniteId,
      })
      .returning();

    return new Response(JSON.stringify({ message: "Stock créée avec succés", data:newStock }));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Erreur de création" }), {
      status: 500,
    });
  }
};

export const GET = async () => {
  try {
    const stocks = await drizzleDb.select().from(StockSchema);

    return new Response( JSON.stringify({
        message: "Liste des stocks récupérée avec succès",
        data: stocks,
      }),
      { status: 200 },);

  } catch (error) {
    return new Response(JSON.stringify({ message: "Erreur de recupération" }), {
      status: 500,
    });
  }
};