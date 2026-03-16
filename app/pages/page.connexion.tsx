"use client";

import React, { useState } from "react";

type Connexion = {
  role: string;
  password: string;
  telephone: string;
};

const ConnexionForm = () => {
  const [connexion, setConnexion] = useState<Connexion>({
    role: "",
    password: "",
    telephone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setConnexion({
      ...connexion,
      [name]: value,
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white shadow-md p-6 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Créer une connexion
        </h1>

        <form className="space-y-4">
          <input
            type="text"
            name="role"
            placeholder="role"
            className="btn btn-bordered w-full"
            value={connexion.role}
            onChange={handleChange}
          />

          <input
            type="text"
            name="password"
            placeholder="password"
            className="btn btn-bordered w-full"
            value={connexion.password}
            onChange={handleChange}
          />

          <input
            type="text"
            name="telephone"
            placeholder="Téléphone"
            className="btn btn-bordered w-full"
            value={connexion.telephone}
            onChange={handleChange}
          />

          <div className="flex justify-between">
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>

            <button type="submit" className="btn btn-primary">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnexionForm;
