"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import axios from "axios";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Stethoscope } from "lucide-react";

type DashboardData = {
  ventesJour: { count: number; total: number };
  caMois: number;
  beneficeMois: number;
  revenuConsultations: number;
  lotsPerimes: number;
  beneficeNet: number;
  pertes: {
    periode: string;
    total: number;
    details: {
      nom: string;
      quantite_restante: number;
      prix_unitaire_achat: string;
      date_expiration: string;
      perte: number;
    }[];
  };
  stockFaible: {
    produitId: string;
    nom: string;
    totalRestant: number;
    seuilMin: number;
  }[];
  topProduits: { nom: string; total_vendu: number; unite: string | null }[];
  ventes7Jours: { date: string; count: number; total: number }[];
  stocksEpuises: { id: string; nom: string; date_expiration: string }[];
  stocksEpuisesCount: number;
  expirantBientot: {
    id: string;
    nom: string;
    quantite_restante: number;
    date_expiration: string;
  }[];
};

const Page = () => {
  const { status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState("mois");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [totalConsultations, setTotalConsultations] = useState(0);

  const loadDashboard = async (p = periode, df = dateFrom, dt = dateTo) => {
    try {
      setLoading(true);
      let url = `/api/Dashboard?periode=${p}`;
      if (p === "custom" && df && dt) url += `&dateFrom=${df}&dateTo=${dt}`;
      const [res, resConsultations] = await Promise.all([
        axios.get(url),
        axios.get("/api/consultation"),
      ]);

      if (res.data.success) setData(res.data.data);
      setTotalConsultations(resConsultations.data.data?.length ?? 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") loadDashboard();
    if (status === "unauthenticated") redirect("/");
  }, [status]);

  const formatFCFA = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";

  const joursRestants = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const maxVendu = Math.max(
    ...(data?.topProduits.map((p) => Number(p.total_vendu)) || [1]),
  );
  const maxPerte = Math.max(
    ...(data?.pertes.details.map((p) => Number(p.perte)) || [1]),
  );

  if (loading)
    return (
      <Wrapper>
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </Wrapper>
    );

  return (
    <Wrapper>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      {/* MÉTRIQUES LIGNE 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="stat bg-base-100 border border-base-300 rounded-2xl">
          <div className="stat-title">Ventes du jour</div>
          <div className="stat-value text-success text-2xl">
            {data?.ventesJour.count}
          </div>
          <div className="stat-desc">
            {formatFCFA(data?.ventesJour.total || 0)} encaissés
          </div>
        </div>
        <div className="stat bg-base-100 border border-base-300 rounded-2xl">
          <div className="stat-title">CA du mois</div>
          <div className="stat-value text-success text-2xl">
            {formatFCFA(data?.caMois || 0)}
          </div>
          <div className="stat-desc">
            Chiffre d'affaires —{" "}
            {new Date().toLocaleString("fr-FR", { month: "long" })}
          </div>
        </div>
        {/* BÉNÉFICE — remplace la 3ème carte ligne 1 */}

        

        <div className="stat bg-base-100 border border-base-300 rounded-2xl">
  <div className="stat-title">Bénéfice du mois</div>
  <div
    className="stat-value text-2xl"
    style={{
      color: (data?.beneficeNet || 0) >= 0 ? "#3B6D11" : "#A32D2D",
    }}
  >
    {formatFCFA(data?.beneficeNet || 0)}
  </div>
  <div className="stat-desc flex flex-col gap-1 mt-1">
    <span style={{ color: "#3B6D11" }}>
      Produits: +{formatFCFA(data?.beneficeMois || 0)}
    </span>
    <span style={{ color: "#3B6D11" }}>
      Consultations: +{formatFCFA(data?.revenuConsultations || 0)}
    </span>
    <span style={{ color: "#A32D2D" }}>
      Pertes: -{formatFCFA(data?.pertes.total || 0)}
    </span>
  </div>
</div>
      </div>

      {/* MÉTRIQUES LIGNE 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat bg-base-100 border border-base-300 rounded-2xl">
          <div className="stat-title">Stock faible</div>
          <div className="stat-value text-warning text-2xl">
            {data?.stockFaible.length}
          </div>
          <div className="stat-desc">produits sous le seuil</div>
        </div>
        <div className="stat bg-base-100 border border-base-300 rounded-2xl">
          <div className="stat-title">Lots périmés</div>
          <div className="stat-value text-error text-2xl">
            {data?.lotsPerimes}
          </div>
          <div className="stat-desc">lots à retirer</div>
        </div>
        <div className="stat bg-base-100 border border-red-200 rounded-2xl border-l-4 border-l-red-400">
          <div className="stat-title text-red-600">Pertes ({periode})</div>
          <div className="stat-value text-error text-2xl">
            {formatFCFA(data?.pertes.total || 0)}
          </div>
          <div className="stat-desc text-red-400">lots périmés non vendus</div>
        </div>

        <div className="stat bg-base-100 border border-base-300 rounded-2xl">
          <div className="stat-figure text-primary">
            <Stethoscope size={28} />
          </div>
          <div className="stat-title">Consultations</div>
          <div className="stat-value text-primary text-2xl">
            {totalConsultations}
          </div>
          <div className="stat-desc">Total enregistrées</div>
        </div>

        {/* ✅ NOUVEAU */}
        <div className="stat bg-base-100 border border-base-300 rounded-2xl">
          <div className="stat-title">Stocks épuisés</div>
          <div className="stat-value text-2xl" style={{ color: "#A32D2D" }}>
            {data?.stocksEpuisesCount}
          </div>
          <div className="stat-desc">lots à 0 unité</div>
        </div>
        
      </div>

      {/* GRAPHIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* TOP PRODUITS */}
        <div className="bg-base-100 border border-base-300 rounded-2xl p-4">
          <h2 className="font-bold mb-4">Top 5 produits les plus vendus</h2>
          <div className="space-y-3">
            {data?.topProduits.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-28 truncate">
                  {p.nom}
                </span>
                <div className="flex-1 bg-base-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-success"
                    style={{
                      width: `${(Number(p.total_vendu) / maxVendu) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-16 text-right">
                  {p.total_vendu} {p.unite || "u."} {/* ✅ unité réelle */}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SUIVI DES PERTES */}
        <div className="bg-base-100 border border-base-300 rounded-2xl p-4">
          <h2 className="font-bold mb-3">Suivi des pertes</h2>

          {/* ONGLETS */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {["jour", "semaine", "mois", "custom"].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPeriode(p);
                  if (p !== "custom") loadDashboard(p);
                }}
                className={`btn btn-xs rounded-full ${periode === p ? "btn-error" : "btn-outline"}`}
              >
                {p === "jour"
                  ? "Jour"
                  : p === "semaine"
                    ? "Semaine"
                    : p === "mois"
                      ? "Mois"
                      : "Période"}
              </button>
            ))}
          </div>

          {/* FILTRE CUSTOM */}
          {periode === "custom" && (
            <div className="flex gap-2 items-center mb-3 flex-wrap">
              <input
                aria-label="text"
                type="date"
                className="input input-sm input-bordered"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="text-sm">→</span>
              <input
                aria-label="text"
                type="date"
                className="input input-sm input-bordered"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              <button
                className="btn btn-sm btn-error"
                onClick={() => loadDashboard("custom", dateFrom, dateTo)}
              >
                Filtrer
              </button>
            </div>
          )}

          {/* TOTAL PERTES */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 flex justify-between items-center">
            <span className="text-sm text-red-700 font-bold">
              Total pertes période
            </span>
            <span className="text-lg font-bold text-red-600">
              {formatFCFA(data?.pertes.total || 0)}
            </span>
          </div>

          {/* DÉTAIL PAR PRODUIT */}
          <div className="space-y-2">
            {data?.pertes.details.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                Aucune perte sur cette période
              </p>
            )}
            {data?.pertes.details.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-28 truncate">
                  {p.nom}
                </span>
                <div className="flex-1 bg-base-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-error"
                    style={{ width: `${(Number(p.perte) / maxPerte) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-red-500 w-20 text-right">
                  {formatFCFA(Number(p.perte))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ALERTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* STOCK FAIBLE */}
        <div className="bg-base-100 border border-base-300 rounded-2xl p-4">
          <h2 className="font-bold mb-3 text-warning">Alertes stock faible</h2>
          {data?.stockFaible.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Aucune alerte
            </p>
          )}
          <div className="space-y-2">
            {data?.stockFaible.map((s, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2 border-b border-base-200 last:border-0"
              >
                <div>
                  <p className="font-semibold text-sm">{s.nom}</p>
                  <p className="text-xs text-gray-500">
                    Seuil: {s.seuilMin} 20
                  </p>
                </div>
                <span className="badge badge-warning">
                  {s.totalRestant} restants
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* EXPIRANT BIENTÔT */}
        <div className="bg-base-100 border border-base-300 rounded-2xl p-4">
          <h2 className="font-bold mb-3 text-error">Lots expirant bientôt</h2>
          {data?.expirantBientot.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Aucun lot à risque
            </p>
          )}
          <div className="space-y-2">
            {data?.expirantBientot.map((s, i) => {
              const jours = joursRestants(s.date_expiration);
              return (
                <div
                  key={i}
                  className="flex justify-between items-center py-2 border-b border-base-200 last:border-0"
                >
                  <div>
                    <p className="font-semibold text-sm">{s.nom}</p>
                    <p className="text-xs text-gray-500">
                      Expire le{" "}
                      {new Date(s.date_expiration).toLocaleDateString("fr-FR")}{" "}
                      — {s.quantite_restante} u.
                    </p>
                  </div>
                  <span
                    className={`badge ${jours <= 7 ? "badge-error" : jours <= 15 ? "badge-warning" : "badge-info"}`}
                  >
                    {jours}j
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default Page;
