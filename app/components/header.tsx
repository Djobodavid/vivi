"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from "@heroui/react";
import { useAppContext } from "../providers/app.context";

export default function NavbarComponent() {
    const {setAccueil,setCategory,setProduit,setUtilisateur,setClient,setFournisseur,setUnite} = useAppContext();
  return (
    <Navbar className=" shadow-sm h-10 p-10">
      <NavbarBrand className="mr-10">
        <p className="font-bold text-inherit text-5xl">DERMASTOCK</p>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Button onPress={(e)=>{
            setAccueil(true)
            setCategory(false)
            setProduit(false)
            setUtilisateur(false)
            setClient(false)
            setFournisseur(false)
            setUnite(false)
          }}>Accueil</Button>
        </NavbarItem>
        <NavbarItem>
          <Button onPress={(e)=>{
            setAccueil(false)
            setCategory(false)
            setProduit(true)
            setUtilisateur(false)
            setClient(false)
            setFournisseur(false)
            setUnite(false)
          }}>Produits</Button>
        </NavbarItem>
        <NavbarItem>
          <Button onPress={(e)=>{
            setAccueil(false)
            setCategory(true)
            setProduit(false)
            setUtilisateur(false)
            setClient(false)
            setFournisseur(false)
            setUnite(false)
          }}>Catégories</Button>
        </NavbarItem>
        <NavbarItem>
          <Button  onPress={(e)=>{

          }} >Ventes</Button>
        </NavbarItem>
         <NavbarItem>
          <Button color="primary">Ajouter produit</Button>
        </NavbarItem>

      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Button href="#">Connexion</Button>
        </NavbarItem>
       
      </NavbarContent>
    </Navbar>
  );
}