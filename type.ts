export type Produits = {
    nom:string,
    pAchat:number
    pVente:number
    image:string
    dExpiration:Date
};
export type Utilisateur = {
  nom: string
  prenom: string
  telephone: string
  role: string
  email: string
  motDePasse: string
}

export type Category = {
  name: string
  description: string
}

export type Client = {
  nom: string
  adresse: string
  telephone: string
}

export type Fournisseur = {
  nom: string
  adresse: string
  telephone: string
}

export type Unite = {
  name: string
}