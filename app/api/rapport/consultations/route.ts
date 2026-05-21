import { drizzleDb } from "@/app/config/db";
import { ConsultationSchema, UserSchema } from "@/app/config/db/schema";
import { eq, sql } from "drizzle-orm";

function apiResponse(success: boolean, message: string, data?: any, status = 200) {
  return Response.json({ success, message, data }, { status });
}

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const offset = (page - 1) * limit;

    let dateFilter = sql`1=1`;
    if (dateFrom && dateTo) {
      dateFilter = sql`${ConsultationSchema.date_consultation} >= ${dateFrom}::date
        AND ${ConsultationSchema.date_consultation} < ${dateTo}::date + INTERVAL '1 day'`;
    } else if (dateFrom) {
      dateFilter = sql`${ConsultationSchema.date_consultation} >= ${dateFrom}::date`;
    } else if (dateTo) {
      dateFilter = sql`${ConsultationSchema.date_consultation} < ${dateTo}::date + INTERVAL '1 day'`;
    }

    // Résumé
    const resume = await drizzleDb
      .select({
        totalConsultations: sql<number>`COUNT(*)`,
        revenuTotal: sql<number>`COALESCE(SUM(CAST(${ConsultationSchema.prix} AS NUMERIC)), 0)`,
        prixMoyen: sql<number>`COALESCE(AVG(CAST(${ConsultationSchema.prix} AS NUMERIC)), 0)`,
      })
      .from(ConsultationSchema)
      .where(sql`${dateFilter} AND ${ConsultationSchema.supprime} = false`);

    // Liste consultations
    const consultations = await drizzleDb
      .select({
        id: ConsultationSchema.id,
        nom: ConsultationSchema.nom,
        prenom: ConsultationSchema.prenom,
        diagnostic: ConsultationSchema.diagnostic,
        traitement: ConsultationSchema.traitement,
        prix: ConsultationSchema.prix,
        date_consultation: ConsultationSchema.date_consultation,
        agent: UserSchema.nom,
        agentPrenom: UserSchema.prenom,
      })
      .from(ConsultationSchema)
      .leftJoin(UserSchema, eq(ConsultationSchema.utilisateurId, UserSchema.id))
      .where(sql`${dateFilter} AND ${ConsultationSchema.supprime} = false`)
      .orderBy(sql`${ConsultationSchema.date_consultation} DESC`)
      .limit(limit)
      .offset(offset);

    // Total pages
    const total = await drizzleDb
      .select({ count: sql<number>`COUNT(*)` })
      .from(ConsultationSchema)
      .where(sql`${dateFilter} AND ${ConsultationSchema.supprime} = false`);

    // Par jour
    const parJour = await drizzleDb
      .select({
        date: sql<string>`DATE(${ConsultationSchema.date_consultation})`,
        count: sql<number>`COUNT(*)`,
        total: sql<number>`COALESCE(SUM(CAST(${ConsultationSchema.prix} AS NUMERIC)), 0)`,
      })
      .from(ConsultationSchema)
      .where(sql`${dateFilter} AND ${ConsultationSchema.supprime} = false`)
      .groupBy(sql`DATE(${ConsultationSchema.date_consultation})`)
      .orderBy(sql`DATE(${ConsultationSchema.date_consultation}) ASC`);

    return apiResponse(true, "Rapport consultations récupéré", {
      resume: {
        totalConsultations: Number(resume[0]?.totalConsultations || 0),
        revenuTotal: Number(resume[0]?.revenuTotal || 0),
        prixMoyen: Number(resume[0]?.prixMoyen || 0),
      },
      consultations,
      parJour,
      pagination: {
        page,
        limit,
        total: Number(total[0]?.count || 0),
        totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error(error);
    return apiResponse(false, "Erreur serveur: " + error?.message, null, 500);
  }
};