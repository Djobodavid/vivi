"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../Wrapper";
import ProduitModal from "../product";
import axios from "axios";
import { toast } from "react-toastify";
import EmptyState from "../EmptyState";
import { Group, Pencil, Trash } from "lucide-react";
import { fileToBase64 } from "@/utils";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

const PageProduit = () => {
  const [nom, setNom] = useState("");
  const { status } = useSession(); // ✅ AJOUT ICI
  const [image, setImage] = useState<string | null>();
  const [preview, setPreview] = useState<string | null>(null);
  const [oldImage, setOldImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [produits, setProduits] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProduits = produits.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const totalPages = Math.ceil(produits.length / itemsPerPage);

  const loadProduits = async () => {
    try {
      const res = await axios.get("/api/produits");

      if (res.data.success) {
        setProduits(res.data.data);
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
      loadProduits(); // charge les clients au montage
    }
    
    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  // 🔹 IMAGE
  const handleImage = async (file: File) => {
    const fileTosave = await fileToBase64(file);
    setImage(fileTosave);

    setPreview(fileTosave);
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

    (document.getElementById("produit_modal") as HTMLDialogElement)?.close();
  };

  const createProduit = async () => {
    if (!nom) {
      toast.error("Nom requis");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/produits", {
        nom,
        image: image || null,
      });

      toast.success(res.data.message);
      closeModal();
      loadProduits();
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

  const updateProduit = async () => {
    if (!selectedId || !nom) {
      toast.error("Nom requis");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put("/api/produits", {
        id: selectedId,
        nom,
        image: image || null,
      });

      toast.success(res.data.message);
      closeModal();
      loadProduits();
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

  const deleteProduit = async (id: string) => {
    try {
      if (!confirm("Supprimer ce produit ?")) return;

      const res = await axios.delete("/api/produits", {
        data: { id },
      });

      toast.success(res.data.message);
      loadProduits();
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
          Ajouter un produit
        </button>
      </div>

      {produits.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table table-zebra border border-base-300">
            <thead className="bg-base-200">
              <tr>
                <th className="border border-base-300 w-1 whitespace-nowrap">
                  #
                </th>
                <th className="border border-base-300">Nom</th>
                <th className="border border-base-300 w-1 whitespace-nowrap">
                  Image
                </th>
                <th className="border border-base-300 w-1  whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedProduits.map((p, index) => (
                <tr key={p.id}>
                  <td className="border border-base-300">
                    {startIndex + index + 1}
                  </td>
                  <td className="border border-base-300">{p.nom}</td>
                  <td className="border border-base-300 ">
                    {p?.image && (
                      <img
                        className="rounded-full"
                        src={p.image}
                        height={45}
                        width={45}
                        alt={p?.nom}
                      />
                    )}
                  </td>

                  <td className="border border-base-300">
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
          <div className="flex justify-center mt-4 gap-2">
            <button
              className="btn btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Précédent
            </button>

            <span className="px-3 flex items-center">
              {currentPage} / {totalPages}
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

export default PageProduit;
