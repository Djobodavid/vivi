"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { toast } from "react-toastify";

type Stock = {
  id: string;
  date_stock: string;
  date_expiration: string;
  quantite_stock: number;
  quantite_restante: number;
  quantite_min_stock: number;
  prix_unitaire_achat: string;
  prix_unitaire_vente: string;
  statut: string;
  produit: string;
  fournisseur: string;
  unite: string;
  categorie: string;
  agent: string;
  agentPrenom: string;
};

type Resume = {
  totalLots: number;
  totalInitial: number;
  totalRestant: number;
  valeurStock: number;
};

type Categorie = { id: string; nom: string };

const Page = () => {
  const { status } = useSession();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorie, setCategorie] = useState("");
  const [statut, setStatut] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const formatFCFA = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";

  const loadRapport = async () => {
    try {
      setLoading(true);
      let url = `/api/rapport/stock?page=${page}&limit=${limit}`;
      if (categorie) url += `&categorie=${categorie}`;
      if (statut) url += `&statut=${statut}`;
      const res = await axios.get(url);
      if (res.data.success) {
        setStocks(res.data.data.stocks);
        setResume(res.data.data.resume);
        setCategories(res.data.data.categories);
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

  const handleFilter = () => {
    setPage(1);
    loadRapport();
  };

  const exportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const rows = stocks.map((s) => ({
        Produit: s.produit,
        Catégorie: s.categorie,
        Fournisseur: s.fournisseur,
        Unité: s.unite,
        "Date entrée": new Date(s.date_stock).toLocaleDateString("fr-FR"),
        "Date expiration": new Date(s.date_expiration).toLocaleDateString(
          "fr-FR",
        ),
        "Qté initiale": s.quantite_stock,
        "Qté restante": s.quantite_restante,
        "Prix achat": s.prix_unitaire_achat,
        "Prix vente": s.prix_unitaire_vente,
        Statut: s.statut,
        "Valeur stock":
          Number(s.quantite_restante) * Number(s.prix_unitaire_achat),
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Stock");
      XLSX.writeFile(wb, "rapport_stock.xlsx");
    } catch (error) {
      toast.error("Erreur export Excel");
    }
  };

  const statutBadge = (s: string) => {
    if (s === "operationnel") return "badge-success";
    if (s === "en_attente") return "badge-warning";
    return "badge-error";
  };

  const isExpired = (date: string) => new Date(date) < new Date();
  const isExpiringSoon = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000;
  };

  const getStatut = (s: Stock) => {
  if (isExpired(s.date_expiration)) 
    return { label: "Expiré", class: "badge-error" };
  if (Number(s.quantite_restante) === 0) 
    return { label: "Épuisé", class: "badge-error" };
  if (s.statut === "operationnel") 
    return { label: "Opérationnel", class: "badge-success" };
  return { label: "En attente", class: "badge-warning" };
};
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Rapport stock</h1>
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
        <select
          aria-label="text"
          className="select select-bordered select-sm"
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
        <select
          aria-label="text"
          className="select select-bordered select-sm"
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
        >
          <option value="">Tous statuts</option>
          <option value="operationnel">Opérationnel</option>
          <option value="en_attente">En attente</option>
        </select>
        <button onClick={handleFilter} className="btn btn-sm btn-primary">
          Filtrer
        </button>
        <button
          onClick={() => {
            setCategorie("");
            setStatut("");
            setPage(1);
            loadRapport();
          }}
          className="btn btn-sm btn-outline"
        >
          Reset
        </button>
      </div>

      {/* RÉSUMÉ */}
      {resume && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat bg-base-100 border border-base-300 rounded-2xl">
            <div className="stat-title">Total lots</div>
            <div className="stat-value text-2xl">{resume.totalLots}</div>
          </div>
          <div className="stat bg-base-100 border border-base-300 rounded-2xl">
            <div className="stat-title">Stock initial</div>
            <div className="stat-value text-xl">{resume.totalInitial}</div>
          </div>
          <div className="stat bg-base-100 border border-base-300 rounded-2xl">
            <div className="stat-title">Stock restant</div>
            <div className="stat-value text-xl" style={{ color: "#3B6D11" }}>
              {resume.totalRestant}
            </div>
          </div>
          <div className="stat bg-base-100 border border-base-300 rounded-2xl">
            <div className="stat-title">Valeur stock</div>
            <div className="stat-value text-xl" style={{ color: "#3B6D11" }}>
              {formatFCFA(resume.valeurStock)}
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : stocks.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Aucun stock trouvé</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra border border-base-300 w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>Produit</th>
                  <th>Catégorie</th>
                  <th>Fournisseur</th>
                  <th className="hidden md:table-cell">Agent</th>
                  <th>Date entrée</th>
                  <th>Expiration</th>
                  <th>Initial</th>
                  <th>Restant</th>
                  <th>Prix achat</th>
                  <th>Prix vente</th>
                  <th>Valeur</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((s) => (
                  <tr
                    key={s.id}
                    className={
                      isExpired(s.date_expiration)
                        ? "bg-red-50"
                        : isExpiringSoon(s.date_expiration)
                          ? "bg-yellow-50"
                          : ""
                    }
                  >
                    <td className="font-semibold text-sm">{s.produit}</td>
                    <td className="text-sm">{s.categorie}</td>
                    <td className="text-sm">{s.fournisseur}</td>
                    <td className=" md:table-cell text-sm">
                      {s.agentPrenom} {s.agent}
                    </td>
                    <td className="text-sm">
                      {new Date(s.date_stock).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="text-sm">
                      <span
                        style={{
                          color: isExpired(s.date_expiration)
                            ? "#A32D2D"
                            : isExpiringSoon(s.date_expiration)
                              ? "#854F0B"
                              : "inherit",
                        }}
                      >
                        {new Date(s.date_expiration).toLocaleDateString(
                          "fr-FR",
                        )}
                      </span>
                    </td>
                    <td className="text-sm">{s.quantite_stock}</td>
                    <td className="text-sm">{s.quantite_restante}</td>
                    <td className="text-sm">
                      {formatFCFA(Number(s.prix_unitaire_achat))}
                    </td>
                    <td className="text-sm">
                      {formatFCFA(Number(s.prix_unitaire_vente))}
                    </td>
                    <td className="text-sm font-bold">
                      {formatFCFA(
                        Number(s.quantite_restante) *
                          Number(s.prix_unitaire_achat),
                      )}
                    </td>
                    <td>
  <span className={`badge ${getStatut(s).class} text-xs`}>
    {getStatut(s).label}
  </span>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
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
