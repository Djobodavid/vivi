"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import ConsultationModal from "../components/ConsultationModal";
import EmptyState from "../components/EmptyState";
import { Stethoscope, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

const Page = () => {
  const { status } = useSession();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [diagnostic, setDiagnostic] = useState("");
  const [traitement, setTraitement] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (status === "authenticated") loadConsultations();
    if (status === "unauthenticated") redirect("/");
  }, [status]);

  const loadConsultations = async () => {
    try {
      const res = await axios.get("/api/consultation");
      if (res.data.success) setConsultations(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur chargement");
    }
  };

  const openModal = () => {
    setEditMode(false);
    setNom(""); setPrenom(""); setDiagnostic(""); setTraitement("");
    (document.getElementById("consultation_modal") as HTMLDialogElement)?.showModal();
  };

  const closeModal = () => {
    (document.getElementById("consultation_modal") as HTMLDialogElement)?.close();
  };

  const handleEdit = (c: any) => {
    setEditMode(true);
    setSelectedId(c.id);
    setNom(c.nom); setPrenom(c.prenom);
    setDiagnostic(c.diagnostic); setTraitement(c.traitement);
    (document.getElementById("consultation_modal") as HTMLDialogElement)?.showModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette consultation ?")) return;
    try {
      await axios.delete("/api/consultation", { data: { id } });
      toast.success("Supprimée");
      loadConsultations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur suppression");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editMode) {
        await axios.put("/api/consultation", { id: selectedId, nom, prenom, diagnostic, traitement });
        toast.success("Consultation modifiée");
      } else {
        await axios.post("/api/consultation", { nom, prenom, diagnostic, traitement });
        toast.success("Consultation créée");
      }
      closeModal();
      loadConsultations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const filtered = consultations.filter((c) =>
    `${c.nom} ${c.prenom}`.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Wrapper>
      <div className="flex gap-2 mb-4">
        <button className="btn btn-primary" onClick={openModal}>
          Nouvelle consultation
        </button>
        <input
          type="text" placeholder="Rechercher..."
          className="input input-bordered w-full"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((c) => (
              <div key={c.id} className="border p-4 rounded-xl shadow flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Stethoscope className="text-primary" size={20} />
                  <p className="font-bold">{c.nom} {c.prenom}</p>
                </div>
                <p className="text-sm"><span className="font-semibold">Diagnostic:</span> {c.diagnostic}</p>
                <p className="text-sm"><span className="font-semibold">Traitement:</span> {c.traitement}</p>
                <p className="text-xs text-gray-400">
                  {new Date(c.date_consultation).toLocaleDateString()}
                </p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleEdit(c)} className="btn btn-sm btn-outline btn-primary flex-1">
                    <Pencil size={14} /> Modifier
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="btn btn-sm btn-outline btn-error flex-1">
                    <Trash2 size={14} /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-4 gap-2">
            <button className="btn btn-sm" disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}>Précédent</button>
            <span className="px-2">Page {currentPage} / {totalPages}</span>
            <button className="btn btn-sm" disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}>Suivant</button>
          </div>
        </>
      ) : (
        <EmptyState iconComponent={Stethoscope} message="Aucune consultation" />
      )}

      <ConsultationModal
        nom={nom} prenom={prenom} diagnostic={diagnostic} traitement={traitement}
        loading={loading} editMode={editMode}
        onClose={closeModal} onSubmit={handleSubmit}
        onChangeNom={setNom} onChangePrenom={setPrenom}
        onChangeDiagnostic={setDiagnostic} onChangeTraitement={setTraitement}
      />
    </Wrapper>
  );
};

export default Page;