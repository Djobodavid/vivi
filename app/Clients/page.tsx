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
      console.log("RESPONSE :", res.data); // 🔍 debug

      setClients(res.data.data); // stocke les catégories dans le state
    } catch (error) {
      console.error("Erreur lors du chargement des catégories :", error);
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
      const res = await axios.post("/api/client", {
        nom: name,
        adresse: adresse,
        telephone: telephone,
      });

      closeModal();
      loadClient();
      toast.success("Client créée avec succès");
    } catch (error) {
      console.error(error);
    }
  };
  const modifyClient = async () => {
    if (!selectedId || !name || !adresse || !telephone) return;

    setLoading(true);
    try {
      await axios.put("/api/client", {
        id: selectedId,
        nom: name,
        adresse,
        telephone,
      });
      toast.success("Client modifié avec succès");
      closeModal();
      loadClient();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce client ?")) return;

    try {
      await axios.delete("/api/client", { data: { id } });
      toast.success("Client supprimé avec succès");
      loadClient();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
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
