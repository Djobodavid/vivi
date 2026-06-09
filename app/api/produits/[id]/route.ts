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
