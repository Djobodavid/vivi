import { drizzleDb } from "@/app/config/db";
import { StockSchema } from "@/app/config/db/schema";
import { asc, sql } from "drizzle-orm";

function apiResponse(success: boolean, message: string, data?: any, status = 200) {
  return Response.json({ success, message, data }, { status });
}

export const POST = async (req: Request) => {
  try {
    const { items } = await req.json();

    if (!items || items.length === 0) {
      return apiResponse(false, "Panier vide", null, 400);
    }

    let totalReel = 0;
    const details: { nom?: string; productId: string; quantite: number; prixUnitaire: number; total: number }[] = [];

   for (const item of items) {
  let quantityToSell = Number(item.quantity);

  const stocks = await drizzleDb
    .select()
    .from(StockSchema)
    .where(
      sql`${StockSchema.produitId} = ${item.productId}
      AND ${StockSchema.date_expiration} > NOW()
      AND ${StockSchema.statut} = 'operationnel'`
    )
    .orderBy(asc(StockSchema.date_expiration)); // ✅ même ordre que vente

  let totalProduit = 0;
  let detailLots: string[] = [];

  for (const stock of stocks) {
    if (quantityToSell <= 0) break;
    if (Number(stock.quantite_restante) <= 0) continue;

    const used = Math.min(Number(stock.quantite_restante), quantityToSell);
    const prixReel = Number(stock.prix_unitaire_vente);
    const totalLigne = used * prixReel;

    totalProduit += totalLigne;
    totalReel += totalLigne;
    detailLots.push(`${used} × ${prixReel}`);

    quantityToSell -= used;
  }

  // ✅ Une seule ligne par produit avec le vrai total
  details.push({
    productId: item.productId,
    nom: item.nom,
    quantite: Number(item.quantity),
    prixUnitaire: totalProduit / Number(item.quantity), // prix moyen affiché
    total: totalProduit,
  });

  if (quantityToSell > 0) {
    return apiResponse(false, `Stock insuffisant`, null, 400);
  }
}

    return apiResponse(true, "Aperçu calculé", { totalReel, details }, 200);
  } catch (error: any) {
    return apiResponse(false, "Erreur serveur: " + error?.message, null, 500);
  }
};