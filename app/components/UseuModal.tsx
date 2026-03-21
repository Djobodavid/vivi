import React from "react";

type Props = {
  name: string;
  email: string;
  role: string;
  prenoms: string;
  telephone: string;
  motDePasse: string;
  confirme: string;
  loading: boolean;
  onClose: () => void;
  onChangeName: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangeRole: (value: string) => void;
  onChangePrenoms: (value: string) => void;
  onChangeConfirme: (value: string) => void;
  onChangeTelephone: (value: string) => void;
  onChangePassword: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  editMode?: boolean;
};

const UtilisateurModal = ({
  name,
  email,
  role,
  loading,
  prenoms,
  telephone,
  motDePasse,
  confirme,
  onClose,
  onChangeName,
  onChangePrenoms,
  onChangeTelephone,
  onChangeConfirme,
  onChangePassword,
  onChangeEmail,
  onChangeRole,
  onSubmit,
  onReset,
  editMode,
}: Props) => {
  return (
    <dialog id="user_modal" className="modal">
      <div className="modal-box">
        {/* Formulaire principal */}
        <form onSubmit={onSubmit}>
          {/* Bouton pour fermer le modal */}
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>

          <h3 className="font-bold text-lg mb-4">
            {editMode ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </h3>

          <input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            className="input input-bordered w-full mb-4"
            required
          />
          <input
            type="text"
            placeholder="Prénoms"
            value={prenoms}
            onChange={(e) => onChangePrenoms(e.target.value)}
            className="input input-bordered w-full mb-4"
            required
          />
          <input
            type="text"
            placeholder="Téléphone"
            value={telephone}
            onChange={(e) => onChangeTelephone(e.target.value)}
            className="input input-bordered w-full mb-4"
            required
          />

          <select
            value={role}
            onChange={(e) => onChangeRole(e.target.value)}
            className="select select-bordered w-full mb-4"
            required
          >
            <option value="">Sélectionner un rôle</option>
            <option value="admin">Admin</option>
            <option value="gestionnaire">Gestionnaire</option>
            <option value="agent">Agent</option>
          </select>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => onChangeEmail(e.target.value)}
            className="input input-bordered w-full mb-4"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={motDePasse}
            onChange={(e) => onChangePassword(e.target.value)}
            className="input input-bordered w-full mb-4"
            required
          />
          <input
            type="password"
            placeholder="Confirmer mot de passe"
            value={confirme}
            onChange={(e) => onChangeConfirme(e.target.value)}
            className="input input-bordered w-full mb-4"
            required
          />

          {/* Boutons action */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Création..."
                : editMode
                ? "Modifier"
                : "Créer"}
            </button>

            <button
              type="button"
              className="btn btn-warning"
              onClick={onReset}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default UtilisateurModal;