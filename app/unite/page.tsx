"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import axios from "axios";
import UniteModal from "../components/unitModal";
import { toast } from "react-toastify";
import { Group, Pencil, Trash } from "lucide-react";
import EmptyState from "../components/EmptyState";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const page = () => {
  const { status } = useSession(); // ✅ AJOUT ICI
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [unite, setUnite] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredUnite = unite.filter((u) =>
    u.nom.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredUnite.length / itemsPerPage);

  const paginatedUnite = filteredUnite.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const loadUnite = async () => {
    try {
      const res = await axios.get("/api/settings/unites");

      if (res.data.success) {
        setUnite(res.data.data);
      }
    } catch (error: any) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        (error.request ? "Serveur inaccessible" : "Erreur inattendue");

      toast.error(message);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadUnite(); // charge les clients au montage
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

  const createUnite = async () => {
    try {
      if (!name) {
        toast.error("Le nom est requis");
        return;
      }

      const res = await axios.post("/api/settings/unites", {
        nom: name,
        description,
      });

      toast.success(res.data.message); // 🔥 backend
      closeModal();
      loadUnite();
    } catch (error: any) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        (error.request ? "Serveur inaccessible" : "Erreur inattendue");

      toast.error(message);
    }
  };

  const deleteUnite = async (id: string) => {
    try {
      if (!confirm("Voulez-vous vraiment supprimer cette unité ?")) return;

      const res = await axios.delete("/api/settings/unites", {
        data: { id },
      });

      toast.success(res.data.message);
      loadUnite();
    } catch (error: any) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        (error.request ? "Serveur inaccessible" : "Erreur inattendue");

      toast.error(message);
    }
  };

  return (
    <Wrapper>
      <div>
        <div className="flex gap-2 mb-4">
          <button className="btn btn-primary" onClick={onpenCreateModal}>
            Ajouter une unité
          </button>
          <input
            type="text"
            placeholder="Rechercher une unitée..."
            className="input input-bordered w-full max-w-sm mb-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {filteredUnite.length > 0 ? (
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
                {paginatedUnite.map((u) => (
                  <tr key={u.id}>
                    <td className="border border-base-300 font-semibold">
                      {u.nom}
                    </td>

                    <td className="border border-base-300">{u.description}</td>

                    <td className="border border-base-300">
                      <div className="flex justify-end gap-2">
                        {/* 🗑 DELETE */}
                        <button
                          aria-label="delete"
                          className="btn btn-sm btn-error"
                          onClick={() => deleteUnite(u.id)}
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
          <EmptyState iconComponent={Group} message="Aucune unité disponible" />
        )}
      </div>
      <UniteModal
        name={name}
        description={description}
        loading={loading}
        onchangeName={setName}
        onchangeDescription={setDescription}
        onclose={closeModal}
        onSubmit={createUnite}
        editMode={editMode}
      />
    </Wrapper>
  );
};

export default page;
