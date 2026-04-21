"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { toast } from "react-toastify";
import axios from "axios";
import EmptyState from "../components/EmptyState";
import { Group } from "lucide-react";
import { addAbortSignal } from "stream";

const page = () => {
  const [search, setSearch] = useState<string>("");
  const [stocks, setStocks] = useState<any[]>([]);
  const [selectedProduitId, setSelectedProduitId] = useState<string[]>([]);

  const loadStock = async () => {
    try {
      const res = await axios.get("/api/stock");

      if (res.data.success) {
        setStocks(res.data.data);
      }
    } catch (error: any) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        (error.request ? "Serveur inaccessible" : "Erreur inattendue");

      toast.error(message);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const filteredProduit = stocks
    .filter((stock) =>
      stock.produit.nom?.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((stock) => !selectedProduitId.includes(stock.id))
    .slice(0, 10);
  return (
    <Wrapper>
      <div className="flex md:flex-row flex-col-reverse">
        <div className="md:w-1/3">
          <input
            placeholder="Rechercher un produit"
            type="text"
            name=""
            className="input input-bordered w-full mb-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="space-y-4">
            {filteredProduit.length > 0 ? (
              filteredProduit.map((item, index) => (
                <div key={index} className="border-2 border-base-200 p-4 rounded-3xl w-full items-center">
                  <div className="flex items-center gap-3">
                    {/* IMAGE */}
                    <div className="w-10 h-10 rounded overflow-hidden bg-base-200 ">
                      <img
                        src={item.produit?.image || "/no-image.png"}
                        alt={item.produit?.nom || "produit"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* TEXTE */}
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {item.produit?.nom || "N/A"}
                      </span>

                      <span className="badge badge-warning badge-soft font-semibold text-gray-500">
                        {item.category?.nom || ""}
                      </span>

                      <span className="badge badge-warning badge-soft font-semibold text-gray-500">
                        {item.quantite_stock} {item.unite?.nom || ""}
                      </span>
                       
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                iconComponent={Group}
                message="Aucun produit disponible"
              />
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default page;
