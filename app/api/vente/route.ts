import { drizzleDb } from "@/app/config/db";
import {
  StockSchema,
  ProduitSchema,
  CategorySchema,
  VenteItemSchema,
  VenteSchema,
} from "@/app/config/db/schema";
import { asc, eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

function apiResponse(
  success: boolean,
  message: string,
  data?: any,
  status = 200,
) {
  return Response.json({ success, message, data }, { status });
}

export const GET = async () => {
  try {
    const produits = await drizzleDb
      .select({
        produitId: StockSchema.produitId,
        nom: ProduitSchema.nom,
        image: ProduitSchema.image,
        categoryNom: CategorySchema.nom,
        stock_total: sql<number>`SUM(${StockSchema.quantite_stock})`,
        prix_min: sql<number>`MIN(${StockSchema.prix_unitaire_vente})`,
        prix_max: sql<number>`MAX(${StockSchema.prix_unitaire_vente})`,
      })
      .from(StockSchema)
      .where(sql`${StockSchema.date_expiration} > NOW()`)
      .leftJoin(
        ProduitSchema,
        sql`${StockSchema.produitId} = ${ProduitSchema.id}`,
      )
      .leftJoin(
        CategorySchema,
        sql`${StockSchema.categoryId} = ${CategorySchema.id}`,
      )
      .groupBy(
        StockSchema.produitId,
        ProduitSchema.nom,
        ProduitSchema.image,
        CategorySchema.nom,
      )
      .having(sql`SUM(${StockSchema.quantite_stock}) > 0`);

    return apiResponse(
      true,
      "Produits caisse récupérés avec succès",
      produits,
      200,
    );
  } catch (error) {
    console.error(error);
    return apiResponse(false, "Erreur serveur", null, 500);
  }
};

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const { items, total, clientId, modePaiement, montantRecu, utilisateurId } =
      body;

    // 🔥 VALIDATION
    if (!items || items.length === 0) {
      return apiResponse(false, "Panier vide", null, 400);
    }

    if (!total || Number(total) <= 0) {
      return apiResponse(false, "Total invalide", null, 400);
    }

    if (Number(montantRecu) < Number(total)) {
      return apiResponse(false, "Montant insuffisant", null, 400);
    }

    return await drizzleDb.transaction(async (tx) => {
      const venteId = uuidv4();

      // 🔥 1. CREATION VENTE
      await tx.insert(VenteSchema).values({
        id: venteId,
        total: String(total),
        clientId: clientId || null,
        mode_paiement: modePaiement || "cash",
        montant_recu: String(montantRecu),
        monnaie_rendue: String(Number(montantRecu) - Number(total)),
        utilisateurId,
      });

      // 🔥 2. TRAITEMENT PRODUITS
      for (const item of items) {
        let quantityToSell = Number(item.quantity);

        const stocks = await tx
          .select()
          .from(StockSchema)
          .where(
            sql`${StockSchema.produitId} = ${item.productId}
        AND ${StockSchema.date_expiration} > NOW()`,
          )
          .orderBy(asc(StockSchema.date_stock));

        for (const stock of stocks) {
          if (quantityToSell <= 0) break;

          if (Number(stock.quantite_stock) <= 0) continue;

          const used = Math.min(Number(stock.quantite_stock), quantityToSell);

          // 🔥 INSERT VENTE ITEM (⚠️ PAS DE id → auto)
          await tx.insert(VenteItemSchema).values({
            venteId: venteId,
            produitId: item.productId,
            stockId: stock.id,
            quantite: used,
            prix_unitaire: String(stock.prix_unitaire_vente),
            total: String(used * Number(stock.prix_unitaire_vente)),
          });

          // 🔥 UPDATE STOCK
          await tx
            .update(StockSchema)
            .set({
              quantite_stock: sql`${StockSchema.quantite_stock} - ${used}`,
            })
            .where(eq(StockSchema.id, stock.id));

          quantityToSell -= used;
        }

        // 🔥 SECURITE
        if (quantityToSell > 0) {
          throw new Error(
            `Stock insuffisant pour le produit ${item.productId}`,
          );
        }
      }

      return apiResponse(true, "Vente enregistrée avec succès", null, 201);
    });
  } catch (error: any) {
    console.error(error);
    return apiResponse(false, "Erreur serveur: " + error?.message, null, 500);
  }
};
