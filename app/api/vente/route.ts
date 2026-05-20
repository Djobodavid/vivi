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
        stock_total: sql<number>`SUM(${StockSchema.quantite_restante})`,
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
      .having(sql`SUM(${StockSchema.quantite_restante}) > 0`);

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
    const { items, clientId, modePaiement, montantRecu, utilisateurId } = body;

    if (!items || items.length === 0) {
      return apiResponse(false, "Panier vide", null, 400);
    }

    return await drizzleDb.transaction(async (tx) => {
      const venteId = uuidv4();
      let totalReel = 0;

      const venteItems: {
        produitId: string;
        stockId: string;
        quantite: number;
        prixUnitaire: number;
        totalLigne: number;
      }[] = [];

      // 🔥 ÉTAPE 1 — Calcul FIFO SANS toucher au stock
      for (const item of items) {
        let quantityToSell = Number(item.quantity);

        const stocks = await tx
          .select()
          .from(StockSchema)
          .where(
            sql`${StockSchema.produitId} = ${item.productId}
            AND ${StockSchema.date_expiration} > NOW()
            AND ${StockSchema.statut} = 'operationnel'`
          )
          .orderBy(asc(StockSchema.date_expiration));

        for (const stock of stocks) {
          if (quantityToSell <= 0) break;
          if (Number(stock.quantite_restante) <= 0) continue;

          const used = Math.min(Number(stock.quantite_restante), quantityToSell);
          const prixReel = Number(stock.prix_unitaire_vente);
          const totalLigne = used * prixReel;

          totalReel += totalLigne;
          venteItems.push({
            produitId: item.productId,
            stockId: stock.id,
            quantite: used,
            prixUnitaire: prixReel,
            totalLigne,
          });

          quantityToSell -= used;
        }

        if (quantityToSell > 0) {
          throw new Error(`Stock insuffisant pour le produit ${item.productId}`);
        }
      }

      // ✅ ÉTAPE 2 — Valider le montant AVANT de toucher au stock
      if (modePaiement !== "credit" && Number(montantRecu) < totalReel) {
        throw new Error(`Montant insuffisant. Total réel : ${totalReel} FCFA`);
      }

      // 🔥 ÉTAPE 3 — Décrémenter le stock SEULEMENT si montant OK
      for (const vi of venteItems) {
        await tx
          .update(StockSchema)
          .set({
            quantite_restante: sql`${StockSchema.quantite_restante} - ${vi.quantite}`,
          })
          .where(eq(StockSchema.id, vi.stockId));
      }

      // 🔥 ÉTAPE 4 — Créer la vente
      await tx.insert(VenteSchema).values({
        id: venteId,
        total: String(totalReel),
        clientId: clientId || null,
        mode_paiement: modePaiement || "cash",
        montant_recu: String(montantRecu),
        monnaie_rendue: String(Number(montantRecu) - totalReel),
        utilisateurId,
      });

      // 🔥 ÉTAPE 5 — Insérer les lignes
      for (const vi of venteItems) {
        await tx.insert(VenteItemSchema).values({
          venteId,
          produitId: vi.produitId,
          stockId: vi.stockId,
          quantite: vi.quantite,
          prix_unitaire: String(vi.prixUnitaire),
          total: String(vi.totalLigne),
        });
      }

      return apiResponse(true, "Vente enregistrée avec succès", { total: totalReel }, 201);
    });
  } catch (error: any) {
    console.error(error);
    return apiResponse(false, "Erreur serveur: " + error?.message, null, 500);
  }
};