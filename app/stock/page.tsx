"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import StockModal from "../components/stockModal";
import EmptyState from "../components/EmptyState";
import { Group } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

const Page = () => {
  const { data: session, status } = useSession();
const role = (session?.user as any)?.role;


const isAdmin = role === "admin";
  const [dateStock, setDateStock] = useState("");
  const [dateExpiration, setDateExpiration] = useState("");

  const [quantiteStock, setQuantiteStock] = useState("");
  const [quantiteMinStock, setQuantiteMinStock] = useState("");

  const [prixUnitaire, setPrixUnitaire] = useState("");
  const [prixVenteUnitaire, setPrixVenteUnitaire] = useState("");
  const [autreFrais, setAutreFrais] = useState("");
  const [stocks, setStocks] = useState<any[]>([]);
  const [observation, setObservation] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [produits, setProduits] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [category, setCategory] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [produitId, setProduitId] = useState("");
  const [fournisseurId, setFournisseurId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [fournisseur, setFournisseur] = useState<
    { label: string; value: string }[]
  >([]);
  const [utilisateurId, setUtilisateurId] = useState("");
  const [uniteId, setUniteId] = useState("");
  const [unites, setUnites] = useState<{ label: string; value: string }[]>([]);

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduit, setSelectedProduit] = useState<any>(null);
  const [open, setOpen] = useState(false);
  

  const handleView = (produit: any) => {
    setSelectedProduit(produit);
    setOpen(true);
  };

  const groupedStocks = Object.values(
    stocks.reduce((acc: any, s: any) => {
      const key = s.produit.id;

      if (!acc[key]) {
        acc[key] = {
          produit: s.produit,
          totalStock: 0,
          totalRestant: 0,
          lots: [],
        };
      }

      acc[key].totalStock += Number(s.quantite_stock);
      acc[key].totalRestant += Number(s.quantite_restante);
      acc[key].lots.push(s);

      return acc;
    }, {}),
  );

  const filteredStocks = groupedStocks.filter((g: any) => {
    const matchSearch = g.produit.nom
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchDate = dateFilter
      ? g.lots.some(
          (lot: any) =>
            new Date(lot.date_stock).toISOString().split("T")[0] === dateFilter,
        )
      : true;

    return matchSearch && matchDate;
  });

  const itemsPerPage = 6;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStocks = filteredStocks.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStocks.length / itemsPerPage),
  );

  const loadProduits = async () => {
    try {
      const res = await axios.get("/api/produits");

      if (res.data.success) {
        const options = res.data.data.map((p: any) => ({
          label: p.nom,
          value: p.id,
        }));
        setProduits(options);
      }
    } catch (error: any) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        (error.request ? "Serveur inaccessible" : "Erreur inattendue");

      toast.error(message);
    }
  };

  const loadFournisseurs = async () => {
    try {
      const res = await axios.get("/api/fournisseur");

      if (res.data.success) {
        const options = res.data.data.map((f: any) => ({
          label: f.nom,
          value: f.id,
        }));
        setFournisseur(options);
      }
    } catch (error: any) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        (error.request ? "Serveur inaccessible" : "Erreur inattendue");

      toast.error(message);
    }
  };

  const loadUnites = async () => {
    try {
      const res = await axios.get("/api/settings/unites");

      if (res.data.success) {
        const options = res.data.data.map((u: any) => ({
          label: u.nom,
          value: u.id,
        }));
        setUnites(options);
      }
    } catch (error: any) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        (error.request ? "Serveur inaccessible" : "Erreur inattendue");

      toast.error(message);
    }
  };

  const loadCtegory = async () => {
    try {
      const res = await axios.get("/api/settings/categories");

      if (res.data.success) {
        const options = res.data.data.map((c: any) => ({
          label: c.nom,
          value: c.id,
        }));
        setCategory(options);
      }
    } catch (error: any) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        (error.request ? "Serveur inaccessible" : "Erreur inattendue");

      toast.error(message);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadProduits();
      loadFournisseurs();
      loadUnites();
      loadStock();
      loadCtegory();
    }

    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  const loadStock = async () => {
    try {
      const res = await axios.get("/api/stock");

      if (res.data.success) {
        setStocks(res.data.data);
      }
    } catch (error: any) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        (error.request ? "Serveur inaccessible" : "Erreur inattendue");

      toast.error(message);
    }
  };

  const openModal = () => {
    setEditMode(false);

    setDateStock("");
    setDateExpiration("");
    setQuantiteStock("");
    setQuantiteMinStock("");
    setPrixUnitaire("");
    setPrixVenteUnitaire("");
    setAutreFrais("");
    setObservation("");
    setProduitId("");
    setFournisseurId("");
    setUtilisateurId("");
    setUniteId("");
    setCategoryId("");

    (document.getElementById("stock_modal") as HTMLDialogElement)?.showModal();
  };

  const closeModal = () => {
    (document.getElementById("stock_modal") as HTMLDialogElement)?.close();
  };

  const handleSubmit = async () => {
    // 🔥 validation front
    if (
      !dateStock ||
      !dateExpiration ||
      !quantiteStock ||
      !quantiteMinStock ||
      !produitId ||
      !fournisseurId ||
      !categoryId ||
      !uniteId
    ) {
      toast.error("Tous les champs sont requis");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/stock", {
        date_stock: dateStock,

        date_expiration: dateExpiration,

        quantite_stock: Number(quantiteStock),

        quantite_min_stock: Number(quantiteMinStock),

        prix_unitaire_achat:
          isAdmin && prixUnitaire ? Number(prixUnitaire) : null,

        prix_unitaire_vente:
          isAdmin && prixVenteUnitaire ? Number(prixVenteUnitaire) : null,

        autre_frais: autreFrais ? Number(autreFrais) : null,

        observation,

        produitId,

        fournisseurId,

        utilisateurId,

        uniteId,

        categoryId,
      });

      toast.success(res.data.message);
      closeModal();
      loadStock();
    } catch (error: any) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        (error.request ? "Serveur inaccessible" : "Erreur inattendue");

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <Wrapper>
      <div className="flex gap-2 mb-4">
        <button className="btn btn-primary mb-4" onClick={openModal}>
          Ajouter un stock
        </button>
        <input
          type="text"
          placeholder="Rechercher stock..."
          className="input input-bordered w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          aria-label="text"
          type="date"
          className="input input-bordered"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        <button
          onClick={() => {
            setDateFilter("");
            loadStock();
          }}
          className="btn btn-outline"
        >
          Reset
        </button>
      </div>

      {filteredStocks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedStocks.map((g: any, index: number) => (
            <div
              key={index}
              className="border p-4 rounded-xl shadow flex flex-col gap-2"
            >
              <div className="flex items-center gap-3">
                <img
                  src={g.produit.image || "/no-image.png"}
                  alt={g.produit?.nom || "produit"}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <p className="font-bold">{g.produit.nom}</p>
                  <p className="font-bold">
                    {g.lots[0]?.category?.nom || "Sans catégorie"}
                  </p>
                </div>
              </div>

              <p>Stock initial: {g.totalStock}</p>
              <p>Stock restant: {g.totalRestant}</p>
              <p>Stock vendu: {g.totalStock - g.totalRestant}</p>

              <button
                onClick={() => handleView(g)}
                className="btn btn-sm btn-primary mt-2"
              >
                Voir détails
              </button>
            </div>
          ))}
          {open && selectedProduit && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
              <div className="bg-white p-4 rounded-lg w-full max-w-4xl overflow-x-auto">
                <h2 className="font-bold mb-3">
                  {selectedProduit.produit.nom}
                </h2>

                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Achat</th>
                      <th>Vente</th>
                      <th>Initial</th>
                      <th>Vendue</th>
                      <th>Restante</th>
                      <th>Fournisseur</th>
                      <th>Utilisateur</th>
                      <th>Expiration</th>
                      <th>Statut</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedProduit.lots.map((s: any) => {
                      const vendue =
                        Number(s.quantite_stock) - Number(s.quantite_restante);

                      return (
                        <tr key={s.id}>
                          <td>{new Date(s.date_stock).toLocaleDateString()}</td>
                          <td>{s.prix_unitaire_achat}</td>
                          <td>{s.prix_unitaire_vente}</td>
                          <td>{s.quantite_stock}</td>
                          <td>{vendue}</td>
                          <td>{s.quantite_restante}</td>
                          <td>{s.fournisseur?.nom}</td>
                          <td>{s.utilisateur?.nom}</td>
                          <td>
                            {new Date(s.date_expiration).toLocaleDateString()}
                          </td>

                          <td>
                            {new Date(s.date_expiration) < new Date() ? (
                              <span className="badge badge-error">Expiré</span>
                            ) : s.quantite_restante <= s.quantite_min_stock ? (
                              <span className="badge badge-warning">
                                Stock faible
                              </span>
                            ) : (
                              <span className="badge badge-success">OK</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <button
                  onClick={() => setOpen(false)}
                  className="btn btn-error mt-3"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
          <div className="flex justify-center mt-4 gap-2">
            <button
              className="btn btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Précédent
            </button>

            <span className="px-2">
              Page {currentPage} / {totalPages}
            </span>

            <button
              className="btn btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Suivant
            </button>
          </div>
        </div>
      ) : (
        <EmptyState iconComponent={Group} message="Aucun stock disponible" />
      )}

      <StockModal
        dateStock={dateStock}
        dateExpiration={dateExpiration}
        quantiteStock={quantiteStock}
        quantiteMinStock={quantiteMinStock}
        prixUnitaire={prixUnitaire}
        prixVenteUnitaire={prixVenteUnitaire}
        autreFrais={autreFrais}
        observation={observation}
        produitId={produitId}
        categoryId={categoryId}
        fournisseurId={fournisseurId}
        uniteId={uniteId}
        produits={produits}
        category={category}
        fournisseurs={fournisseur}
        unites={unites}
        loading={loading}
        editMode={editMode}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onChangeDateStock={setDateStock}
        onChangeDateExpiration={setDateExpiration}
        onChangeQuantiteStock={setQuantiteStock}
        onChangeQuantiteMinStock={setQuantiteMinStock}
        onChangePrixUnitaire={setPrixUnitaire}
        onChangePrixVenteUnitaire={setPrixVenteUnitaire}
        onChangeAutreFrais={setAutreFrais}
        onChangeObservation={setObservation}
        onChangeProduit={setProduitId}
        onChangeFournisseur={setFournisseurId}
        onChangeUnite={setUniteId}
        onChangeCategory={setCategoryId}
        isAdmin={isAdmin}
      />
    </Wrapper>
  );
};

export default Page;
