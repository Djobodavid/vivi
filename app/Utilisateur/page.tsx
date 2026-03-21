"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import axios from "axios";
import UtilisateurModal from "../components/UseuModal";
import { toast } from "react-toastify";
import { Group, Trash, User } from "lucide-react";
import EmptyState from "../components/EmptyState";

const page = () => {
  const [name, setName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [role, setRole] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [email, setEmail] = useState("");
  const [confirme, setConfirme] = useState("");
  const [prenoms, setPrenoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const loadUsers = async () => {
    try {
      const res = await axios.get("/api/auth/signup");
      setUsers(res.data.data);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs :", error);
    }
  };
  useEffect(() => {
    loadUsers();
  }, []);

  const onpenCreateModal = () => {
    setEditMode(false);
    setName("");
    setPrenoms("");
    setTelephone("");
    setRole("");
    setMotDePasse("");
    setConfirme("");
    (document.getElementById("user_modal") as HTMLDialogElement)?.showModal();
  };

  const closeModal = () => {
    setEditMode(false);
    setName("");
    setPrenoms("");
    setTelephone("");
    setRole("");
    setEmail("");
    setMotDePasse("");
    setConfirme("");
    (document.getElementById("user_modal") as HTMLDialogElement)?.close();
  };

  const createUser = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      const res = await axios.post("/api/auth/signup", {
        nom: name,
        prenom: prenoms,
        telephone: telephone,
        role: role,
        email: email,
        motDePasse: motDePasse,
      } as any);

      closeModal();
      loadUsers();
      toast.success("Utilisateur créé avec succès");
    } catch (error) {
      console.error(error);
    }
  };
  const modifierCategory = () => {};

  const onReset = () => {
    setName("");
    setPrenoms("");
    setTelephone("");
    setRole("");
    setEmail("");
    setMotDePasse("");
    setConfirme("");
  };

  const deleteUser = async (id: string) => {
  try {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    await axios.delete("/api/auth/signup", { data: { id } }); // ⚡ envoi id dans le corps

    toast.success("Utilisateur supprimé avec succès");
    loadUsers(); // recharge la liste
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    toast.error("Impossible de supprimer l'utilisateur");
  }
};

  return (
    <Wrapper>
      <div>
        <div className="mb-4">
          <button className="btn btn-primary" onClick={onpenCreateModal}>
            Ajouter un utilisateur
          </button>
        </div>
        {users.length > 0 ? (
          <div>
            {users.map((user ) => (
              <div
                key={user.id }
                className="mb-2 p-5 border-2 border-base-200 rounded-3xl flex justify-between items-center"
              >
                <div className="flex flex-col gap-2">
                  <strong className="text-lg">{user.nom}</strong>
                  <div className="badge badge-primary text-sm">{user.role}</div>
                </div>
                <div className="flex gap-2 ">

                  <button aria-label="text" className="btn btn-sm btn-error" onClick={() => deleteUser(user.id)}>
                    <Trash className="w-4 h-4" />

                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState iconComponent={Group} message="Aucun utilisateur" />
        )}
      </div>

      <UtilisateurModal
        name={name}
        prenoms={prenoms}
        email={email}
        telephone={telephone}
        role={role}
        motDePasse={motDePasse}
        confirme={confirme}
        loading={loading}
        onChangeName={setName}
        onChangePrenoms={setPrenoms}
        onChangeTelephone={setTelephone}
        onChangeRole={setRole}
        onChangeEmail={setEmail}
        onChangePassword={setMotDePasse}
        onChangeConfirme={setConfirme}
        onClose={closeModal}
        onSubmit={editMode ? modifierCategory : createUser}
        editMode={editMode}
        onReset={onReset}
      />
    </Wrapper>
  );
};

export default page;
