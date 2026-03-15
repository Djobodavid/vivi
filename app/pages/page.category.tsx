"use client";

import React, { useState } from "react";

type Category = {
  name: string;
};

const CategoryForm = () => {
  const [category, setCategory] = useState<Category>({
    name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setCategory({
      ...category,
      [name]: value,
    });
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="bg-white shadow-md p-6 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Créer une catégorie
        </h1>

        <form className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nom de la catégorie"
            className="btn btn-bordered w-full"
            value={category.name}
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

export default CategoryForm;
