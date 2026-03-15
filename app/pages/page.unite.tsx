"use client";

import React, { useState } from "react";

type Unite = {
  name: string;
};

const UniteForm = () => {
  const [unite, setUnite] = useState<Unite>({
    name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setUnite({
      ...unite,
      [name]: value,
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white shadow-md p-6 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Créer une unité
        </h1>

        <form className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Unité"
            className="btn btn-bordered w-full"
            value={unite.name}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="btn btn-primary"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
};

export default UniteForm;
