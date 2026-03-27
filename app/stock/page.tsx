"use client";

import React, { useState } from "react";
import Wrapper from "../components/Wrapper";
import stockModal from "../components/stockModal";
import StockModal from "../components/stockModal";

const Page = () => {
  const [dateStock, setDateStock] = useState("");
  const [dateExpiration, setDateExpiration] = useState("");

  const [quantiteStock, setQuantiteStock] = useState("");
  const [quantiteMinStock, setQuantiteMinStock] = useState("");

  const [prixUnitaire, setPrixUnitaire] = useState("");
  const [autreFrais, setAutreFrais] = useState("");

  const [observation, setObservation] = useState("");

  const [produitId, setProduitId] = useState("");
  const [fournisseurId, setFournisseurId] = useState("");
  const [utilisateurId, setUtilisateurId] = useState("");
  const [uniteId, setUniteId] = useState("");

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);


  const produits = [
    { label: "Paracétamol", value: "1" },
    { label: "Ibuprofène", value: "2" },
  ];

  const fournisseurs = [
    { label: "Pharma Togo", value: "1" },
    { label: "Med Supply", value: "2" },
  ];

  const utilisateurs = [
    { label: "Admin", value: "1" },
    { label: "Docteur", value: "2" },
  ];

  const unites = [
    { label: "Boîte", value: "1" },
    { label: "Flacon", value: "2" },
  ];

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
        utilisateurId={utilisateurId}
        uniteId={uniteId}
        produits={produits}
        fournisseurs={fournisseurs}
        utilisateurs={utilisateurs}
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
        onChangeUtilisateur={setUtilisateurId}
        onChangeUnite={setUniteId}
      />
    </Wrapper>
  );
};

export default Page;
