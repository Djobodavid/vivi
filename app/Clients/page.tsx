"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import ClientModal from "../components/ClientModal";
import axios from "axios";
import { toast } from "react-toastify";
import EmptyState from "../components/EmptyState";
import { Group, Pencil, Trash } from "lucide-react";

const page = () => {
  const [name, setName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadClient = async () => {
    try {
      const res = await axios.get("/api/client");

      if (res.data.success) {
        setClients(res.data.data);
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
    loadClient(); // charge les clients au montage
  }, []);

  const onpenCreateModal = () => {
    setEditMode(false);
    setName("");
    setTelephone("");
    setAdresse("");
    (
      document.getElementById("category_modal") as HTMLDialogElement
    )?.showModal();
  };

  const openEditModal = (client: any) => {
    setEditMode(true);
    setName(client.nom);
    setSelectedId(client.id);
    setAdresse(client.adresse);
    setTelephone(client.telephone);
    (
      document.getElementById("category_modal") as HTMLDialogElement
    )?.showModal();
  };

  const closeModal = () => {
    setEditMode(false);
    setName("");
    setTelephone("");
    setAdresse("");
    (document.getElementById("category_modal") as HTMLDialogElement)?.close();
  };

  const createClient = async () => {
    try {
      if (!name || !adresse || !telephone) {
        toast.error("Tous les champs sont requis");
        return;
      }

      const res = await axios.post("/api/client", {
        nom: name,
        adresse,
        telephone,
      });

      toast.success(res.data.message); // 🔥 message backend
      closeModal();
      loadClient();
    } catch (error: any) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        (error.request ? "Serveur inaccessible" : "Erreur inattendue");

      toast.error(message);
    }
  };

  const modifyClient = async () => {
    if (!selectedId || !name || !adresse || !telephone) {
      toast.error("Tous les champs sont requis");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put("/api/client", {
        id: selectedId,
        nom: name,
        adresse,
        telephone,
      });

      toast.success(res.data.message);
      closeModal();
      loadClient();
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

  const deleteClient = async (id: string) => {
    try {
      if (!confirm("Voulez-vous vraiment supprimer ce client ?")) return;

      const res = await axios.delete("/api/client", {
        data: { id },
      });

      toast.success(res.data.message);
      loadClient();
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
        <button className="btn btn-primary" onClick={onpenCreateModal}>
          Ajouter un client
        </button>
      </div>

      {clients.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table table-zebra border border-base-300">
            <thead className="bg-base-200">
              <tr>
                <th className="border border-base-300">Nom</th>
                <th className="border border-base-300">Adresse</th>
                <th className="border border-base-300">Téléphone</th>
                <th className="border border-base-300 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="border border-base-300 font-semibold">
                    {client.nom}
                  </td>
                  <td className="border border-base-300">{client.adresse}</td>
                  <td className="border border-base-300">{client.telephone}</td>
                  <td className="border border-base-300">
                    <div className="flex justify-end gap-2">
                      <button
                        aria-label="text"
                        className="btn btn-sm btn-warning"
                        onClick={() => openEditModal(client)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        aria-label="text"
                        className="btn btn-sm btn-error"
                        onClick={() => deleteClient(client.id)}
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
        <EmptyState iconComponent={Group} message="Aucun client disponible" />
      )}

      <ClientModal
        name={name}
        adresse={adresse}
        telephone={telephone}
        loading={loading}
        onchangeName={setName}
        onchangeAddress={setAdresse}
        onchangeTelephone={setTelephone}
        onclose={closeModal}
        onSubmit={editMode ? modifyClient : createClient}
        editMode={editMode}
      />
    </Wrapper>
  );
};

export default page;
