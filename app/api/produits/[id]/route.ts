import { drizzleDb } from "@/app/config/db";
import { ProduitSchema } from "@/app/config/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

function apiResponse(
  success: boolean,
  message: string,
  data?: any,
  status = 200,
) {
  return Response.json({ success, message, data }, { status });
}

export const GET = async (params: Promise<{ id: string }>) => {
  try {
    const { id } = await params;

    const produits = await drizzleDb.query.ProduitSchema.findFirst(
    {
        where:eq(ProduitSchema.id, id)
    }
    )
      /* .select()
      .from(ProduitSchema)
      .where(); */
if(!produits) return null
    return NextResponse.json(produits);
  } catch (error: any) {
    console.error(error);
    return null;
  }
};
