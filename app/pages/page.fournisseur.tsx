"use client"

import { Fournisseur } from "@/type"
import React, { useState } from "react"

type Client = {
  nom: string
  adresse: string
  telephone: string
}

const FournisseurForm = () => {

const [fournisseur, setFournisseur] = useState<Fournisseur>({
  nom: "",
  adresse: "",
  telephone: ""
})

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target

  setFournisseur({
    ...fournisseur,
    [name]: value
  })
}

return (
<div className="flex justify-center items-center min-h-screen">

<div className="bg-white shadow-md p-6 rounded-xl w-full max-w-md">

<h1 className="text-2xl font-bold mb-6 text-center">
Créer un fournisseur
</h1>

<form className="space-y-4">

<input
type="text"
name="nom"
placeholder="Nom"
className="btn btn-bordered w-full"
value={fournisseur.nom}
onChange={handleChange}
/>

<input
type="text"
name="adresse"
placeholder="Adresse"
className="btn btn-bordered w-full"
value={fournisseur.adresse}
onChange={handleChange}
/>

<input
type="text"
name="telephone"
placeholder="Téléphone"
className="btn btn-bordered w-full"
value={fournisseur.telephone}
onChange={handleChange}
/>

<button
type="submit"
className="btn btn-primary"
>
Enregistrer
</button>

</form>

</div>

</div>
)
}

export default FournisseurForm