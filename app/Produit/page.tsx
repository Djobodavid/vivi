"use client";

import React, { useState } from "react";
import Wrapper from "../components/Wrapper";
import ProduitModal from "../components/product";

const Page = () => {
  const [nom, setNom] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [oldImage, setOldImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // 🔥 IMAGE
  const handleImage = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // 🔥 OPEN MODAL (CREATE par défaut)
  const openModal = () => {
    setEditMode(false);

    setNom("");
    setImage(null);
    setPreview(null);
    setOldImage(null);

    (document.getElementById("produit_modal") as HTMLDialogElement)?.showModal();
  };

  // 🔥 CLOSE
  const closeModal = () => {
    (document.getElementById("produit_modal") as HTMLDialogElement)?.close();
  };

  // 🔥 SUBMIT (sera appelé par tes CRUD plus tard)
  const handleSubmit = () => {
    setLoading(true);

    const payload = {
      nom,
      image,
    };

    console.log(payload); // tu remplaceras par ton API

    setTimeout(() => {
      setLoading(false);
      closeModal();
    }, 500);
  };

  return (
    <Wrapper>
      <button className="btn btn-primary mb-4" onClick={openModal}>
        Ajouter un produit
      </button>

      <ProduitModal
        nom={nom}
        loading={loading}
        onClose={closeModal}
        onSubmit={handleSubmit}
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