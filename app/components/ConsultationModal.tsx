import React from "react";

type Props = {
  nom: string;
  prenom: string;
  diagnostic: string;
  traitement: string;
  loading: boolean;
  editMode?: boolean;
  onClose: () => void;
  onChangeNom: (v: string) => void;
  onChangePrenom: (v: string) => void;
  onChangeDiagnostic: (v: string) => void;
  onChangeTraitement: (v: string) => void;
  onSubmit: () => void;
};

const ConsultationModal = ({
  nom,
  prenom,
  diagnostic,
  traitement,
  loading,
  editMode,
  onClose,
  onChangeNom,
  onChangePrenom,
  onChangeDiagnostic,
  onChangeTraitement,
  onSubmit,
}: Props) => {
  return (
    <dialog id="consultation_modal" className="modal">
      <div className="modal-box">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>

          <h3 className="font-bold text-lg mb-4">
            {editMode ? "Modifier la consultation" : "Nouvelle consultation"}
          </h3>

          <input
            type="text"
            placeholder="Nom"
            value={nom}
            onChange={(e) => onChangeNom(e.target.value)}
            className="input input-bordered w-full mb-3"
            required
          />
          <input
            type="text"
            placeholder="Prénom"
            value={prenom}
            onChange={(e) => onChangePrenom(e.target.value)}
            className="input input-bordered w-full mb-3"
            required
          />
          <textarea
            placeholder="Diagnostic"
            value={diagnostic}
            onChange={(e) => onChangeDiagnostic(e.target.value)}
            className="textarea textarea-bordered w-full mb-3"
            required
          />
          <textarea
            placeholder="Traitement"
            value={traitement}
            onChange={(e) => onChangeTraitement(e.target.value)}
            className="textarea textarea-bordered w-full mb-4"
            required
          />

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading
              ? "Enregistrement..."
              : editMode
                ? "Modifier"
                : "Enregistrer"}
          </button>
        </form>
      </div>
    </dialog>
  );
};

export default ConsultationModal;
