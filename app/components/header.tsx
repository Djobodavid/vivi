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
  const {
    setAccueil,
    setCategory,
    setProduit,
    setUtilisateur,
    setClient,
    setFournisseur,
    setUnite,
    setConnexion,
    setStock,
    setInventaire,
    setRapport,
  } = useAppContext();
  return (
    <Navbar className="gap-6 p-5  space-x-5">
      <NavbarBrand className="mr-4">
        <p className="font-bold text-inherit text-2xl">DERMASTOCK</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4 space-x-5 ">
        <NavbarItem>
          <Button
            onPress={(e) => {
              setAccueil(true);
              setCategory(false);
              setProduit(false);
              setUtilisateur(false);
              setClient(false);
              setFournisseur(false);
              setUnite(false);
              setStock(false);
              setConnexion(false);
            }}
          >
            Accueil
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            onPress={(e) => {
              setAccueil(false);
              setCategory(false);
              setProduit(true);
              setUtilisateur(false);
              setClient(false);
              setFournisseur(false);
              setUnite(false);
              setStock(false);
              setConnexion(false);
            }}
          >
            Produits
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            onPress={(e) => {
              setAccueil(false);
              setCategory(true);
              setProduit(false);
              setUtilisateur(false);
              setClient(false);
              setFournisseur(false);
              setUnite(false);
              setStock(false);
              setConnexion(false);
            }}
          >
            Catégories
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            onPress={(e) => {
              setAccueil(false);
              setCategory(false);
              setProduit(false);
              setInventaire(true);
              setUtilisateur(false);
              setClient(false);
              setFournisseur(false);
              setUnite(false);
              setStock(false);
              setConnexion(false);
            }}
          >
            Invetnaire
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            onPress={(e) => {
              setAccueil(false);
              setCategory(false);
              setProduit(false);
              setUtilisateur(false);
              setClient(false);
              setFournisseur(false);
              setUnite(false);
              setStock(true);
              setConnexion(false);
              setInventaire(false);
            }}
          >
            Stock
          </Button>
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">
          <Button
            onPress={(e) => {
              setConnexion(false);
              setAccueil(false);
              setCategory(false);
              setProduit(false);
              setUtilisateur(false);
              setClient(false);
              setFournisseur(false);
              setUnite(false);
              setStock(false);
              setInventaire(false);
              setRapport(true);
            }}
          >
            Rapport
          </Button>
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">
          <Button
            onPress={(e) => {
              setConnexion(true);
              setAccueil(false);
              setCategory(false);
              setProduit(false);
              setUtilisateur(false);
              setClient(false);
              setFournisseur(false);
              setUnite(false);
              setStock(false);
              setInventaire(false);
            }}
          >
            Connexion
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
