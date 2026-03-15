"use client"; // Obligatoire pour useContext
import { createContext, useState, ReactNode, useContext } from "react";

interface AppContextType {
  accueil: boolean;
  setAccueil: React.Dispatch<React.SetStateAction<boolean>>;
  produit: boolean;
  setProduit: React.Dispatch<React.SetStateAction<boolean>>;
  utilisateur: boolean;
  setUtilisateur: React.Dispatch<React.SetStateAction<boolean>>;
  category: boolean;
  setCategory: React.Dispatch<React.SetStateAction<boolean>>;
  client: boolean;
  setClient: React.Dispatch<React.SetStateAction<boolean>>;
  fournisseur: boolean;
  setFournisseur: React.Dispatch<React.SetStateAction<boolean>>;
  unite: boolean;
  setUnite: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [accueil, setAccueil] = useState(true);
  const [produit, setProduit] = useState(false);
  const [utilisateur, setUtilisateur] = useState(false);
  const [category, setCategory] = useState(false);
  const [client, setClient] = useState(false);
  const [fournisseur, setFournisseur] = useState(false);
  const [unite, setUnite] = useState(false);

  return (
    <AppContext.Provider
      value={{
        accueil,
        setAccueil,
        produit,
        setProduit,
        utilisateur,
        setUtilisateur,
        category,
        setCategory,
        client,
        setClient,
        fournisseur,
        setFournisseur,
        unite,
        setUnite
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
