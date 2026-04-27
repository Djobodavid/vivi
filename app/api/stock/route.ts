import { drizzleDb } from "@/app/config/db";
import {
  StockSchema,
  ProduitSchema,
  FournisseurSchema,
  UniteSchema,
  CategorySchema,
} from "@/app/config/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { auth } from "../auth/auth";
import { NextResponse } from "next/server";

function apiResponse(
  success: boolean,
  message: string,
  data?: any,
  status = 200,
) {
  return Response.json({ success, message, data }, { status });
}

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const {
      date_stock,
      quantite_stock,
      quantite_min_stock,
      prix_unitaire_achat,
      prix_unitaire_vente,
      autre_frais,
      observation,
      date_expiration,
      produitId,
      fournisseurId,
      uniteId,
    } = body;

    // 🔥 validation champs
    if (
      !date_stock ||
      !quantite_stock ||
      !quantite_min_stock ||
      !prix_unitaire_achat ||
      !prix_unitaire_vente||
      !date_expiration ||
      !produitId ||
      !fournisseurId ||
      !uniteId
    ) {
      return apiResponse(false, "Champs requis manquants", null, 400);
    }

    // 🔥 validation logique
    if (Number(quantite_stock) < 0 || Number(quantite_min_stock) < 0) {
      return apiResponse(false, "Quantité invalide", null, 400);
    }

    if (Number(prix_unitaire_achat) < 0) {
      return apiResponse(false, "Prix invalide", null, 400);
    }

    if (new Date(date_expiration) <= new Date(date_stock)) {
      return apiResponse(false, "Date d'expiration invalide", null, 400);
    }

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return apiResponse(false, "Utilisateur non authentifié", null, 401);
    }

    const newStock = await drizzleDb
      .insert(StockSchema)
      .values({
        id: uuidv4(),
        date_stock: new Date(date_stock),
        quantite_stock: Number(quantite_stock),
        quantite_min_stock: Number(quantite_min_stock),
        prix_unitaire_achat: prix_unitaire_achat.toString(),
        prix_unitaire_vente: prix_unitaire_vente.toString(),
        autre_frais: autre_frais ? autre_frais.toString() : null,
        observation,
        date_expiration: new Date(date_expiration),
        produitId: body.produitId,
        fournisseurId: body.fournisseurId,
        utilisateurId: userId,
        uniteId: body.uniteId,
        categoryId: body.categoryId
      })
      .returning();
    console.log(newStock);
    return apiResponse(true, "Stock créé avec succès", newStock[0], 201);
  } catch (error:any) {
    console.error(error);
    return NextResponse.json({success:false, message:"Erreur serveur"+error?.message, data:null});
  }
};

export const GET = async () => {
  try {
    const stocks = await drizzleDb
      .select({
        id: StockSchema.id,
        date_stock: StockSchema.date_stock,
        quantite_stock: StockSchema.quantite_stock,
        quantite_min_stock: StockSchema.quantite_min_stock,
        prix_unitaire_achat: StockSchema.prix_unitaire_achat,
        prix_unitaire_vente: StockSchema.prix_unitaire_vente,
        date_expiration: StockSchema.date_expiration,

        produit: {
          id: ProduitSchema.id,
          nom: ProduitSchema.nom,
          image: ProduitSchema.image,
        },

        fournisseur: {
          id: FournisseurSchema.id,
          nom: FournisseurSchema.nom,
        },

        unite: {
          id: UniteSchema.id,
          nom: UniteSchema.nom,
        },

        category: {
          id: CategorySchema.id,
          nom: CategorySchema.nom,
        },

      })
      .from(StockSchema)

      // 🔥 JOIN produit
      .leftJoin(
        ProduitSchema,
        eq(StockSchema.produitId, ProduitSchema.id),
      )

      // 🔥 JOIN fournisseur
      .leftJoin(
        FournisseurSchema,
        eq(StockSchema.fournisseurId, FournisseurSchema.id),
      )

      // 🔥 JOIN unité
      .leftJoin(
        UniteSchema,
        eq(StockSchema.uniteId, UniteSchema.id),
      )

      .leftJoin(
        CategorySchema,
        eq(StockSchema.categoryId, CategorySchema.id),
      )
 
    return apiResponse(
      true,
      "Liste des stocks récupérée avec succès",
      stocks,
      200,
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: "Erreur serveur " + error?.message,
      data: null,
    });
  }
};