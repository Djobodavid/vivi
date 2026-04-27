"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import axios from "axios";
import EmptyState from "../components/EmptyState";
import { Eye, Group } from "lucide-react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

const Page = () => {
  const [ventes, setVentes] = useState<any[]>([]);
  const [selectedVente, setSelectedVente] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const { status } = useSession();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 🔥 LOAD DATA
  const loadHistorique = async () => {
    try {
      let url = "/api/vente/Historique";

      const params = [];

      if (dateFrom) params.push(`dateFrom=${dateFrom}`);
      if (dateTo) params.push(`dateTo=${dateTo}`);

      if (params.length > 0) {
        url += "?" + params.join("&");
      }

      const res = await axios.get(url);
      setVentes(res.data.data); // déjà groupé côté backend
      setCurrentPage(1); // reset pagination
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (status === "authenticated") loadHistorique();
    if (status === "unauthenticated") redirect("/");
  }, [status]);

  // 🔥 PAGINATION
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVente = ventes.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(ventes.length / itemsPerPage);

  // 🔥 VIEW
  const handleView = (vente: any) => {
    setSelectedVente(vente);
    setOpen(true);
  };

  const totalGeneral =
  selectedVente?.produits?.reduce(
    (sum: number, item: any) =>
      sum + Number(item.quantite) * Number(item.prix),
    0,
  ) || 0;

  return (
    <Wrapper>
        <h1 className="mt-0 mb-6 text-2xl font-bold flex justify-center">Historique de vente</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          aria-label="text"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="input input-bordered"
        />

        <input
          aria-label="text"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="input input-bordered"
        />

        <button onClick={loadHistorique} className="btn btn-primary">
          Filtrer
        </button>
        <button
          onClick={() => {
            setDateFrom("");
            setDateTo("");
            loadHistorique();
          }}
          className="btn btn-outline"
        >
          Reset
        </button>
      </div>
      {ventes.length === 0 ? (
        <EmptyState
          iconComponent={Group}
          message="Aucun historique disponible"
        />
      ) : (
        <>
          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="table table-zebra border border-base-300">
              <thead className=" bg-base-200">
                <tr>
                  <th className="border border-base-300">Date</th>
                  <th className="border border-base-300">Produits</th>
                  <th className="border border-base-300">Total</th>
                  <th className="border border-base-300 text-end">Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedVente.map((vente) => (
                  <tr key={vente.id}>
                    <td className="border border-base-300">
                      {new Date(vente.date).toLocaleString()}
                    </td>

                    <td className="border border-base-300">
                      <div className="flex flex-wrap gap-2">
                        {vente.produits.map((p: any, i: number) => (
                          <span key={i}>
                            {p.nom} ({p.quantite})
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="border border-base-300 font-bold">
                      {vente.total} FCFA
                    </td>

                    <td className="border border-base-300 flex justify-end">
                      <div className="flex justify-end gap-2">
                        <button
                        aria-label="text"
                        onClick={() => handleView(vente)}
                        className="btn btn-sm btn-warning"
                      >
                        <Eye />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {ventes.length > itemsPerPage && (
            <div className="join mt-4">
              <button
                className="join-item btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                «
              </button>

              <button className="join-item btn">Page {currentPage}</button>

              <button
                className="join-item btn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          )}
        </>
      )}

      {/* 🔥 MODAL TICKET */}
      {open && selectedVente && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="ticket bg-white p-4 rounded-lg w-75 font-mono text-sm">
            {/* HEADER */}
            <div className="text-center">
              <h2 className="font-bold">DERMATO STORE</h2>
              <p className="text-xs">Lomé - Togo</p>
            </div>

            <hr className="border-dashed my-2" />

            {/* INFOS */}
            <p>Date: {new Date(selectedVente.date).toLocaleString()}</p>
            <p>Client: {selectedVente.clientNom || "Anonyme"}</p>

            <hr className="border-dashed my-2" />

            {/* PRODUITS */}
            {selectedVente.produits.map((p: any, i: number) => (
              <div key={i} className="flex justify-between">
                <span>
                  {p.nom} x{p.quantite}
                </span>
                <span>{Number(p.total)} FCFA</span>
              </div>
            ))}

            <hr className="border-dashed my-2" />

            {/* TOTAL */}
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>{selectedVente.total} FCFA</span>
            </div>

            {/* MONTANT */}
            <div className="flex justify-between">
              <span>Reçu</span>
              <span>{Number(selectedVente.montantRecu)} FCFA</span>
            </div>

            <div className="flex justify-between">
              <span>Rendu</span>
              <span>{Number(selectedVente.monnaie)} FCFA</span>
            </div>

            <hr className="border-dashed my-2" />

            {/* FOOTER */}
            <p className="text-center text-xs">Merci pour votre confiance 🙏</p>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => window.print()}
                className="btn btn-sm btn-success w-full sm:w-1/2 no-print"
              >
                Imprimer
              </button>

              <button
                onClick={() => setOpen(false)}
                className="btn btn-sm btn-error w-full sm:w-1/2 no-print"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default Page;
