"use client";

import React from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  

  nom: string;
  description: string;
  categorie: string;
  unite: string;
  prix: string;

  categories: Option[];
  unites: Option[];

  loading: boolean;
  editMode?: boolean;

  preview: string | null;
  oldImage?: string | null;

  onClose: () => void;
  onSubmit: () => void;
  onChangeNom: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangeCategorie: (v: string) => void;
  onChangeUnite: (v: string) => void;
  onChangePrix: (v: string) => void;
  onChangeImage: (file: File) => void;
};

const ProduitModal = ({
  nom,
  description,
  categorie,
  unite,
  prix,
  categories = [],
  unites = [],
  loading,
  editMode,
  preview,
  oldImage,
  onClose,
  onSubmit,
  onChangeNom,
  onChangeDescription,
  onChangeCategorie,
  onChangeUnite,
  onChangePrix,
  onChangeImage,
}: Props) => {
  return (
    <dialog id="produit_modal" className="modal">
      <div className="modal-box">

        {/* ❌ BOUTON FERMER */}
        <form method="dialog">
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-0 top-0"
            onClick={onClose}
          >
            ✕
          </button>
        </form>  
        {/* 🔥 FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >

          {/* NOM */}
          <input
            type="text"
            placeholder="Nom du produit"
            value={nom}
            onChange={(e) => onChangeNom(e.target.value)}
            className="input input-bordered w-full mb-4"
            required
          />

          {/* DESCRIPTION */}
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            className="textarea textarea-bordered w-full mb-4"
            required
          />

          {/* CATEGORIE */}
          <select
            value={categorie}
            onChange={(e) => onChangeCategorie(e.target.value)}
            className="select select-bordered w-full mb-4"
            required
          >
            <option value="">Choisir catégorie</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* UNITE */}
          <select
            value={unite}
            onChange={(e) => onChangeUnite(e.target.value)}
            className="select select-bordered w-full mb-4"
            required
          >
            <option value="">Choisir unité</option>
            {unites.map((u, i) => (
              <option key={i} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>

          {/* PRIX */}
          <input
            type="number"
            placeholder="Prix"
            value={prix}
            onChange={(e) => onChangePrix(e.target.value)}
            className="input input-bordered w-full mb-4"
            required
          />

          {/* IMAGE */}
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full mb-4"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onChangeImage(e.target.files[0]);
              }
            }}
          />

          {/* 🔥 ANCIENNE IMAGE */}
          {oldImage && !preview && (
            <div className="mb-4">
              <p className="text-sm">Ancienne image :</p>
              <img
                src={oldImage}
                className="w-32 h-32 object-cover rounded"
              />
            </div>
          )}

          {/* 🔥 NOUVELLE IMAGE */}
          {preview && (
            <div className="mb-4">
              <p className="text-sm">Nouvelle image :</p>
              <img
                src={preview}
                className="w-32 h-32 object-cover rounded"
              />
            </div>
          )}

          {/* 🔥 BUTTON */}
          <button
            type="submit"
            className="btn btn-primary w-full"
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

export default ProduitModal;