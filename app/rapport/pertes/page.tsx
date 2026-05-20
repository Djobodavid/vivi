"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { toast } from "react-toastify";

type Perte = {
  id: string;
  date_expiration: string;
  date_stock: string;
  quantite_restante: number;
  prix_unitaire_achat: string;
  prix_unitaire_vente: string;
  produit: string;
  categorie: string;
  fournisseur: string;
  agent: string;
  agentPrenom: string;
  valeurPerdue: number;
  valeurVentePerdue: number;
};

type Resume = {
  totalLots: number;
  totalUnites: number;
  valeurPerdue: number;
  valeurVentePerdue: number;
};

const Page = () => {
  const { status } = useSession();
  const [pertes, setPertes] = useState<Perte[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const formatFCFA = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";

  const loadRapport = async () => {
    try {
      setLoading(true);
      let url = `/api/rapport/pertes?page=${page}&limit=${limit}`;
      if (dateFrom) url += `&dateFrom=${dateFrom}`;
      if (dateTo) url += `&dateTo=${dateTo}`;
      const res = await axios.get(url);
      if (res.data.success) {
        setPertes(res.data.data.pertes);
        setResume(res.data.data.resume);
        setTotalPages(res.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") loadRapport();
    if (status === "unauthenticated") redirect("/");
  }, [status, page]);

  const handleFilter = () => { setPage(1); loadRapport(); };

  const exportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const rows = pertes.map((p) => ({
        Produit: p.produit,
        Catégorie: p.categorie,
        Fournisseur: p.fournisseur,
        Agent: `${p.agentPrenom} ${p.agent}`,
        "Date entrée": new Date(p.date_stock).toLocaleDateString("fr-FR"),
        "Date expiration": new Date(p.date_expiration).toLocaleDateString("fr-FR"),
        "Qté perdue": p.quantite_restante,
        "Prix achat": p.prix_unitaire_achat,
        "Valeur perdue (achat)": p.valeurPerdue,
        "Valeur perdue (vente)": p.valeurVentePerdue,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pertes");
      XLSX.writeFile(wb, `rapport_pertes.xlsx`);
    } catch (error) {
      toast.error("Erreur export Excel");
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Rapport des pertes</h1>
        <div className="flex gap-2">
          <button onClick={exportExcel} className="btn btn-sm btn-success">
            ⬇ Excel
          </button>
          <button onClick={() => window.print()} className="btn btn-sm btn-error">
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
        <button onClick={handleFilter} className="btn btn-sm btn-primary">
          Filtrer
        </button>
        <button
          onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); loadRapport(); }}
          className="btn btn-sm btn-outline"
        >
          Reset
        </button>
      </div>

      {/* RÉSUMÉ */}
      {resume && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat bg-base-100 border border-base-300 rounded-2xl">
            <div className="stat-title">Lots périmés</div>
            <div className="stat-value text-2xl" style={{ color: "#A32D2D" }}>
              {resume.totalLots}
            </div>
          </div>
          <div className="stat bg-base-100 border border-base-300 rounded-2xl">
            <div className="stat-title">Unités perdues</div>
            <div className="stat-value text-xl" style={{ color: "#A32D2D" }}>
              {resume.totalUnites}
            </div>
          </div>
          <div className="stat bg-base-100 border border-base-300 rounded-2xl">
            <div className="stat-title">Perte (achat)</div>
            <div className="stat-value text-xl" style={{ color: "#A32D2D" }}>
              {formatFCFA(resume.valeurPerdue)}
            </div>
            <div className="stat-desc">Coût d'achat perdu</div>
          </div>
          <div className="stat bg-base-100 border border-base-300 rounded-2xl">
            <div className="stat-title">Perte (vente)</div>
            <div className="stat-value text-xl" style={{ color: "#A32D2D" }}>
              {formatFCFA(resume.valeurVentePerdue)}
            </div>
            <div className="stat-desc">CA potentiel perdu</div>
          </div>
        </div>
      )}

      {/* TABLE */}
      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : pertes.length === 0 ? (
        <p className="text-center text-gray-400 py-10">
          Aucune perte sur cette période
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra border border-base-300 w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>Produit</th>
                  <th className="hidden md:table-cell">Catégorie</th>
                  <th className="hidden md:table-cell">Fournisseur</th>
                  <th className="hidden md:table-cell">Agent</th>
                  <th>Expiration</th>
                  <th>Qté perdue</th>
                  <th>Prix achat</th>
                  <th>Perte achat</th>
                  <th className="hidden md:table-cell">Perte vente</th>
                </tr>
              </thead>
              <tbody>
                {pertes.map((p) => (
                  <tr key={p.id} className="bg-red-50">
                    <td className="font-semibold text-sm">{p.produit}</td>
                    <td className="hidden md:table-cell text-sm">{p.categorie}</td>
                    <td className="hidden md:table-cell text-sm">{p.fournisseur}</td>
                    <td className="hidden md:table-cell text-sm">
                      {p.agentPrenom} {p.agent}
                    </td>
                    <td className="text-sm" style={{ color: "#A32D2D" }}>
                      {new Date(p.date_expiration).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="text-sm font-bold" style={{ color: "#A32D2D" }}>
                      {p.quantite_restante}
                    </td>
                    <td className="text-sm">
                      {formatFCFA(Number(p.prix_unitaire_achat))}
                    </td>
                    <td className="text-sm font-bold" style={{ color: "#A32D2D" }}>
                      {formatFCFA(Number(p.valeurPerdue))}
                    </td>
                    <td className="hidden md:table-cell text-sm" style={{ color: "#A32D2D" }}>
                      {formatFCFA(Number(p.valeurVentePerdue))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="btn btn-sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Précédent
              </button>
              <span className="px-3 py-1 text-sm">
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
          )}
        </>
      )}
    </div>
  );
};

export default Page;