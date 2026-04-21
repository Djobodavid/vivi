"use client";

import React from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  dateStock: string;
  quantiteStock: string;
  quantiteMinStock: string;
  prixUnitaire: string;
  autreFrais: string;
  observation: string;
  dateExpiration: string;

  produitId: string;
  fournisseurId: string;
  uniteId: string;
  categoryId: string;
  produits: Option[];
  fournisseurs: Option[];
  category: Option[];
  unites: Option[];

  loading: boolean;
  editMode?: boolean;

  onClose: () => void;
  onSubmit: () => void;

  onChangeDateStock: (v: string) => void;
  onChangeQuantiteStock: (v: string) => void;
  onChangeQuantiteMinStock: (v: string) => void;
  onChangePrixUnitaire: (v: string) => void;
  onChangeAutreFrais: (v: string) => void;
  onChangeObservation: (v: string) => void;
  onChangeDateExpiration: (v: string) => void;
  onChangeCategory: (v: string) => void;
  onChangeProduit: (v: string) => void;
  onChangeFournisseur: (v: string) => void;
  onChangeUnite: (v: string) => void;
};

const StockModal = ({
  dateStock,
  quantiteStock,
  quantiteMinStock,
  prixUnitaire,
  autreFrais,
  observation,
  dateExpiration,
  produitId,
  fournisseurId,
  categoryId,
  category,
  uniteId,
  produits,
  fournisseurs,
  unites,
  loading,
  editMode,
  onClose,
  onSubmit,
  onChangeDateStock,
  onChangeQuantiteStock,
  onChangeQuantiteMinStock,
  onChangePrixUnitaire,
  onChangeAutreFrais,
  onChangeCategory,
  onChangeObservation,
  onChangeDateExpiration,
  onChangeProduit,
  onChangeFournisseur,
  onChangeUnite,
}: Props) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <dialog id="stock_modal" className="modal">
      <div className="modal-box max-w-2xl">
        {/* ❌ CLOSE */}
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>

        <h3 className="font-bold text-lg mb-4">
          {editMode ? "Modifier le stock" : "Nouveau stock"}
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Date de stock</span>
            </label>
            <input
              type="date"
              value={dateStock}
              onChange={(e) => onChangeDateStock(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Date d'expiration</span>
            </label>
            <input
              type="date"
              value={dateExpiration}
              onChange={(e) => onChangeDateExpiration(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* QUANTITE */}
          <input
            type="number"
            placeholder="Quantité"
            value={quantiteStock}
            onChange={(e) => onChangeQuantiteStock(e.target.value)}
            className="input input-bordered w-full"
            required
          />

          {/* QUANTITE MIN */}
          <input
            type="number"
            placeholder="Quantité minimale"
            value={quantiteMinStock}
            onChange={(e) => onChangeQuantiteMinStock(e.target.value)}
            className="input input-bordered w-full"
            required
          />

          {/* PRIX */}
          <input
            type="number"
            placeholder="Prix unitaire"
            value={prixUnitaire}
            onChange={(e) => onChangePrixUnitaire(e.target.value)}
            className="input input-bordered w-full"
            required
          />

          {/* AUTRE FRAIS */}
          <input
            type="number"
            placeholder="Autres frais"
            value={autreFrais}
            onChange={(e) => onChangeAutreFrais(e.target.value)}
            className="input input-bordered w-full"
          />

          {/* PRODUIT */}
          <select
            value={produitId}
            onChange={(e) => onChangeProduit(e.target.value)}
            className="select select-bordered w-full"
            required
          >
            <option value="">Produit</option>
            {produits.map((p, i) => (
              <option key={i} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <select
            value={categoryId}
            onChange={(e) => onChangeCategory(e.target.value)}
            className="select select-bordered w-full"
            required
          >
            <option value="">Category</option>
            {category.map((c, i) => (
              <option key={i} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* FOURNISSEUR */}
          <select
            value={fournisseurId}
            onChange={(e) => onChangeFournisseur(e.target.value)}
            className="select select-bordered w-full"
            required
          >
            <option value="">Fournisseur</option>
            {fournisseurs.map((f, i) => (
              <option key={i} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          

          {/* UNITE */}
          <select
            value={uniteId}
            onChange={(e) => onChangeUnite(e.target.value)}
            className="select select-bordered w-full"
            required
          >
            <option value="">Unité</option>
            {unites.map((u, i) => (
              <option key={i} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>

          {/* OBSERVATION (full width) */}
          <textarea
            placeholder="Observation"
            value={observation}
            onChange={(e) => onChangeObservation(e.target.value)}
            className="textarea textarea-bordered col-span-2"
          />

          {/* BUTTON */}
          <button
            type="submit"
            className="btn btn-primary col-span-2"
            disabled={loading}
          >
            {loading
              ? "Enregistrement..."
              : editMode
                ? "Modifier"
                : "Enregistrer"}
          </button>
        </form>
      </div>
    </dialog>
  );
};

export default StockModal;
