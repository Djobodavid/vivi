"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import axios from "axios";
import UniteModal from "../components/unitModal";
import { toast } from "react-toastify";
import { Trash } from "lucide-react";

const page = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [unite, setUnite] = useState<any[]>([]);

  const loadUnite = async () => {
    try {
      const res = await axios.get("/api/settings/unites");
      setUnite(res.data.data);
    } catch (error) {
      console.error(error);
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
      

      const res = await axios.post("/api/settings/unites", {
        nom: name,
        description: description,
      });

      closeModal();
      loadUnite();
      toast.success("Unité créée avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création de l'unité");
    }
  };
 
const deleteUnite = async (id: string) => {
  try {
   
    if (!confirm("Voulez-vous vraiment supprimer cette unité ?")) return;

   
    await axios.delete("/api/settings/unites", { data: { id } });

    toast.success("Unité supprimée avec succès");

    
    loadUnite();
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    toast.error("Impossible de supprimer l'unité");
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
        {unite.map((unite) => (
          <div
            key={unite.id}
            className="mb-2 p-5 border-2 border-base-200 rounded-3xl flex justify-between items-center"
          >
            <div className="flex flex-col gap-2">
                  <strong className="text-lg">{unite.nom}</strong>
                  <div className="badge badge-primary text-sm">{unite.description}</div>
                </div>
                <button aria-label="text" className="btn btn-sm btn-error" onClick={() => deleteUnite(unite.id)}>
                    <Trash className="w-4 h-4" />

                  </button>
          </div>
        ))}
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
