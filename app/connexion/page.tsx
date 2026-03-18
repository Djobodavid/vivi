"use client";

import React, { useState } from "react";
import CustomModal from "../components/Modal";
import Wrapper from "../components/Wrapper";

const Page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const openModal = () => {
    setEmail("");
    setPassword("");
    (document.getElementById("custom_modal") as HTMLDialogElement)?.showModal();
  };

  const closeModal = () => {
    (document.getElementById("custom_modal") as HTMLDialogElement)?.close();
  };

  const createConnexion = () => {}

  return (
    <Wrapper>
      <div className="w-full h-[calc(100vh-0px)] flex items-center justify-center">
      <button className="btn btn-primary flex justify-center items-center" onClick={openModal}>
        Se connecter
      </button>
      
      <CustomModal
        title="Connexion"
        loading={loading}
        onClose={closeModal}
        onSubmit={createConnexion}
        fields={[
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
        ]}
      />
      </div>
    </Wrapper>
  )
}

export default Page
