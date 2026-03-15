"use client";

import React, { useState } from "react";
import { Produits } from "@/type";

const Produit = () => {
  const [produit, setProduit] = useState<Produits>({
    nom: "",
    pAchat: 0,
    pVente: 0,
    image: "",
    dExpiration: new Date(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProduit({
      ...produit,
      [name]: value,
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Créer un produit
        </h1>

        <form className="space-y-4">
          <input
            type="text"
            name="nom"
            placeholder="Nom du produit"
            className="btn btn-bordered w-full"
            value={produit.nom}
            onChange={handleChange}
          />

          <input
            type="number"
            name="pAchat"
            placeholder="Prix d'achat"
            className="btn btn-bordered w-full"
            value={produit.pAchat}
            onChange={handleChange}
          />

          <input
            type="number"
            name="pVente"
            placeholder="Prix de vente"
            className="btn btn-bordered w-full"
            value={produit.pVente}
            onChange={handleChange}
          />

          <input
            type="text"
            name="image"
            placeholder="URL de l'image"
            className="file-input w-full"
            value={produit.image}
            onChange={handleChange}
          />

          <input
            aria-label="text"
            type="date"
            name="dExpiration"
            placeholder="Date d'expiration"
            className="btn btn-bordered w-full"
            onChange={handleChange}
          />

          <button
            type="submit"
            className="btn btn-bordered w-full"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
};

export default Produit;
