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
   const { status } = useSession(); // ✅ AJOUT ICI
  const [dateStock, setDateStock] = useState("");
  const [dateExpiration, setDateExpiration] = useState("");

  const [quantiteStock, setQuantiteStock] = useState("");
  const [quantiteMinStock, setQuantiteMinStock] = useState("");

  const [prixUnitaire, setPrixUnitaire] = useState("");
  const [prixVenteUnitaire, setPrixVenteUnitaire] = useState("");
  const [autreFrais, setAutreFrais] = useState("");
  const [stocks, setStocks] = useState<any[]>([]);
  const [observation, setObservation] = useState("");

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

  const itemsPerPage = 5;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProduits = produits.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const totalPages = Math.ceil(produits.length / itemsPerPage);

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
      !prixUnitaire ||
      !prixVenteUnitaire ||
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
        prix_unitaire_achat: Number(prixUnitaire),
        prix_unitaire_vente: Number(prixVenteUnitaire),
        autre_frais: autreFrais ? Number(autreFrais) : null,
        observation,
        produitId,
        fournisseurId,
        utilisateurId,
        uniteId,
        categoryId
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
      <button className="btn btn-primary mb-4" onClick={openModal}>
        Ajouter un stock
      </button>

      {stocks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table table-zebra border border-base-300">
            <thead className="bg-base-200">
              <tr>
                <th className="border border-base-300 w-1">#</th>
                <th className="border border-base-300">Produit</th>
                <th className="border border-base-300">Quantité</th>
                <th className="border border-base-300">Prix d'achat</th>
                <th className="border border-base-300">Prix de vente</th>
                <th className="border border-base-300">Fournisseur</th>
                <th className="border border-base-300">expiration</th>
                <th className="border border-base-300">statut</th>
              </tr>
            </thead>

            <tbody>
              {stocks.map((s, index) => (
                <tr key={s.id}>
                  {/* INDEX */}
                  <td className="border border-base-300">{index + 1}</td>

                  <td className="border border-base-300">
                    <div className="flex items-center gap-3">
                      {/* IMAGE */}
                      <div className="w-10 h-10 rounded overflow-hidden bg-base-200 ">
                        <img
                          src={s.produit?.image || "/no-image.png"}
                          alt={s.produit?.nom || "produit"}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* TEXTE (BIEN SÉPARÉ) */}
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {s.produit?.nom || "N/A"}
                        </span>

                        <span className="text-xs opacity-60">
                          {s.category?.nom || ""}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* QUANTITÉ + UNITÉ (CE QUE TU VOULAIS 🔥) */}
                  <td className="border border-base-300">
                    {s.quantite_stock} {s.unite?.nom || ""}
                  </td>

                  {/* PRIX */}
                  <td className="border border-base-300">
                    {s.prix_unitaire_achat}
                  </td>

                  <td className="border border-base-300">
                    {s.prix_unitaire_vente}
                  </td>

                  {/* FOURNISSEUR */}
                  <td className="border border-base-300">
                    {s.fournisseur?.nom || "N/A"}
                  </td>

                  {/* EXPIRATION */}
                  <td className="border border-base-300">
                    {new Date(s.date_expiration).toLocaleDateString()}
                  </td>

                  {/* STATUT */}
                  <td className="border border-base-300">
                    {new Date(s.date_expiration) < new Date() ? (
                      <span className="badge badge-error">Expiré</span>
                    ) : s.quantite_stock <= s.quantite_min_stock ? (
                      <span className="badge badge-warning text-[10px] sm:text-xs whitespace-nowrap">
                        Stock faible
                      </span>
                    ) : (
                      <span className="badge badge-success">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      />
    </Wrapper>
  );
};

export default Page;
