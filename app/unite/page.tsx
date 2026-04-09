"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import axios from "axios";
import UniteModal from "../components/unitModal";
import { toast } from "react-toastify";
import { Group, Pencil, Trash } from "lucide-react";
import EmptyState from "../components/EmptyState";

const page = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [unite, setUnite] = useState<any[]>([]);

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
    loadUnite();
  }, []);

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
        <div className="mb-4">
          <button className="btn btn-primary" onClick={onpenCreateModal}>
            Ajouter une unité
          </button>
        </div>
        {unite.length > 0 ? (
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
                {unite.map((u) => (
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
