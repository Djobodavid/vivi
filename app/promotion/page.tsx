"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import axios from "axios";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Pencil, Trash } from "lucide-react";

type Promo = {
  id: string;
  produit: string;
  produitId: string;
  reduction: number;
  typeReduction: string;
  dateDebut: string;
  dateFin: string;
  active: boolean;
};

type Produit = { label: string; value: string };

const Page = () => {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role;
  const isAdmin = role === "admin";

  const [promos, setPromos] = useState<Promo[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form states
  const [produitId, setProduitId] = useState("");
  const [reduction, setReduction] = useState("");
  const [typeReduction, setTypeReduction] = useState("pourcentage");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const loadPromos = async () => {
    try {
      const res = await axios.get("/api/settings/promo");
      if (res.data.success) setPromos(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadProduits = async () => {
    try {
      const res = await axios.get("/api/produits");
      if (res.data.success) {
        setProduits(res.data.data.map((p: any) => ({ label: p.nom, value: p.id })));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (status === "authenticated") { loadPromos(); loadProduits(); }
    if (status === "unauthenticated") redirect("/");
  }, [status]);

  const resetForm = () => {
    setProduitId(""); setReduction(""); setTypeReduction("pourcentage");
    setDateDebut(""); setDateFin(""); setEditMode(false); setSelectedId(null);
  };

  const openModal = () => {
    resetForm();
    (document.getElementById("promo_modal") as HTMLDialogElement)?.showModal();
  };

  const openEditModal = (p: Promo) => {
    setEditMode(true);
    setSelectedId(p.id);
    setProduitId(p.produitId);
    setReduction(String(p.reduction));
    setTypeReduction(p.typeReduction);
    setDateDebut(new Date(p.dateDebut).toISOString().split("T")[0]);
    setDateFin(new Date(p.dateFin).toISOString().split("T")[0]);
    (document.getElementById("promo_modal") as HTMLDialogElement)?.showModal();
  };

  const closeModal = () => {
    resetForm();
    (document.getElementById("promo_modal") as HTMLDialogElement)?.close();
  };

  const handleSubmit = async () => {
    if (!produitId || !reduction || !dateDebut || !dateFin) {
      toast.error("Tous les champs sont requis");
      return;
    }

    setLoading(true);
    try {
      if (editMode && selectedId) {
        const res = await axios.put("/api/settings/promo", {
          id: selectedId, reduction: Number(reduction),
          typeReduction, dateDebut, dateFin,
        });
        toast.success(res.data.message);
      } else {
        const res = await axios.post("/api/settings/promo", {
          produitId, reduction: Number(reduction),
          typeReduction, dateDebut, dateFin,
        });
        toast.success(res.data.message);
      }
      closeModal();
      loadPromos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette promotion ?")) return;
    try {
      await axios.delete("/api/settings/promo", { data: { id } });
      toast.success("Promotion supprimée");
      loadPromos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur");
    }
  };

  const isActive = (p: Promo) => {
    const now = new Date();
    return new Date(p.dateDebut) <= now && new Date(p.dateFin) >= now;
  };

  const isExpired = (p: Promo) => new Date(p.dateFin) < new Date();
  const isPending = (p: Promo) => new Date(p.dateDebut) > new Date();

  return (
    <Wrapper>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Promotions</h1>
        {isAdmin && (
          <button onClick={openModal} className="btn btn-primary btn-sm">
            + Ajouter une promotion
          </button>
        )}
      </div>

      {promos.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Aucune promotion</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra border border-base-300 w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Produit</th>
                <th>Réduction</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Statut</th>
                {isAdmin && <th className="text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id}>
                  <td className="font-semibold">{p.produit}</td>
                  <td>
                    {p.reduction}
                    {p.typeReduction === "pourcentage" ? "%" : " FCFA"}
                  </td>
                  <td>{new Date(p.dateDebut).toLocaleDateString("fr-FR")}</td>
                  <td>{new Date(p.dateFin).toLocaleDateString("fr-FR")}</td>
                  <td>
                    {isActive(p) && <span className="badge badge-success">Active</span>}
                    {isExpired(p) && <span className="badge badge-error">Expirée</span>}
                    {isPending(p) && <span className="badge badge-warning">À venir</span>}
                  </td>
                  {isAdmin && (
                    <td>
                      <div className="flex justify-end gap-2">
                        <button
                         aria-label="text"
                          className="btn btn-sm btn-warning"
                          onClick={() => openEditModal(p)}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                        aria-label="text"
                          className="btn btn-sm btn-error"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      <dialog id="promo_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            {editMode ? "Modifier la promotion" : "Nouvelle promotion"}
          </h3>

          {!editMode && (
            <div className="mb-3">
              <label className="label text-sm font-semibold">Produit</label>
              <select
                className="select select-bordered w-full"
                value={produitId}
                onChange={(e) => setProduitId(e.target.value)}
              >
                <option value="">Choisir un produit</option>
                {produits.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-3">
            <label className="label text-sm font-semibold">Type de réduction</label>
            <select
              className="select select-bordered w-full"
              value={typeReduction}
              onChange={(e) => setTypeReduction(e.target.value)}
            >
              <option value="pourcentage">Pourcentage (%)</option>
              <option value="montant">Montant fixe (FCFA)</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="label text-sm font-semibold">
              Réduction ({typeReduction === "pourcentage" ? "%" : "FCFA"})
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={reduction}
              onChange={(e) => setReduction(e.target.value)}
              placeholder={typeReduction === "pourcentage" ? "Ex: 10" : "Ex: 500"}
              min={1}
              max={typeReduction === "pourcentage" ? 100 : undefined}
            />
          </div>

          <div className="mb-3">
            <label className="label text-sm font-semibold">Date début</label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="label text-sm font-semibold">Date fin</label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button className="btn btn-outline flex-1" onClick={closeModal}>
              Annuler
            </button>
            <button
              className="btn btn-primary flex-1"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "..." : editMode ? "Modifier" : "Créer"}
            </button>
          </div>
        </div>
      </dialog>
    </Wrapper>
  );
};

export default Page;