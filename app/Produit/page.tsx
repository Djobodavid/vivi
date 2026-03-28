"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import ProduitModal from "../components/product";
import axios from "axios";
import { toast } from "react-toastify";
import EmptyState from "../components/EmptyState";
import { Group, Pencil, Trash } from "lucide-react";

const Page = () => {
  const [nom, setNom] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [oldImage, setOldImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [produits, setProduits] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 🔹 LOAD PRODUITS
  const loadProduits = async () => {
    try {
      const res = await axios.get("/api/produits");
      setProduits(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadProduits();
  }, []);

  // 🔹 IMAGE
  const handleImage = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // 🔹 OPEN CREATE
  const openModal = () => {
    setEditMode(false);
    setNom("");
    setImage(null);
    setPreview(null);
    setOldImage(null);

    (
      document.getElementById("produit_modal") as HTMLDialogElement
    )?.showModal();
  };

  // 🔹 OPEN EDIT
  const openEditModal = (p: any) => {
    setEditMode(true);
    setSelectedId(p.id);
    setNom(p.nom);
    setOldImage(p.image); // image venant de la DB
    setPreview(null);
    setImage(null);

    (
      document.getElementById("produit_modal") as HTMLDialogElement
    )?.showModal();
  };

  // 🔹 CLOSE
  const closeModal = () => {
    setEditMode(false);
    setSelectedId(null);
    setNom("");
    setImage(null);
    setPreview(null);
    setOldImage(null);

    (
      document.getElementById("produit_modal") as HTMLDialogElement
    )?.close();
  };

  // 🔹 CREATE
  const createProduit = async () => {
    if (!nom) return toast.error("Nom requis");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nom", nom);
      if (image) formData.append("image", image);

      await axios.post("/api/produits", formData);

      toast.success("Produit créé");
      closeModal();
      loadProduits();
    } catch (error) {
      console.error(error);
      toast.error("Erreur création");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 UPDATE
  const updateProduit = async () => {
    if (!selectedId || !nom) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", selectedId);
      formData.append("nom", nom);
      if (image) formData.append("image", image);

      await axios.put("/api/produits", formData);

      toast.success("Produit modifié");
      closeModal();
      loadProduits();
    } catch (error) {
      console.error(error);
      toast.error("Erreur modification");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 DELETE
  const deleteProduit = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;

    try {
      await axios.delete("/api/produits", { data: { id } });
      toast.success("Produit supprimé");
      loadProduits();
    } catch (error) {
      console.error(error);
      toast.error("Erreur suppression");
    }
  };

  return (
    <Wrapper>
      <div className="mb-4">
        <button className="btn btn-primary" onClick={openModal}>
          Ajouter un produit
        </button>
      </div>

      {produits.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table table-zebra border border-base-300">
            <thead className="bg-base-200">
              <tr>
                <th>Image</th>
                <th>Nom</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {produits.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.image && (
                       <td className="border border-base-300">{p.image}</td>
                    )}
                  </td>

                  <td className="font-semibold">{p.nom}</td>

                  <td>
                    <div className="flex justify-end gap-2">
                      <button
                        aria-label="text"
                        className="btn btn-sm btn-warning"
                        onClick={() => openEditModal(p)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        aria-label="text"
                        className="btn btn-sm btn-error"
                        onClick={() => deleteProduit(p.id)}
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
        <EmptyState iconComponent={Group} message="Aucun produit" />
      )}

      <ProduitModal
        nom={nom}
        loading={loading}
        onClose={closeModal}
        onSubmit={editMode ? updateProduit : createProduit}
        onChangeNom={setNom}
        onChangeImage={handleImage}
        preview={preview}
        oldImage={oldImage}
        editMode={editMode}
      />
    </Wrapper>
  );
};

export default Page;