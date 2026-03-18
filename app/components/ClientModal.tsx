import React from "react";

type Props ={
    name: string;
    telephone: string;
    address: string;
    loading: boolean;
    onclose: () => void;
    onchangeName: (value: string) => void;
    onchangeTelephone: (value: string) => void;
    onchangeAddress: (value: string) => void;
    onSubmit: () => void;
    editMode?: boolean
}

const ClientModal = ({ name, telephone, address , loading, onclose, onchangeName, onchangeTelephone, onchangeAddress, onSubmit, editMode }: Props) => {
  return (
   
      
      <dialog id="category_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onclose}>
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">{editMode ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h3>
          <input type="text" placeholder="Nom" value={name} onChange={(e) => onchangeName(e.target.value)} className="input input-bordered w-full mb-4" />
          <input type="phone" placeholder="Téléphone" value={telephone} onChange={(e) => onchangeTelephone(e.target.value)} className="input input-bordered w-full mb-4" />
          <input type="text" placeholder="Adresse" value={address} onChange={(e) => onchangeAddress(e.target.value)} className="input input-bordered w-full mb-4" />
          <button className="btn btn-primary " onClick={onSubmit} disabled={loading}>
            {loading ? 'Enregistrement...' : editMode ? 'Modifier' : 'Enregistrer'}
          </button>
        </div>
      </dialog>
    
  );
};

export default ClientModal;
