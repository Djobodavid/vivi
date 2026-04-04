import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function middleware(req: NextRequest) {
  // 1. Récupérer le header Authorization
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ message: "Token manquant" }, { status: 401 });
  }

  // 2. Extraire le token
  const token = authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) {
    return NextResponse.json({ message: "Token invalide" }, { status: 403 });
  }

  try {
    // 3. Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // 4. Tu peux ajouter les infos décodées dans l'en-tête si besoin
    req.headers.set("x-user-id", (decoded as any).id);

    return NextResponse.next(); // tout est ok
  } catch (err) {
    return NextResponse.json({ message: "Token invalide ou expiré" }, { status: 403 });
  }
}

// 5. Appliquer le middleware aux routes protégées
export const config = {
  matcher: ["/api/protected/:path*"], // toutes les routes sous /api/protected
};