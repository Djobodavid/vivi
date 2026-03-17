"use client";
import { Button } from "@heroui/react";
import { useAppContext } from "../providers/app.context";

export default function NavbarComponent() {
  const {
    setAccueil, setCategory, setProduit, setUtilisateur,
    setClient, setFournisseur, setUnite, setStock,
    setInventaire, setRapport, setConnexion
  } = useAppContext();

  const handleClick = (tab: string) => {
    setAccueil(tab === "accueil");
    setCategory(tab === "category");
    setProduit(tab === "produit");
    setUtilisateur(tab === "utilisateur");
    setClient(tab === "client");
    setFournisseur(tab === "fournisseur");
    setUnite(tab === "unite");
    setStock(tab === "stock");
    setInventaire(tab === "inventaire");
    setRapport(tab === "rapport");
    setConnexion(tab === "connexion");
  };

  return (
    <div className="flex items-center gap-4 p-5 bg-transparent">
      <div className="font-bold text-2xl">DERMASTOCK</div>
      <div className="flex gap-2 ml-auto">
        {["Accueil","Produits","Category","Inventaire","Stock","Rapport","Connexion","Utilisateur"].map((tab) => (
          <Button key={tab} onPress={() => handleClick(tab.toLowerCase())}>
            {tab}
          </Button>
        ))}
      </div>
    </div>
  );
}