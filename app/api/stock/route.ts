import { drizzleDb } from "@/app/config/db";
import {
  StockSchema,
  ProduitSchema,
  FournisseurSchema,
  UniteSchema,
  CategorySchema,
  UserSchema,
} from "@/app/config/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { auth } from "../auth/auth";
import { NextResponse } from "next/server";

function apiResponse(success: boolean, message: string, data?: any, status = 200) {
  return Response.json({ success, message, data }, { status });
}

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const {
      date_stock, quantite_stock, quantite_min_stock,
      prix_unitaire_achat, prix_unitaire_vente, autre_frais,
      observation, date_expiration, produitId, fournisseurId,
      uniteId, categoryId,
    } = body;

    if (!date_stock || !quantite_stock || !quantite_min_stock ||
        !date_expiration || !produitId || !fournisseurId || !uniteId) {
      return apiResponse(false, "Champs requis manquants", null, 400);
    }

    if (prix_unitaire_achat && Number(prix_unitaire_achat) < 0)
      return apiResponse(false, "Prix achat invalide", null, 400);

    if (prix_unitaire_vente && Number(prix_unitaire_vente) < 0)
      return apiResponse(false, "Prix vente invalide", null, 400);

    if (new Date(date_expiration) <= new Date(date_stock))
      return apiResponse(false, "Date d'expiration invalide", null, 400);

    const session = await auth();
    const userId = session?.user?.id;
    const role = (session?.user as any)?.role;
    const isAdmin = role === "admin";

    if (!userId)
      return apiResponse(false, "Utilisateur non authentifié", null, 401);

    const achat = Number(prix_unitaire_achat);
    const vente = Number(prix_unitaire_vente);
    const hasPrices = !isNaN(achat) && !isNaN(vente) && achat > 0 && vente > 0;
    const statut = isAdmin && hasPrices ? "operationnel" : "en_attente";

    const newStock = await drizzleDb
      .insert(StockSchema)
      .values({
        id: uuidv4(),
        date_stock: new Date(date_stock),
        quantite_stock: Number(quantite_stock),
        quantite_restante: Number(quantite_stock),
        quantite_min_stock: Number(quantite_min_stock),
        prix_unitaire_achat: isAdmin && prix_unitaire_achat ? prix_unitaire_achat.toString() : null,
        prix_unitaire_vente: isAdmin && prix_unitaire_vente ? prix_unitaire_vente.toString() : null,
        statut,
        autre_frais: autre_frais ? autre_frais.toString() : null,
        observation,
        date_expiration: new Date(date_expiration),
        produitId: body.produitId,
        fournisseurId: body.fournisseurId,
        utilisateurId: userId,
        uniteId: body.uniteId,
        categoryId: body.categoryId,
      })
      .returning();

    return apiResponse(true, "Stock créé avec succès", newStock[0], 201);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Erreur serveur: " + error?.message });
  }
};

export const GET = async () => {
  try {
    const stocks = await drizzleDb
      .select({
        id: StockSchema.id,
        date_stock: StockSchema.date_stock,
        quantite_stock: StockSchema.quantite_stock,
        quantite_restante: StockSchema.quantite_restante,
        quantite_min_stock: StockSchema.quantite_min_stock,
        prix_unitaire_achat: StockSchema.prix_unitaire_achat,
        prix_unitaire_vente: StockSchema.prix_unitaire_vente,
        statut: StockSchema.statut,
        date_expiration: StockSchema.date_expiration,
        produit: { id: ProduitSchema.id, nom: ProduitSchema.nom, image: ProduitSchema.image },
        fournisseur: { id: FournisseurSchema.id, nom: FournisseurSchema.nom },
        unite: { id: UniteSchema.id, nom: UniteSchema.nom },
        category: { id: CategorySchema.id, nom: CategorySchema.nom },
        utilisateur: { id: UserSchema.id, nom: UserSchema.nom },
      })
      .from(StockSchema)
      .leftJoin(ProduitSchema, eq(StockSchema.produitId, ProduitSchema.id))
      .leftJoin(FournisseurSchema, eq(StockSchema.fournisseurId, FournisseurSchema.id))
      .leftJoin(UniteSchema, eq(StockSchema.uniteId, UniteSchema.id))
      .leftJoin(CategorySchema, eq(StockSchema.categoryId, CategorySchema.id))
      .leftJoin(UserSchema, eq(StockSchema.utilisateurId, UserSchema.id));

    const result = stocks.map((s) => ({
      ...s,
      quantite_vendue: s.quantite_stock - s.quantite_restante,
    }));

    return apiResponse(true, "Liste des stocks récupérée avec succès", result, 200);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Erreur serveur " + error?.message });
  }
};

export const PATCH = async (req: Request) => {
  try {
    const { id, prix_unitaire_achat, prix_unitaire_vente } = await (req.json());
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (role !== "admin")
      return apiResponse(false, "Accès refusé", null, 403);

    if (!prix_unitaire_achat || !prix_unitaire_vente)
      return apiResponse(false, "Les prix sont requis", null, 400);

    await drizzleDb
      .update(StockSchema)
      .set({
        prix_unitaire_achat: Number(prix_unitaire_achat).toString(),
        prix_unitaire_vente: Number(prix_unitaire_vente).toString(),
        statut: "operationnel",
      })
      .where(eq(StockSchema.id, id));

    return apiResponse(true, "Stock validé");
  } catch (error: any) {
    console.error(error);
    return apiResponse(false, "Erreur serveur");
  }
};

export const DELETE = async (req: Request) => {
  try {
    const { id } = await req.json();
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (role !== "admin")
      return apiResponse(false, "Accès refusé", null, 403);

    if (!id)
      return apiResponse(false, "ID manquant", null, 400);

    await drizzleDb
      .update(StockSchema)
      .set({ quantite_restante: 0 })
      .where(eq(StockSchema.id, id));

    return apiResponse(true, "Lot retiré avec succès");
  } catch (error: any) {
    return apiResponse(false, "Erreur serveur");
  }
};