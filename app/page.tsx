
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

export default function Home() {
  const {accueil,produit,utilisateur,category,client,fournisseur,unite}=useAppContext();
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
     {accueil && <h1 className="text-4xl font-bold text-center mt-10">Bienvenue sur la page d'accueil</h1>}
      {produit && <Produit/>}
      {utilisateur && <UtilisateurForm/>}
      {category && <CategoryForm/>}
      {client && <ClientForm/>}
      {fournisseur && <FournisseurForm/>}
      {unite && <UniteForm/>}
    </div>
    </>
  );
}
