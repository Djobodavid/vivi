import React from "react";

type Props = {
  name: string;
  email: string;
  role: string;
  prenoms: string;
  telephone: string;
  motDePasse: string;
  confirme: string;
  error?: string;
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
  error,
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
  const passwordsMatch = motDePasse === confirme;

  return (
    <dialog id="user_modal" className="modal">
      <div className="modal-box">
        <form onSubmit={onSubmit}>
          
          {/* Bouton fermer */}
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

          {/* Message erreur */}
          {error && (
            <p className="text-red-500 mb-2">{error}</p>
          )}

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
            className="input input-bordered w-full mb-2"
            required
          />

          <input
            type="password"
            placeholder="Confirmer mot de passe"
            value={confirme}
            onChange={(e) => onChangeConfirme(e.target.value)}
            className={`input input-bordered w-full mb-2 ${
              confirme && !passwordsMatch ? "border-red-500" : ""
            }`}
            required
          />

          {/* Message si non identique */}
          {confirme && !passwordsMatch && (
            <p className="text-red-500 text-sm mb-2">
              Les mots de passe ne correspondent pas
            </p>
          )}

          {/* Boutons */}
          <div className="flex justify-between mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !passwordsMatch}
            >
              {loading
                ? "Chargement..."
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