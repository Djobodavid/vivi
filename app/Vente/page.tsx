"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { toast } from "react-toastify";
import axios from "axios";
import EmptyState from "../components/EmptyState";
import { Group, Trash } from "lucide-react";
import { addAbortSignal } from "stream";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../components/providers/context.proveder";

const page = () => {
  const { formdataVente, setFormdataVente } = useAppContext();

  const { status } = useSession(); // ✅ AJOUT ICI
  const [search, setSearch] = useState<string>("");
  const [stocks, setStocks] = useState<any[]>([]);
  const [selectedProduitId, setSelectedProduitId] = useState<string[]>([]);
  const [montantRecu, setMontantRecu] = useState(0);
  const [clientId, setClientId] = useState("");
  const [order, setOrder] = useState<any[]>([]);
  const [openClientModal, setOpenClientModal] = useState(false);
  const [modePaiement, setModePaiement] = useState("cash");
  const [client, setClient] = useState<{ label: string; value: string }[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewData, setPreviewData] = useState<{
    totalReel: number;
    details: {
      nom?: string;
      productId: string;
      quantite: number;
      prixUnitaire: number;
      total: number;
    }[];
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const filteredProduit = stocks
    .filter((item) => item.nom?.toLowerCase().includes(search.toLowerCase()))
    .filter((item) => !selectedProduitId.includes(item.produitId));

  // 🔥 pagination
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedProduits = filteredProduit.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const totalPages = Math.ceil(filteredProduit.length / itemsPerPage);

  const handleSubmitVente = async () => {
    try {
      if (order.length === 0) {
        toast.error("Panier vide");
        return;
      }

      const payload = {
        items: order.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        clientId: clientId || null,
        modePaiement,
        montantRecu,
        utilisateurId: session?.user?.id,
      };

      const res = await axios.post("/api/vente", payload);

      if (res.data.success) {
        toast.success(
          `Vente enregistrée — Total : ${res.data.data?.total} FCFA`,
        );
        setOrder([]);
        setMontantRecu(0);
        setClientId("");
        loadProduits();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la vente");
    }
  };

  const handlePreviewVente = async () => {
    if (order.length === 0) {
      toast.error("Panier vide");
      return;
    }

    setLoadingPreview(true);
    try {
      const res = await axios.post("/api/vente/preview", {
        items: order.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          nom: item.name,
        })),
      });

      if (res.data.success) {
        setPreviewData(res.data.data);
        setShowConfirmModal(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  const removeItem = (id: string) => {
    setOrder((prev) => prev.filter((item) => item.productId !== id));
  };

  const handleAddToCart = (item: any) => {
    setOrder((prev) => {
      const existing = prev.find((p) => p.productId === item.produitId);

      if (existing) {
        return prev.map((p) =>
          p.productId === item.produitId
            ? {
                ...p,
                quantity: Math.min(p.quantity + 1, item.stock_total),
              }
            : p,
        );
      }

      return [
        ...prev,
        {
          productId: item.produitId,
          name: item.nom,
          image: item.image,
          price: item.prix_min, // ou prix choisi
          quantity: 1,
          availableQuantity: item.stock_total,
        },
      ];
    });
  };

  const loadClient = async () => {
    try {
      const res = await axios.get("/api/client");

      if (res.data.success) {
        const options = res.data.data.map((f: any) => ({
          label: f.nom,
          value: f.id,
        }));
        setClient(options);
      }
    } catch (error: any) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        (error.request ? "Serveur inaccessible" : "Erreur inattendue");

      toast.error(message);
    }
  };

  const total = order.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  const monnaie = montantRecu - total;

  const updateQuantity = (id: string, qty: number) => {
    setOrder((prev) =>
      prev.map((item) =>
        item.productId === id
          ? {
              ...item,
              quantity: Math.min(Math.max(qty, 1), item.availableQuantity),
            }
          : item,
      ),
    );
  };

  const loadProduits = async () => {
    try {
      const res = await axios.get("/api/vente");

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
    if (status === "authenticated") {
      loadProduits();
      loadClient();
    }
    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  return (
    <Wrapper>
      <div className="flex flex-col-reverse md:flex-row ">
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
              paginatedProduits.map((item, index) => (
                <div
                  key={index}
                  className="border-2 border-base-200 p-4 rounded-3xl w-full items-center"
                >
                  <div className="flex items-center gap-3">
                    {/* IMAGE */}
                    <div className="w-10 h-10 rounded overflow-hidden bg-base-200 ">
                      <img
                        src={item.image || "/no-image.png"}
                        alt={item.nom || "produit"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* TEXTE */}
                    <div className="flex flex-col">
                      <span className="font-semibold">{item.nom || "N/A"}</span>

                      <span className="badge badge-warning badge-soft font-semibold text-gray-500">
                        {item.categoryNom || ""}
                      </span>

                      <span className="badge badge-warning badge-soft font-semibold text-gray-500">
                        Stock: {item.stock_total}
                      </span>

                      <span className="badge badge-warning badge-soft font-semibold text-gray-500">
                        {item.prix_min === item.prix_max
                          ? `${item.prix_min} FCFA`
                          : `À partir de ${item.prix_min} FCFA`}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="btn btn-sm btn-primary"
                      >
                        +
                      </button>
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
            <div className="flex justify-center mt-4 gap-2">
              <button
                className="btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Précédent
              </button>

              <span>
                Page {currentPage} / {totalPages || 1}
              </span>

              <button
                className="btn btn-sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
        <div className="md:w-2/3 md:ml-4 mb-4 md:mb-0 p-4 flex flex-col h-fit border-2 border-base-200 rounded-3xl overflow-x-auto">
          {/* HEADER */}
          <h2 className="font-bold text-lg mb-4">🧾 Vente en cours</h2>

          {/* LISTE PANIER */}
          <div className="flex flex-wrap gap-4">
            {order.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">
                Aucun produit sélectionné
              </div>
            ) : (
              order.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  {/* PRODUIT */}
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || "/no-image.png"}
                      alt={item.nom || "produit"}
                      className="w-10 h-10 rounded overflow-hidden bg-base-200 "
                    />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs opacity-60">{item.price} FCFA</p>
                      <input
                        aria-label="text"
                        type="number"
                        min={1}
                        max={item.availableQuantity}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.productId, Number(e.target.value))
                        }
                        className="input input-sm w-20 text-center"
                      />
                      <div className=" text-center font-semibold">
                        {item.quantity * item.price} FCFA
                      </div>
                    </div>
                  </div>

                  {/* TOTAL LIGNE */}

                  {/* SUPPRIMER */}
                  <button
                    aria-label="text"
                    onClick={() => removeItem(item.productId)}
                    className="btn btn-sm btn-error"
                  >
                    <Trash />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* BLOC BAS (TOTAUX + CLIENT + PAIEMENT) */}
          <div className="border-t pt-4 mt-4 space-y-3">
            {/* TOTAL */}
            <div className="flex justify-between font-bold text-lg">
              <span>Total estimé</span>
              <span>{total} FCFA</span>
            </div>

            {/* ✅ Avertissement si prix multiple */}
            <p className="text-xs text-warning">
              * Le total final peut varier selon les prix des lots disponibles
            </p>

            {/* MONTANT REÇU */}
            <div className="flex justify-items-start">
              <label className="font-bold ">Montant reçu:</label>
              <input
                type="number"
                placeholder="Montant reçu"
                value={montantRecu}
                onChange={(e) => setMontantRecu(Number(e.target.value))}
                className="input input-bordered w-full"
              />
            </div>

            {/* MONNAIE */}
            <div className="flex justify-between">
              <span>Monnaie à rendre</span>
              <span className="font-bold">
                {montantRecu - total > 0 ? montantRecu - total : 0} FCFA
              </span>
            </div>

            {/* CLIENT */}
            <div className="flex items-center gap-2">
              <select
                aria-label="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">Client </option>
                {client.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              <button
                className="btn btn-sm btn-primary whitespace-nowrap"
                onClick={() => router.push("/clients?action=open&from=vente")}
              >
                + Nouveau client
              </button>
            </div>

            {/* MODE PAIEMENT */}
            <select
              aria-label="text"
              value={modePaiement}
              onChange={(e) => setModePaiement(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="cash">Cash</option>
              <option value="mobile">Mobile Money</option>
              <option value="credit">Crédit</option>
            </select>

            {/* BOUTON VALIDER */}
            <button
              className="btn btn-primary w-full"
              onClick={handlePreviewVente}
              disabled={loadingPreview}
            >
              {loadingPreview ? "Calcul en cours..." : "Voir le total réel"}
            </button>
          </div>
        </div>
      </div>

      {showConfirmModal && previewData && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md font-mono text-sm">
            <h2 className="font-bold text-lg mb-4 text-center">
              Confirmation de vente
            </h2>

            <table className="w-full mb-4">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2">Produit</th>
                  <th className="text-center pb-2">Qté</th>
                  <th className="text-right pb-2">Prix</th>
                  <th className="text-right pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {previewData.details.map((d, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-1">{d.nom || d.productId}</td>
                    <td className="text-center py-1">{d.quantite}</td>
                    <td className="text-right py-1">{d.prixUnitaire} FCFA</td>
                    <td className="text-right py-1 font-bold">
                      {d.total} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between font-bold text-base border-t pt-3 mb-4">
              <span>Total réel</span>
              <span className="text-primary">{previewData.totalReel} FCFA</span>
            </div>

            <div className="flex justify-between mb-4">
              <span>Montant reçu</span>
              <span>{montantRecu} FCFA</span>
            </div>

            <div className="flex justify-between mb-6">
              <span>Monnaie à rendre</span>
              <span className="font-bold">
                {montantRecu - previewData.totalReel > 0
                  ? montantRecu - previewData.totalReel
                  : 0}{" "}
                FCFA
              </span>
            </div>

            <div className="flex gap-3">
              <button
                className="btn btn-outline w-1/2"
                onClick={() => setShowConfirmModal(false)}
              >
                Annuler
              </button>
              <button
                className="btn btn-primary w-1/2"
                onClick={async () => {
                  if (
                    montantRecu < previewData.totalReel &&
                    modePaiement !== "credit"
                  ) {
                    toast.error(
                      `Montant insuffisant. Total réel : ${previewData.totalReel} FCFA`,
                    );
                    setShowConfirmModal(false);
                    return;
                  }
                  setShowConfirmModal(false);
                  await handleSubmitVente();
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default page;
