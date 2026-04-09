"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import axios from "axios";
import UtilisateurModal from "../components/UseuModal";
import { toast } from "react-toastify";
import { Group, Pencil, Trash, User } from "lucide-react";
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

      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error: any) {
      console.error(error);

      const message = error.response?.data?.message || "Erreur de chargement";

      toast.error(message);
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
        telephone,
        role,
        email,
        motDePasse,
      });

      toast.success(res.data.message); // 🔥 dynamique
      closeModal();
      loadUsers();
    } catch (error: any) {
      console.error(error);

      const message =
        error.response?.data?.message || "Erreur lors de la création";

      toast.error(message);
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

      const res = await axios.delete("/api/auth/signup", {
        data: { id },
      });

      toast.success(res.data.message);
      loadUsers();
    } catch (error: any) {
      console.error(error);

      const message = error.response?.data?.message || "Erreur suppression";

      toast.error(message);
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
          <div className="overflow-x-auto">
            <table className="table table-zebra border border-base-300">
              <thead className="bg-base-200">
                <tr>
                  <th className="border border-base-300">Nom</th>
                  <th className="border border-base-300">Rôle</th>
                  <th className="border border-base-300 text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="border border-base-300 font-semibold">
                      {user.nom}
                    </td>

                    <td className="border border-base-300">
                      <span className="badge badge-primary text-sm">
                        {user.role}
                      </span>
                    </td>

                    <td className="border border-base-300">
                      <div className="flex justify-end gap-2">
                        <button
                          aria-label="delete"
                          className="btn btn-sm btn-error"
                          onClick={() => deleteUser(user.id)}
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
