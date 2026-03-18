"use client";

import React, { useState } from "react";
import CustomModal from "../components/Modal";
import Wrapper from "../components/Wrapper";

const Page = () => {
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const openModal = () => {
    setEditMode(false);
    setNom("");
    setTelephone("");
    setAdresse("");
    (document.getElementById("custom_modal") as HTMLDialogElement)?.showModal();
  };

  const closeModal = () => {
    (document.getElementById("custom_modal") as HTMLDialogElement)?.close();
  };

  const createFournisseur = () => {
    
  };

  const updateFournisseur = () => {
    console.log("update fournisseur");
  };

  return (
    <Wrapper >
        
      <button className="btn btn-primary mb-4" onClick={openModal}>
        Ajouter un fournisseur
      </button>
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
            value: adresse,
            onChange: setAdresse,
            required: true,
          },
        ]}
      />
    </Wrapper>
  );
};

export default Page;
