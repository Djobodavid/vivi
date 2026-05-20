"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Bell } from "lucide-react";
import Link from "next/link";

type AlerteData = {
  totalAlertes: number;
  lotsPerimes: { nom: string; quantite: number }[];
  stockFaible: { nom: string; totalRestant: number }[];
  expirantBientot: { nom: string; date_expiration: string; quantite: number }[];
  stocksEpuises: { nom: string }[];
};

const AlerteCloche = () => {
  const [data, setData] = useState<AlerteData | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const loadAlertes = async () => {
    try {
      const res = await axios.get("/api/alertes");
      if (res.data.success) setData(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadAlertes();
    // ✅ Recharger toutes les 5 minutes
    const interval = setInterval(loadAlertes, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Fermer si on clique ailleurs
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const joursRestants = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div ref={ref} className="relative">
      {/* CLOCHE */}
      <button
        className="btn btn-ghost btn-sm relative"
        onClick={() => setOpen(!open)}
      >
        <Bell className="w-5 h-5" />
        {data && data.totalAlertes > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {data.totalAlertes > 99 ? "99+" : data.totalAlertes}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-base-100 border border-base-300 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
            <span className="font-bold text-sm">Alertes</span>
            <span className="badge badge-error text-xs">
              {data?.totalAlertes || 0} alertes
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* LOTS PÉRIMÉS */}
            {data && data.lotsPerimes.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-red-50 text-xs font-bold text-red-700 uppercase tracking-wider">
                  Lots périmés ({data.lotsPerimes.length})
                </div>
                {data.lotsPerimes.map((a, i) => (
                  <div key={i} className="px-4 py-2 border-b border-base-200 flex justify-between items-center">
                    <span className="text-sm">{a.nom}</span>
                    <span className="badge badge-error badge-sm">{a.quantite} u.</span>
                  </div>
                ))}
              </div>
            )}

            {/* STOCK FAIBLE */}
            {data && data.stockFaible.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-yellow-50 text-xs font-bold text-yellow-700 uppercase tracking-wider">
                  Stock faible ({data.stockFaible.length})
                </div>
                {data.stockFaible.map((a, i) => (
                  <div key={i} className="px-4 py-2 border-b border-base-200 flex justify-between items-center">
                    <span className="text-sm">{a.nom}</span>
                    <span className="badge badge-warning badge-sm">{a.totalRestant} restants</span>
                  </div>
                ))}
              </div>
            )}

            {/* EXPIRANT BIENTÔT */}
            {data && data.expirantBientot.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-orange-50 text-xs font-bold text-orange-700 uppercase tracking-wider">
                  Expire bientôt ({data.expirantBientot.length})
                </div>
                {data.expirantBientot.map((a, i) => (
                  <div key={i} className="px-4 py-2 border-b border-base-200 flex justify-between items-center">
                    <span className="text-sm">{a.nom}</span>
                    <span className={`badge badge-sm ${joursRestants(a.date_expiration) <= 7 ? "badge-error" : "badge-warning"}`}>
                      {joursRestants(a.date_expiration)}j
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* STOCKS ÉPUISÉS */}
            {data && data.stocksEpuises.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Épuisés ({data.stocksEpuises.length})
                </div>
                {data.stocksEpuises.map((a, i) => (
                  <div key={i} className="px-4 py-2 border-b border-base-200">
                    <span className="text-sm">{a.nom}</span>
                  </div>
                ))}
              </div>
            )}

            {data && data.totalAlertes === 0 && (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">
                Aucune alerte 🎉
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-base-300">
            <Link
              href="/rapport"
              onClick={() => setOpen(false)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Voir le dashboard complet →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlerteCloche;