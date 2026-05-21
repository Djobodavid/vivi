"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { toast } from "react-toastify";

type Consultation = {
  id: string;
  nom: string;
  prenom: string;
  diagnostic: string;
  traitement: string;
  prix: string;
  date_consultation: string;
  agent: string;
  agentPrenom: string;
};

type Resume = {
  totalConsultations: number;
  revenuTotal: number;
  prixMoyen: number;
};

const Page = () => {
  const { status } = useSession();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const formatFCFA = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";

  const loadRapport = async () => {
    try {
      setLoading(true);
      let url = `/api/rapport/consultations?page=${page}&`;
      if (dateFrom) url += `dateFrom=${dateFrom}&`;
      if (dateTo) url += `dateTo=${dateTo}&`;
      const res = await axios.get(url);
      if (res.data.success) {
        setConsultations(res.data.data.consultations);
        setResume(res.data.data.resume);
        setTotalPages(res.data.data.pagination.totalPages);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") loadRapport();
    if (status === "unauthenticated") redirect("/");
  }, [status, page]);

  const exportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const rows = consultations.map((c) => ({
        Date: new Date(c.date_consultation).toLocaleString("fr-FR"),
        Nom: c.nom,
        Prénom: c.prenom,
        Diagnostic: c.diagnostic,
        Traitement: c.traitement,
        Prix: c.prix,
        Agent: `${c.agentPrenom} ${c.agent}`,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Consultations");
      XLSX.writeFile(wb, `rapport_consultations_${dateFrom || "all"}.xlsx`);
    } catch (error) {
      toast.error("Erreur export Excel");
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Rapport des consultations</h1>
        <div className="flex gap-2">
          <button onClick={exportExcel} className="btn btn-sm btn-success">
            ⬇ Excel
          </button>
          <button
            onClick={() => window.print()}
            className="btn btn-sm btn-error"
          >
            ⬇ PDF
          </button>
        </div>
      </div>

      {/* FILTRES */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <input
          aria-label="text"
          type="date"
          className="input input-bordered input-sm"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <span className="text-sm text-gray-500">→</span>
        <input
          aria-label="text"
          type="date"
          className="input input-bordered input-sm"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <button onClick={loadRapport} className="btn btn-sm btn-primary">
          Filtrer
        </button>
        <button
          onClick={() => {
            setDateFrom("");
            setDateTo("");
            loadRapport();
          }}
          className="btn btn-sm btn-outline"
        >
          Reset
        </button>
      </div>

      {/* RÉSUMÉ */}
      {resume && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat bg-base-100 border border-base-300 rounded-2xl">
            <div className="stat-title">Total consultations</div>
            <div className="stat-value text-2xl" style={{ color: "#3B6D11" }}>
              {resume.totalConsultations}
            </div>
          </div>
          <div className="stat bg-base-100 border border-base-300 rounded-2xl">
            <div className="stat-title">Revenu total</div>
            <div className="stat-value text-xl" style={{ color: "#3B6D11" }}>
              {formatFCFA(resume.revenuTotal)}
            </div>
          </div>
          <div className="stat bg-base-100 border border-base-300 rounded-2xl">
            <div className="stat-title">Prix moyen</div>
            <div className="stat-value text-xl">
              {formatFCFA(resume.prixMoyen)}
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : consultations.length === 0 ? (
        <p className="text-center text-gray-400 py-10">
          Aucune consultation sur cette période
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra border border-base-300 w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Diagnostic</th>
                <th>Traitement</th>
                <th>Agent</th>
                <th>Prix</th>
                <th>Détail</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => (
                <React.Fragment key={c.id}>
                  <tr>
                    <td className="text-sm">
                      {new Date(c.date_consultation).toLocaleString("fr-FR")}
                    </td>
                    <td className="text-sm font-semibold">
                      {c.nom} {c.prenom}
                    </td>
                    <td className="text-sm max-w-xs truncate">
                      {c.diagnostic}
                    </td>
                    <td className="text-sm max-w-xs truncate">
                      {c.traitement}
                    </td>
                    <td className="text-sm">
                      {c.agentPrenom} {c.agent}
                    </td>
                    <td className="font-bold text-sm">
                      {formatFCFA(Number(c.prix))}
                    </td>
                    <td>
                      <button
                        className="btn btn-xs btn-ghost text-primary"
                        onClick={() =>
                          setExpandedId(expandedId === c.id ? null : c.id)
                        }
                      >
                        {expandedId === c.id ? "Fermer" : "Voir"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === c.id && (
                    <tr>
                      <td colSpan={7} className="bg-base-200">
                        <div className="p-4 space-y-2">
                          <p>
                            <span className="font-semibold">
                              Diagnostic complet:
                            </span>{" "}
                            {c.diagnostic}
                          </p>
                          <p>
                            <span className="font-semibold">
                              Traitement complet:
                            </span>{" "}
                            {c.traitement}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 mt-4">
        <button
          className="btn btn-sm"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Précédent
        </button>
        <span className="px-2">
          Page {page} / {totalPages}
        </span>
        <button
          className="btn btn-sm"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default Page;
