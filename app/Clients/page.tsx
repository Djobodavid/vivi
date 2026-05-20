"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import ClientModal from "../components/ClientModal";
import axios from "axios";
import { toast } from "react-toastify";
import EmptyState from "../components/EmptyState";
import { Group, Pencil, Trash } from "lucide-react";
import { redirect, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const page = () => {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role;
  const [name, setName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const pathname = usePathname();

  const searchParam = useSearchParams();
const from = searchParam.get("from");


  const filteredClient = clients.filter((c) =>
    c.nom.toLowerCase().includes(search.toLowerCase()),
  );

  const router = useRouter();

  const canManageClient = role === "admin";

  const totalPages = Math.ceil(filteredClient.length / itemsPerPage);

  const paginatedClients = filteredClient.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  
  const open_modal = searchParam.get("action");

  const loadClient = async () => {
    try {
      if (!canManageClient) {
    return;
  }
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
    if (status === "authenticated") {
      loadClient();
    }

    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  useEffect(() => {
    if (open_modal === "open") {
      onpenCreateModal();
    }
  }, [open_modal]);

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
    if (!canManageClient) {
    
    return;
  }
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

      toast.success(res.data.message);
      closeModal();
       if (from === "vente") {
      router.push("/vente");
      return;
    }
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
      <div className="flex gap-2 mb-4">
        <button className="btn btn-primary" onClick={onpenCreateModal}>
          Ajouter un client
        </button>
        <input
          type="text"
          placeholder="Rechercher un client..."
          className="input input-bordered w-full max-w-sm mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredClient.length > 0 ? (
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
              {paginatedClients.map((client) => (
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
          <div className="flex justify-center gap-2 mt-4">
            <button
              className="btn btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Précédent
            </button>

            <span className="px-2">
              Page {currentPage} / {totalPages}
            </span>

            <button
              className="btn btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Suivant
            </button>
          </div>
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
