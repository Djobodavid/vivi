
"use client";
import { useState } from "react";
import Image from "next/image";
import Produit from "./pages/page.produit";
import UtilisateurForm from "./pages/page.utilisateur";
import CategoryForm from "./pages/page.category";
import ClientForm from "./pages/page.client";
import FournisseurForm from "./pages/page.fournisseur";
import UniteForm from "./pages/page.unite";
import { useAppContext } from "./providers/app.context";
import ConnexionForm from "./pages/page.connexion";
import Rapport from "./pages/page.rapport";

export default function Home() {
  const {accueil,produit,utilisateur,category,client,fournisseur,unite,connexion,rapport}=useAppContext();
 /*  const [accueil, setAccueil] = useState(true)
  const [produit, setProduit] = useState(false)
  const [utilisateur, setUtilisateur] = useState(false)
  const [category, setCategory] = useState(false)
  const [client, setClient] = useState(false)
  const [fournisseur, setFournisseur] = useState(false)
  const [unite, setUnite] = useState(false) */

  return (
    <>
    <div>
     {accueil && <ConnexionForm/>}
      {produit && <Produit/>}
      {utilisateur && <UtilisateurForm/>}
      {category && <CategoryForm/>}
      {client && <ClientForm/>}
      {fournisseur && <FournisseurForm/>}
      {unite && <UniteForm/>}
      {rapport && <Rapport/>}
      {connexion && <ConnexionForm/>}
      
    </div>
    </>
  );
}
