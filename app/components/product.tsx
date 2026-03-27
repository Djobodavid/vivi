"use client";

import React from "react";

type Props = {
  nom: string;

  loading: boolean;
  editMode?: boolean;

  preview: string | null;
  oldImage?: string | null;

  onClose: () => void;
  onSubmit: () => void;
  onChangeNom: (v: string) => void;
  onChangeImage: (file: File) => void;
};

const ProduitModal = ({
  nom,
  loading,
  editMode,
  preview,
  oldImage,
  onClose,
  onSubmit,
  onChangeNom,
  onChangeImage,
}: Props) => {
  return (
    <dialog id="produit_modal" className="modal">
      <div className="modal-box">

        {/* ❌ CLOSE */}
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-0 top-0"
          onClick={onClose}
        >
          ✕
        </button>

        {/* 🔥 FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex flex-col gap-4"
        >

          {/* NOM */}
          <input
            type="text"
            placeholder="Nom du produit"
            value={nom}
            onChange={(e) => onChangeNom(e.target.value)}
            className="input input-bordered w-full"
            required
          />

          {/* IMAGE INPUT */}
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onChangeImage(e.target.files[0]);
              }
            }}
          />

          {/* 🔥 MODE EDIT → ANCIENNE + NOUVELLE */}
          {editMode && (
            <div className="flex gap-4 mt-2">

              {/* ANCIENNE IMAGE */}
              {oldImage && (
                <div>
                  <p className="text-xs mb-1">Ancienne</p>
                  <img
                    src={oldImage}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                </div>
              )}

              {/* NOUVELLE IMAGE */}
              {preview && (
                <div>
                  <p className="text-xs mb-1 text-primary">Nouvelle</p>
                  <img
                    src={preview}
                    className="w-24 h-24 object-cover rounded-xl border-2 border-primary"
                  />
                </div>
              )}

            </div>
          )}

          {/* 🔥 CREATE MODE → PREVIEW SIMPLE */}
          {!editMode && preview && (
            <div>
              <p className="text-xs mb-1">Image</p>
              <img
                src={preview}
                className="w-24 h-24 object-cover rounded-xl"
              />
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            className="btn btn-primary w-full mt-2"
            disabled={loading}
          >
            {loading
              ? "Enregistrement..."
              : editMode
              ? "Modifier"
              : "Ajouter"}
          </button>

        </form>
      </div>
    </dialog>
  );
};

export default ProduitModal;