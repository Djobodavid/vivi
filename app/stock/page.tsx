"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import StockModal from "../components/stockModal";
import EmptyState from "../components/EmptyState";
import { Group } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const Page = () => {
  const [dateStock, setDateStock] = useState("");
  const [dateExpiration, setDateExpiration] = useState("");

  const [quantiteStock, setQuantiteStock] = useState("");
  const [quantiteMinStock, setQuantiteMinStock] = useState("");

  const [prixUnitaire, setPrixUnitaire] = useState("");
  const [autreFrais, setAutreFrais] = useState("");
  const[stocks,setStocks]=useState<any[]>([]);
  const [observation, setObservation] = useState("");

  const [produits, setProduits]=useState<{ label: string; value: string }[]>([]);
  const [produitId, setProduitId] = useState("");
  const [fournisseurId, setFournisseurId] = useState("");
  const [fournisseur, setFournisseur] = useState<{ label: string; value: string }[]>([]);
  const [utilisateurId, setUtilisateurId] = useState("");
  const [uniteId, setUniteId] = useState("");
  const [unites, setUnites] = useState<{ label: string; value: string }[]>([]);

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);


  const loadProduits = async () => {
  try {
    const res = await axios.get("/api/produits");
    // On transforme pour le select (label/value)
    const options = res.data.data.map((p: any) => ({
      label: p.nom,
      value: p.id,
    }));
    setProduits(options);
  } catch (error: any) {
    console.error(error.message);
    toast.error("Erreur lors du chargement des produits : " + error.message);
  }
};

const loadFournisseurs = async () => {
  try {
    const res = await axios.get("/api/fournisseur");
    // On transforme pour le select (label/value)
    const options = res.data.data.map((p: any) => ({
      label: p.nom,
      value: p.id,
    }));
    setFournisseur(options);
  } catch (error: any) {
    console.error(error.message);
    toast.error("Erreur lors du chargement des fournisseur : " + error.message);
  }
};

const loadUnites = async () => {
  try {
    const res = await axios.get("/api/settings/unites");
    // On transforme pour le select (label/value)
    const options = res.data.data.map((p: any) => ({
      label: p.nom,
      value: p.id,
    }));
    setUnites(options);
  } catch (error: any) {
    console.error(error.message);
    toast.error("Erreur lors du chargement des unités : " + error.message);
  }
};

useEffect(() => {
  loadProduits();
  loadFournisseurs()
  loadUnites()
  loadStock(); // si tu veux aussi charger les stocks
}, []);

  
  

  const loadStock = async () => {
 
};

  const openModal = () => {
    setEditMode(false);

    setDateStock("");
    setDateExpiration("");
    setQuantiteStock("");
    setQuantiteMinStock("");
    setPrixUnitaire("");
    setAutreFrais("");
    setObservation("");
    setProduitId("");
    setFournisseurId("");
    setUtilisateurId("");
    setUniteId("");

    (document.getElementById("stock_modal") as HTMLDialogElement)?.showModal();
  };


  const closeModal = () => {
    (document.getElementById("stock_modal") as HTMLDialogElement)?.close();
  };

 
  const handleSubmit = () => {
    setLoading(true);

    const payload = {
      date_stock: dateStock,
      date_expiration: dateExpiration,
      quantite_stock: Number(quantiteStock),
      quantite_min_stock: Number(quantiteMinStock),
      prix_unitaire_achat: Number(prixUnitaire),
      autre_frais: autreFrais ? Number(autreFrais) : null,
      observation,
      produitId,
      fournisseurId,
      utilisateurId,
      uniteId,
    };

    console.log(payload);

    setTimeout(() => {
      setLoading(false);
      closeModal();
    }, 500);
  };

  return (
    <Wrapper>
      <button className="btn btn-primary mb-4" onClick={openModal}>
        Ajouter un stock
      </button>

    
          
  <EmptyState
    iconComponent={Group}
    message="Aucun stock disponible"
  />


      <StockModal
        dateStock={dateStock}
        dateExpiration={dateExpiration}
        quantiteStock={quantiteStock}
        quantiteMinStock={quantiteMinStock}
        prixUnitaire={prixUnitaire}
        autreFrais={autreFrais}
        observation={observation}
        produitId={produitId}
        fournisseurId={fournisseurId}
        uniteId={uniteId}
        produits={produits}
        fournisseurs={fournisseur}
        unites={unites}
        loading={loading}
        editMode={editMode}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onChangeDateStock={setDateStock}
        onChangeDateExpiration={setDateExpiration}
        onChangeQuantiteStock={setQuantiteStock}
        onChangeQuantiteMinStock={setQuantiteMinStock}
        onChangePrixUnitaire={setPrixUnitaire}
        onChangeAutreFrais={setAutreFrais}
        onChangeObservation={setObservation}
        onChangeProduit={setProduitId}
        onChangeFournisseur={setFournisseurId}
        onChangeUnite={setUniteId}
      />
    </Wrapper>
  );
};

export default Page;
