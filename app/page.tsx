"use client";

import { useState } from "react";
import CustomModal from "./components/Modal";
import Wrapper from "./components/Wrapper";
import axios from "axios";
import { toast } from "react-toastify";

export default function Home() {
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

const createConnexion = async () => {
  try {
    const res = await axios.post("/api/auth/login", {
      email: email,
      motDePasse: password,
    });

    toast.success(res.data.message); // 🔥 message backend
    closeModal();

  } catch (error: any) {
    console.error(error);

    const message =
      error.response?.data?.message || "Erreur lors de la connexion";

    toast.error(message); // 🔥 message dynamique
  }
};

  return (
    <Wrapper>
      <div className="flex flex-col justify-center items-center ">
        <h3 className="mt-10 font-bold">
          Cliquez sur le bouton se connecter pour vous connecter
        </h3>
        <div className="w-full mt-30 flex items-center justify-center">
          <button
            className="btn btn-primary flex justify-center items-center"
            onClick={openModal}
          >
            Se connecter
          </button>

          <CustomModal
            title="Connexion"
            loading={loading}
            onClose={closeModal}
            onSubmit={createConnexion}
            submitLabel="Se connecter"
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
      </div>
    </Wrapper>
  );
}
