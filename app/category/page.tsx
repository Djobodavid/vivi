"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import CategorieModal from "../components/CategorieModal";
import axios from "axios";
import { Divide, Group, Pencil, Trash } from "lucide-react";
import EmptyState from "../components/EmptyState";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const page = () => {
  const { status } = useSession(); // ✅ AJOUT ICI
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [category, setCategory] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredCategory = category.filter((c) =>
    c.nom.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCategory.length / itemsPerPage);

  const paginatedCategory = filteredCategory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const loadCategory = async () => {
    try {
      const res = await axios.get("/api/settings/categories");

      if (res.data.success) {
        setCategory(res.data.data);
      }
    } catch (error: any) {
      console.error(error);

      if (error.response) {
        toast.error(error.response.data.message);
      } else if (error.request) {
        toast.error("Serveur inaccessible");
      } else {
        toast.error("Erreur inattendue");
      }
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadCategory(); // charge les clients au montage
    }

    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

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
      if (!name) {
        toast.error("Le nom est requis");
        return;
      }

      const res = await axios.post("/api/settings/categories", {
        nom: name,
        description,
      });

      toast.success(res.data.message);
      closeModal();
      loadCategory();
    } catch (error: any) {
      console.error(error);

      if (error.response) {
        toast.error(error.response.data.message);
      } else if (error.request) {
        toast.error("Serveur inaccessible");
      } else {
        toast.error("Erreur inattendue");
      }
    }
  };

  const openEditModal = (category: any) => {
    setEditMode(true);
    setName(category.nom);
    setSelectedId(category.id);
    setDescription(category.description);
    (
      document.getElementById("category_modal") as HTMLDialogElement
    )?.showModal();
  };

  const modifierCategory = async () => {
    try {
      if (!selectedId) {
        toast.error("Aucune catégorie sélectionnée");
        return;
      }

      const res = await axios.put("/api/settings/categories", {
        id: selectedId,
        nom: name,
        description,
      });

      toast.success(res.data.message);
      closeModal();
      loadCategory();
    } catch (error: any) {
      console.error(error);

      if (error.response) {
        toast.error(error.response.data.message);
      } else if (error.request) {
        toast.error("Serveur inaccessible");
      } else {
        toast.error("Erreur inattendue");
      }
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;

      const res = await axios.delete("/api/settings/categories", {
        data: { id },
      });

      toast.success(res.data.message);
      loadCategory();
    } catch (error: any) {
      console.error(error);

      if (error.response) {
        toast.error(error.response.data.message);
      } else if (error.request) {
        toast.error("Serveur inaccessible");
      } else {
        toast.error("Erreur inattendue");
      }
    }
  };

  return (
    <Wrapper>
      <div>
        <div className="flex gap-2 mb-4">
          <button className="btn btn-primary" onClick={onpenCreateModal}>
            Ajouter une catégorie
          </button>
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            className="input input-bordered w-full max-w-sm mb-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {filteredCategory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra border border-base-300">
              <thead className="bg-base-200">
                <tr>
                  <th className="border border-base-300">Nom</th>
                  <th className="border border-base-300">Description</th>
                  <th className="border border-base-300 text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedCategory.map((cat) => (
                  <tr key={cat.id}>
                    <td className="border border-base-300 font-semibold">
                      {cat.nom}
                    </td>

                    <td className="border border-base-300">
                      {cat.description}
                    </td>

                    <td className="border border-base-300">
                      <div className="flex justify-end gap-2">
                        <button
                          aria-label="text"
                          className="btn btn-sm btn-warning"
                          onClick={() => openEditModal(cat)}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          aria-label="text"
                          className="btn btn-sm btn-error"
                          onClick={() => deleteCategory(cat.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Précédent
              </button>

              <span className="px-2">
                Page {currentPage} / {totalPages}
              </span>

              <button
                className="btn btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Suivant
              </button>
            </div>
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
