"use client";

import { useEffect, useState } from "react";
import CustomModal from "./components/Modal";
import Wrapper from "./components/Wrapper";
import axios from "axios";
import { toast } from "react-toastify";
import { useSession, signIn, SignInResponse } from "next-auth/react";

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

  const { data, status, update } = useSession();

  const createConnexion = async () => {
    try {
      const res: SignInResponse = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      console.log("result auth", res);
      if (!res?.error) {
        toast.success("Connection réussie");
        closeModal();
      } else {
        toast.error(
          res?.error && res?.error === "CredentialsSignin"
            ? "Le mot de passe ou l'email est invalide"
            : res?.error,
        );
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur lors de la connexion");
    }
  };

  

  useEffect(() => {
    console.log(status, "session", data?.user, data?.expires);
    if (status === "unauthenticated") {
      openModal();
    }
  }, [status]);

  return (
    <Wrapper>
      <div className="flex flex-col justify-center items-center">
        <div className="w-full mt-30 flex items-center justify-center">
          <CustomModal
            title="Connexion"
            loading={loading}
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
