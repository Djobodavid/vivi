"use client";

import React, { useEffect, useState } from "react";
import CustomModal from "../components/Modal";
import Wrapper from "../components/Wrapper";
import axios from "axios";
import { toast } from "react-toastify";
import EmptyState from "../components/EmptyState";
import { Group, Pencil, Trash } from "lucide-react";

const Page = () => {
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [addresse, setAddresse] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

const loadFournisseurs = async () => {
  try {
    const res = await axios.get("/api/fournisseur");

    if (res.data.success) {
      setFournisseurs(res.data.data);
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
  loadFournisseurs();
}, []);

  // 🔹 OPEN CREATE
  const openModal = () => {
    setEditMode(false);
    setNom("");
    setTelephone("");
    setAddresse("");
    (document.getElementById("custom_modal") as HTMLDialogElement)?.showModal();
  };

  // 🔹 OPEN EDIT
  const openEditModal = (f: any) => {
    setEditMode(true);
    setSelectedId(f.id);
    setNom(f.nom);
    setTelephone(f.telephone);
    setAddresse(f.addresse);

    (document.getElementById("custom_modal") as HTMLDialogElement)?.showModal();
  };

  // 🔹 CLOSE
  const closeModal = () => {
    setEditMode(false);
    setSelectedId(null);
    setNom("");
    setTelephone("");
    setAddresse("");
    (document.getElementById("custom_modal") as HTMLDialogElement)?.close();
  };

 const createFournisseur = async () => {
  if (!nom || !telephone || !addresse) {
    toast.error("Remplis tous les champs");
    return;
  }

  setLoading(true);

  try {
    const res = await axios.post("/api/fournisseur", {
      nom,
      telephone,
      addresse,
    });

    toast.success(res.data.message); // 🔥 message backend
    closeModal();
    loadFournisseurs();

  } catch (error: any) {
    console.error(error);

    const message =
      error.response?.data?.message ||
      (error.request ? "Serveur inaccessible" : "Erreur inattendue");

    toast.error(message);

  } finally {
    setLoading(false);
  }
};

  const updateFournisseur = async () => {
  if (!selectedId || !nom || !telephone || !addresse) {
    toast.error("Remplis tous les champs");
    return;
  }

  setLoading(true);

  try {
    const res = await axios.put("/api/fournisseur", {
      id: selectedId,
      nom,
      telephone,
      addresse,
    });

    toast.success(res.data.message);
    closeModal();
    loadFournisseurs();

  } catch (error: any) {
    console.error(error);

    const message =
      error.response?.data?.message ||
      (error.request ? "Serveur inaccessible" : "Erreur inattendue");

    toast.error(message);

  } finally {
    setLoading(false);
  }
};

 const deleteFournisseur = async (id: string) => {
  try {
    if (!confirm("Supprimer ce fournisseur ?")) return;

    const res = await axios.delete("/api/fournisseur", {
      data: { id },
    });

    toast.success(res.data.message);
    loadFournisseurs();

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
      <div className="mb-4">
        <button className="btn btn-primary" onClick={openModal}>
          Ajouter un fournisseur
        </button>
      </div>

      {fournisseurs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table table-zebra border border-base-300">
            <thead className="bg-base-200">
              <tr>
                <th className="border border-base-300">Nom</th>
                <th className="border border-base-300">Adresse</th>
                <th className="border border-base-300">Téléphone</th>
                <th className="border border-base-300 text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {fournisseurs.map((f) => (
                <tr key={f.id}>
                  <td className="border border-base-300 font-semibold">
                    {f.nom}
                  </td>
                  <td className="border border-base-300">{f.addresse}</td>
                  <td className="border border-base-300">{f.telephone}</td>

                  <td className="border border-base-300">
                    <div className="flex justify-end gap-2">
                      <button
                        aria-label="text"
                        className="btn btn-sm btn-warning"
                        onClick={() => openEditModal(f)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        aria-label="text"
                        className="btn btn-sm btn-error"
                        onClick={() => deleteFournisseur(f.id)}
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
        <EmptyState iconComponent={Group} message="Aucun fournisseur" />
      )}

      <CustomModal
        title={editMode ? "Modifier fournisseur" : "Nouveau fournisseur"}
        loading={loading}
        onClose={closeModal}
        onSubmit={editMode ? updateFournisseur : createFournisseur}
        editMode={editMode}
        fields={[
          {
            label: "Nom",
            value: nom,
            onChange: setNom,
            required: true,
          },
          {
            label: "Téléphone",
            value: telephone,
            onChange: setTelephone,
            required: true,
          },
          {
            label: "Adresse",
            value: addresse,
            onChange: setAddresse,
            required: true,
          },
        ]}
      />
    </Wrapper>
  );
};

export default Page;