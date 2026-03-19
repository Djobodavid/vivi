"use client";

import React, { useState } from "react";
import Wrapper from "../components/Wrapper";
import ProduitModal from "../components/product";

const Page = () => {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [categorie, setCategorie] = useState("");
  const [unite, setUnite] = useState("");
  const [prix, setPrix] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [oldImage, setOldImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // 🔥 OPTIONS (IMPORTANT)
  const categories = [
    { label: "Crème", value: "creme" },
    { label: "Gel", value: "gel" },
  ];

  const unites = [
    { label: "Boîte", value: "boite" },
    { label: "Flacon", value: "flacon" },
  ];

  // 🔥 IMAGE
  const handleImage = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // 🔥 OPEN MODAL
  const openModal = () => {
    setNom("");
    setDescription("");
    setCategorie("");
    setUnite("");
    setPrix("");
    setImage(null);
    setPreview(null);
    setOldImage(null);

    (document.getElementById("produit_modal") as HTMLDialogElement)?.showModal();
  };

  // 🔥 CLOSE MODAL
  const closeModal = () => {
    (document.getElementById("produit_modal") as HTMLDialogElement)?.close();
  };

  // 🔥 CREATE
  const createProduit = () => {
    setLoading(true);

    console.log({
      nom,
      description,
      categorie,
      unite,
      prix,
      image,
    });

    setTimeout(() => {
      setLoading(false);
      closeModal();
    }, 1000);
  };

  return (
    <Wrapper>
      <button className="btn btn-primary mb-4" onClick={openModal}>
        Ajouter un produit
      </button>

      <ProduitModal
        
        nom={nom}
        description={description}
        categorie={categorie}
        unite={unite}
        prix={prix}
        categories={categories}
        unites={unites}
        loading={loading}
        onClose={closeModal}
        onSubmit={createProduit}
        onChangeNom={setNom}
        onChangeDescription={setDescription}
        onChangeCategorie={setCategorie}
        onChangeUnite={setUnite}
        onChangePrix={setPrix}
        onChangeImage={handleImage}
        preview={preview}
        oldImage={oldImage}
        editMode={editMode}
      />
    </Wrapper>
  );
};

export default Page;