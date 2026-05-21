"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import axios from "axios";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const Page = () => {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role;
  const [seuilMin, setSeuilMin] = useState("");
  const [loading, setLoading] = useState(false);
  const [prixConsultation, setPrixConsultation] = useState("");

  const loadParametres = async () => {
    try {
      const res = await axios.get("/api/settings/parametres");
      if (res.data.success) {
        const seuil = res.data.data.find(
          (p: any) => p.cle === "seuil_stock_min",
        );
        const prix = res.data.data.find(
          (p: any) => p.cle === "prix_consultation",
        );
        if (seuil) setSeuilMin(seuil.valeur);
        if (prix) setPrixConsultation(prix.valeur);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSavePrix = async () => {
    if (!prixConsultation || Number(prixConsultation) <= 0) {
      toast.error("Prix invalide");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.put("/api/settings/parametres", {
        cle: "prix_consultation",
        valeur: prixConsultation,
      });
      if (res.data.success) toast.success("Prix mis à jour !");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!seuilMin || Number(seuilMin) <= 0) {
      toast.error("Seuil invalide");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put("/api/settings/parametres", {
        cle: "seuil_stock_min",
        valeur: seuilMin,
      });
      if (res.data.success) toast.success("Seuil mis à jour !");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") loadParametres();
    if (status === "unauthenticated") redirect("/");
  }, [status]);

  return (
    <Wrapper>
      <h1 className="text-2xl font-bold mb-6">Réglages</h1>

      <div className="max-w-lg">
        <div className="bg-base-100 border border-base-300 rounded-2xl p-6">
          <h2 className="font-bold mb-1">Seuil minimum de stock</h2>
          <p className="text-sm text-gray-500 mb-4">
            Une alerte sera déclenchée quand le stock total d'un produit passe
            sous ce seuil.
          </p>

          <div className="flex gap-3 items-center">
            <input
              type="number"
              className="input input-bordered w-full"
              value={seuilMin}
              onChange={(e) => setSeuilMin(e.target.value)}
              placeholder="Ex: 20"
              min={1}
              disabled={role !== "admin"}
            />
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading || role !== "admin"}
            >
              {loading ? "..." : "Sauvegarder"}
            </button>
          </div>

          {role !== "admin" && (
            <p className="text-xs text-error mt-2">
              Seul un administrateur peut modifier ce paramètre.
            </p>
          )}
        </div>
      </div>
      <div className="bg-base-100 border border-base-300 rounded-2xl p-6 mt-4">
        <h2 className="font-bold mb-1">Prix de consultation</h2>
        <p className="text-sm text-gray-500 mb-4">
          Ce montant sera ajouté au bénéfice à chaque consultation enregistrée.
        </p>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            className="input input-bordered w-full"
            value={prixConsultation}
            onChange={(e) => setPrixConsultation(e.target.value)}
            placeholder="Ex: 5000"
            min={1}
            disabled={role !== "admin"}
          />
          <button
            className="btn btn-primary"
            onClick={handleSavePrix}
            disabled={loading || role !== "admin"}
          >
            {loading ? "..." : "Sauvegarder"}
          </button>
        </div>
        {role !== "admin" && (
          <p className="text-xs text-error mt-2">
            Seul un administrateur peut modifier ce paramètre.
          </p>
        )}
      </div>
    </Wrapper>
  );
};

export default Page;
