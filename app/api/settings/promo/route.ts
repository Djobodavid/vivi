import { drizzleDb } from "@/app/config/db";
import {
  PromotionSchema,
  ProduitSchema,
} from "@/app/config/db/schema";
import { eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

function apiResponse(success: boolean, message: string, data?: any, status = 200) {
  return Response.json({ success, message, data }, { status });
}

export const GET = async () => {
  try {
    const promos = await drizzleDb
      .select({
        id: PromotionSchema.id,
        reduction: PromotionSchema.reduction,
        typeReduction: PromotionSchema.typeReduction,
        dateDebut: PromotionSchema.dateDebut,
        dateFin: PromotionSchema.dateFin,
        createdAt: PromotionSchema.createdAt,
        produit: ProduitSchema.nom,
        produitId: PromotionSchema.produitId,
        // ✅ est-ce que la promo est active maintenant ?
        active: sql<boolean>`
          NOW() BETWEEN ${PromotionSchema.dateDebut} AND ${PromotionSchema.dateFin}
        `,
      })
      .from(PromotionSchema)
      .leftJoin(ProduitSchema, eq(PromotionSchema.produitId, ProduitSchema.id))
      .orderBy(sql`${PromotionSchema.dateDebut} DESC`);

    return apiResponse(true, "Promotions récupérées", promos);
  } catch (error: any) {
    return apiResponse(false, "Erreur serveur: " + error?.message, null, 500);
  }
};

export const POST = async (req: Request) => {
  try {
    const { produitId, reduction, typeReduction, dateDebut, dateFin } =
      await req.json();

    if (!produitId || !reduction || !typeReduction || !dateDebut || !dateFin) {
      return apiResponse(false, "Champs requis manquants", null, 400);
    }

    if (new Date(dateFin) <= new Date(dateDebut)) {
      return apiResponse(false, "Date de fin invalide", null, 400);
    }

    if (typeReduction === "pourcentage" && (reduction < 1 || reduction > 100)) {
      return apiResponse(false, "Pourcentage invalide (1-100)", null, 400);
    }

    // ✅ Vérifier qu'il n'y a pas déjà une promo active sur ce produit
    const existing = await drizzleDb
      .select()
      .from(PromotionSchema)
      .where(
        sql`${PromotionSchema.produitId} = ${produitId}
        AND NOW() BETWEEN ${PromotionSchema.dateDebut} AND ${PromotionSchema.dateFin}`
      );

    if (existing.length > 0) {
      return apiResponse(false, "Ce produit a déjà une promotion active", null, 409);
    }

    const newPromo = await drizzleDb
      .insert(PromotionSchema)
      .values({
        id: uuidv4(),
        produitId,
        reduction,
        typeReduction,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
      })
      .returning();

    return apiResponse(true, "Promotion créée avec succès", newPromo[0], 201);
  } catch (error: any) {
    return apiResponse(false, "Erreur serveur: " + error?.message, null, 500);
  }
};

export const DELETE = async (req: Request) => {
  try {
    const { id } = await req.json();

    if (!id) return apiResponse(false, "ID manquant", null, 400);

    await drizzleDb
      .delete(PromotionSchema)
      .where(eq(PromotionSchema.id, id));

    return apiResponse(true, "Promotion supprimée");
  } catch (error: any) {
    return apiResponse(false, "Erreur serveur: " + error?.message, null, 500);
  }
};

export const PUT = async (req: Request) => {
  try {
    const { id, reduction, typeReduction, dateDebut, dateFin } =
      await req.json();

    if (!id) return apiResponse(false, "ID manquant", null, 400);

    const updated = await drizzleDb
      .update(PromotionSchema)
      .set({
        reduction,
        typeReduction,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
      })
      .where(eq(PromotionSchema.id, id))
      .returning();

    return apiResponse(true, "Promotion modifiée", updated[0]);
  } catch (error: any) {
    return apiResponse(false, "Erreur serveur: " + error?.message, null, 500);
  }
};