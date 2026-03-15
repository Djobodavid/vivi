"use client";

import React, { useState } from "react";

type Utilisateur = {
  nom: string;
  prenom: string;
  telephone: string;
  role: string;
  email: string;
  motDePasse: string;
};

const UtilisateurForm = () => {
  const [user, setUser] = useState<Utilisateur>({
    nom: "",
    prenom: "",
    telephone: "",
    role: "",
    email: "",
    motDePasse: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setUser({
      ...user,
      [name]: value,
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white shadow-md p-6 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Créer un utilisateur
        </h1>

        <form className="space-y-4">
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            className="btn btn-bordered w-full"
            value={user.nom}
            onChange={handleChange}
          />

          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            className="btn btn-bordered w-full"
            value={user.prenom}
            onChange={handleChange}
          />

          <input
            type="text"
            name="telephone"
            placeholder="Téléphone"
            className="btn btn-bordered w-full"
            value={user.telephone}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="btn btn-bordered w-full"
            value={user.email}
            onChange={handleChange}
          />

          <select
            aria-label="text"
            name="role"
            className="select select-text w-full"
            value={user.role}
            onChange={handleChange}
          >
            <option value="">Choisir un rôle</option>
            <option value="admin">Admin</option>
            <option value="vendeur">Vendeur</option>
            <option value="gestionnaire">Gestionnaire</option>
          </select>

          <input
            type="password"
            name="motDePasse"
            placeholder="Mot de passe"
            className="btn btn-bordered w-full"
            value={user.motDePasse}
            onChange={handleChange}
          />

          <button type="submit" className="btn btn-primary">
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
};

export default UtilisateurForm;
