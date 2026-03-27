import React from "react";

type Props = {
  name: string;
  telephone: string;
  adresse: string;
  loading: boolean;
  onclose: () => void;
  onchangeName: (value: string) => void;
  onchangeTelephone: (value: string) => void;
  onchangeAddress: (value: string) => void;
  onSubmit: () => void;
  editMode?: boolean;
};

const ClientModal = ({
  name,
  telephone,
  adresse,
  loading,
  onclose,
  onchangeName,
  onchangeTelephone,
  onchangeAddress,
  onSubmit,
  editMode,
}: Props) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // empêche le reload de page
    onSubmit();
  };

  return (
    <dialog id="category_modal" className="modal">
      <div className="modal-box">
        <form onSubmit={handleSubmit}>
          {/* bouton fermer */}
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onclose}
          >
            ✕
          </button>

          <h3 className="font-bold text-lg mb-4">
            {editMode ? "Modifier le client" : "Nouveau client"}
          </h3>

          <input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={(e) => onchangeName(e.target.value)}
            className="input input-bordered w-full mb-4"
            required
          />
          <input
            type="tel"
            placeholder="Téléphone"
            value={telephone}
            onChange={(e) => onchangeTelephone(e.target.value)}
            className="input input-bordered w-full mb-4"
            required
          />
          <input
            type="text"
            placeholder="Adresse"
            value={adresse}
            onChange={(e) => onchangeAddress(e.target.value)}
            className="input input-bordered w-full mb-4"
            required
          />

          <button
            type="submit" // ← important pour que required fonctionne
            className="btn btn-primary "
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

export default ClientModal;
