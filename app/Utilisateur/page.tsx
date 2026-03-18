"use client";

import React, { useState } from "react";
import CustomModal from "../components/Modal";
import Wrapper from "../components/Wrapper";

const Page = () => {
  const [nom, setNom] = useState("");
  const [prenoms, setPrenoms] = useState("");
  const [telephone, setTelephone] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const openModal = () => {
    setEditMode(false);
    setNom("");
    setPrenoms("");
    setTelephone("");
    setRole("");
    setEmail("");
    setPassword("");
    resetForm();
    setConfirmPassword("");

    (document.getElementById("custom_modal") as HTMLDialogElement)?.showModal();
  };

  const closeModal = () => {
    (document.getElementById("custom_modal") as HTMLDialogElement)?.close();
  };

  const createUser = () => {
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    console.log({
      nom,
      prenoms,
      telephone,
      role,
      email,
      password,
    });

    setTimeout(() => {
      setLoading(false);
      closeModal();
    }, 1000);
  };

  const updateUser = () => {
    console.log("update user");
  };

  const resetForm = () => {
    setNom("");
    setPrenoms("");
    setTelephone("");
    setRole("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <Wrapper>
      <button className="btn btn-primary mb-4" onClick={openModal}>
        Ajouter un utilisateur
      </button>

      <CustomModal
        title={editMode ? "Modifier utilisateur" : "Nouvel utilisateur"}
        loading={loading}
        onClose={closeModal}
        onSubmit={editMode ? updateUser : createUser}
        editMode={editMode}
        onReset={resetForm}
        submitLabel="Enregistrer"
        fields={[
          {
            label: "Nom",
            value: nom,
            onChange: setNom,
            required: true,
          },
          {
            label: "Prénoms",
            value: prenoms,
            onChange: setPrenoms,
            required: true,
          },
          {
            label: "Téléphone",
            value: telephone,
            onChange: setTelephone,
            required: true,
          },
          {
            label: "Rôle",
            type: "select",
            value: role,
            onChange: setRole,
            required: true,
            options: [
              { label: "Admin", value: "admin" },
              { label: "Gestionnaire", value: "gestionnaire" },
              { label: "Agent", value: "agent" },
            ],
          },
          {
            label: "Email",
            type: "email",
            value: email,
            onChange: setEmail,
            required: true,
          },
          {
            label: "Mot de passe",
            type: "password",
            value: password,
            onChange: setPassword,
            required: true,
          },
          {
            label: "Confirmer mot de passe",
            type: "password",
            value: confirmPassword,
            onChange: setConfirmPassword,
            required: true,
          },
          
        ]}
      />
    </Wrapper>
  );
};

export default Page;
