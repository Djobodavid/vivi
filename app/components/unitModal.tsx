import React from "react";

type Props = {
  name: string;
  description: string;
  loading: boolean;
  onclose: () => void;
  onchangeName: (value: string) => void;
  onchangeDescription: (value: string) => void;
  onSubmit: () => void;
  editMode?: boolean;
};

const UniteModal = ({
  name,
  description,
  loading,
  onclose,
  onchangeName,
  onchangeDescription,
  onSubmit,
  editMode,
}: Props) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // empêche le reload
    onSubmit();
  };
  return (
    <dialog id="category_modal" className="modal">
      <div className="modal-box">
        <form onSubmit={handleSubmit}>
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onclose}
          >
            ✕
          </button>

          <h3 className="font-bold text-lg mb-4">
            {editMode ? "Modifier l'unité" : "Nouvelle unité"}
          </h3>

          <input
            type="text"
            placeholder="Nom"
            value={name || ""}
            onChange={(e) => onchangeName(e.target.value)}
            className="input input-bordered w-full mb-4"
            required
          />

          <input
            type="text"
            placeholder="Description"
            value={description || ""}
            onChange={(e) => onchangeDescription(e.target.value)}
            className="input input-bordered w-full mb-4"
          />

          <button type="submit" className="btn btn-primary" disabled={loading}>
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

export default UniteModal;
