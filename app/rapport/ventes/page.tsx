"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { toast } from "react-toastify";
import Wrapper from "@/app/components/Wrapper";

type VenteItem = {
  nom: string;
  quantite: number;
  prix_unitaire: string;
  total: string;
};

type Vente = {
  id: string;
  date_vente: string;
  total: string;
  mode_paiement: string;
  montant_recu: string;
  monnaie_rendue: string;
  client: string | null;
  agent: string;
  agentPrenom: string;
  items: VenteItem[];
};

type Resume = {
  totalVentes: number;
  caPeriode: number;
  panierMoyen: number;
  benefice: number;
};

const Page = () => {
  const { status } = useSession();
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [modePaiement, setModePaiement] = useState("tous");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const formatFCFA = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";

  const loadRapport = async () => {
    try {
      setLoading(true);
      let url = "/api/rapport/ventes?";
      if (dateFrom) url += `dateFrom=${dateFrom}&`;
      if (dateTo) url += `dateTo=${dateTo}&`;
      if (modePaiement !== "tous") url += `modePaiement=${modePaiement}`;
      const res = await axios.get(url);
      if (res.data.success) {
        setVentes(res.data.data.ventes);
        setResume(res.data.data.resume);
        setTotalPages(res.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") loadRapport();
  }, [page]); // ← se déclenche quand page change

  useEffect(() => {
    if (status === "authenticated") loadRapport();
    if (status === "unauthenticated") redirect("/");
  }, [status]);

  const exportPDF = () => window.print();

  const exportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const rows = ventes.flatMap((v) =>
        v.items.map((item) => ({
          Date: new Date(v.date_vente).toLocaleString("fr-FR"),
          Produit: item.nom,
          Quantité: item.quantite,
          "Prix unitaire": item.prix_unitaire,
          Total: item.total,
          "Mode paiement": v.mode_paiement,
          Client: v.client || "Anonyme",
          Agent: `${v.agentPrenom} ${v.agent}`,
        })),
      );
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ventes");
      XLSX.writeFile(wb, `rapport_ventes_${dateFrom || "all"}.xlsx`);
    } catch (error) {
      toast.error("Erreur export Excel");
    }
  };

  const badgeMode = (mode: string) => {
    if (mode === "cash") return "badge-success";
    if (mode === "mobile") return "badge-info";
    return "badge-warning";
  };

  return (
    <Wrapper>
      <div className="p-2 md:p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold">Rapport des ventes</h1>
          <div className="flex gap-2">
            <button onClick={exportExcel} className="btn btn-sm btn-success">
              ⬇ Excel
            </button>
            <button onClick={exportPDF} className="btn btn-sm btn-error">
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
          <select
            aria-label="text"
            className="select select-bordered select-sm"
            value={modePaiement}
            onChange={(e) => setModePaiement(e.target.value)}
          >
            <option value="tous">Tous les modes</option>
            <option value="cash">Cash</option>
            <option value="mobile">Mobile Money</option>
            <option value="credit">Crédit</option>
          </select>
          <button onClick={loadRapport} className="btn btn-sm btn-primary">
            Filtrer
          </button>
          <button
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setModePaiement("tous");
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
              <div className="stat-title">Total ventes</div>
              <div className="stat-value text-2xl" style={{ color: "#3B6D11" }}>
                {resume.totalVentes}
              </div>
            </div>
            <div className="stat bg-base-100 border border-base-300 rounded-2xl">
              <div className="stat-title">CA période</div>
              <div className="stat-value text-xl" style={{ color: "#3B6D11" }}>
                {formatFCFA(resume.caPeriode)}
              </div>
            </div>
            <div className="stat bg-base-100 border border-base-300 rounded-2xl">
              <div className="stat-title">Panier moyen</div>
              <div className="stat-value text-xl">
                {formatFCFA(resume.panierMoyen)}
              </div>
            </div>
            <div className="stat bg-base-100 border border-base-300 rounded-2xl">
              <div className="stat-title">Bénéfice</div>
              <div
                className="stat-value text-xl"
                style={{ color: resume.benefice >= 0 ? "#3B6D11" : "#A32D2D" }}
              >
                {formatFCFA(resume.benefice)}
              </div>
            </div>
          </div>
        )}

        {/* TABLE */}
        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : ventes.length === 0 ? (
          <p className="text-center text-gray-400 py-10">
            Aucune vente sur cette période
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra border border-base-300 w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>Date</th>
                  <th>Produits</th>
                  <th>Agent</th>
                  <th>Client</th>
                  <th>Mode</th>
                  <th>Total</th>
                  <th>Détail</th>
                </tr>
              </thead>
              <tbody>
                {ventes.map((v) => (
                  <React.Fragment key={v.id}>
                    <tr>
                      <td className="text-sm">
                        {new Date(v.date_vente).toLocaleString("fr-FR")}
                      </td>
                      <td className="text-sm">
                        {v.items
                          .map((i) => `${i.nom} x${i.quantite}`)
                          .join(", ")}
                      </td>
                      <td className="text-sm">
                        {v.agentPrenom} {v.agent}
                      </td>
                      <td className="text-sm">{v.client || "Anonyme"}</td>
                      <td>
                        <span className={`badge ${badgeMode(v.mode_paiement)}`}>
                          {v.mode_paiement}
                        </span>
                      </td>
                      <td className="font-bold text-sm">
                        {formatFCFA(Number(v.total))}
                      </td>
                      <td>
                        <button
                          className="btn btn-xs btn-ghost text-primary"
                          onClick={() =>
                            setExpandedId(expandedId === v.id ? null : v.id)
                          }
                        >
                          {expandedId === v.id ? "Fermer" : "Voir"}
                        </button>
                      </td>
                    </tr>
                    {/* DÉTAIL EXPANDÉ */}
                    {expandedId === v.id && (
                      <tr>
                        <td colSpan={7} className="bg-base-200 p-0">
                          <div className="p-4">
                            <table className="table table-sm w-full">
                              <thead>
                                <tr>
                                  <th>Produit</th>
                                  <th>Qté</th>
                                  <th>Prix unitaire</th>
                                  <th>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {v.items.map((item, i) => (
                                  <tr key={i}>
                                    <td>{item.nom}</td>
                                    <td>{item.quantite}</td>
                                    <td>
                                      {formatFCFA(Number(item.prix_unitaire))}
                                    </td>
                                    <td className="font-bold">
                                      {formatFCFA(Number(item.total))}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div className="flex justify-between mt-3 text-sm">
                              <span>
                                Montant reçu:{" "}
                                {formatFCFA(Number(v.montant_recu))}
                              </span>
                              <span>
                                Monnaie rendue:{" "}
                                {formatFCFA(Number(v.monnaie_rendue))}
                              </span>
                            </div>
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
        <button
          className="btn btn-sm"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Précédent
        </button>

        <button
          className="btn btn-sm"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Suivant
        </button>
      </div>
    </Wrapper>
  );
};

export default Page;
