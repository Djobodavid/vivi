"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import CategorieModal from "../components/CategorieModal";
import axios from "axios";
import { Divide, Group, Pencil, Trash } from "lucide-react";
import EmptyState from "../components/EmptyState";
import { toast } from "react-toastify";


const page = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [category, setCategory] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadCategory = async () => {
    try {
      const res = await axios.get("/api/settings/categories");
      console.log("RESPONSE :", res.data); // 🔍 debug

      setCategory(res.data.data); // stocke les catégories dans le state
    } catch (error) {
      console.error("Erreur lors du chargement des catégories :", error);
    }
  };

  useEffect(() => {
    loadCategory(); // charge les catégories au montage du composant
  }, []); // le tableau vide [] signifie que ça ne s'exécute qu'une fois au montage

  const onpenCreateModal = () => {
    setEditMode(false);
    setName("");
    setDescription("");
    (
      document.getElementById("category_modal") as HTMLDialogElement
    )?.showModal();
  };

  const closeModal = () => {
    setEditMode(false);
    setName("");
    setDescription("");
    
    (document.getElementById("category_modal") as HTMLDialogElement)?.close();
  };

  const createCategory = async () => {
    try {
      const res = await axios.post("/api/settings/categories", {
        nom: name,
        description: description,
      });

      closeModal();
      loadCategory();
      toast.success("Catégorie créée avec succès");
    } catch (error) {
      console.error(error);
    }
  };

  const openEditModal = (category: any) => {
    setEditMode(true);
    setName(category.nom);
    setSelectedId(category.id);
    setDescription(category.description);
    (document.getElementById("category_modal") as HTMLDialogElement)?.showModal();
  };
  const modifierCategory = async () => {
  try {
    if (!selectedId) return;


    await axios.put(`/api/settings/categories`, {
      id: selectedId,
      nom: name,
      description: description,
    });

    closeModal();
    loadCategory();
    toast.success("Catégorie modifiée avec succès");
  } catch (error) {
    console.error(error);
    toast.error("Erreur lors de la modification");
  }
};

const deleteCategory = async (id: string) => {
  try {
    if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;

    await axios.delete("/api/settings/categories", { data: { id } });
    toast.success("Catégorie supprimée avec succès");
    loadCategory();
  } catch (error) {
    console.error(error);
    toast.error("Erreur lors de la suppression");
  }
};

  return (
    <Wrapper>
      <div>
        <div className="mb-4">
          <button className="btn btn-primary" onClick={onpenCreateModal}>
            Ajouter une catégorie
          </button>
        </div>
        {category.length > 0 ? (
          <div>
            {category.map((cat) => (
              <div
                key={cat.id}
                className="mb-2 p-5 border-2 border-base-200 rounded-3xl flex justify-between items-center"
              >
                <div>
                  <strong className="text-lg">{cat.nom}</strong>
                  <div className="text-sm">{cat.description}</div>
                </div>
                <div className="flex gap-2 ">
                  <button
                    aria-label="text"
                    className="btn btn-sm btn-warning"
                    onClick={() => openEditModal(cat)}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button aria-label="text" className="btn btn-sm btn-error" onClick={() => deleteCategory(cat.id)}>
                    <Trash className="w-4 h-4" />

                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            iconComponent={Group}
            message="Aucune catégorie disponible"
          />
        )}
      </div>

      <CategorieModal
        name={name}
        description={description}
        loading={loading}
        onchangeName={setName}
        onchangeDescription={setDescription}
        onclose={closeModal}
        onSubmit={editMode ? modifierCategory : createCategory}
        editMode={editMode}
      />
    </Wrapper>
  );
};

export default page;
