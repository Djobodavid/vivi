"use client";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock, Stethoscope, Shield, Github, Linkedin, MapPin, Phone } from "lucide-react";

import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
const [successMsg, setSuccessMsg] = useState("");
  const { data, status } = useSession();
const router = useRouter();

 useEffect(() => {
  if (status === "authenticated") {
    const role = (data?.user as any)?.role;
    if (role === "admin") {
      router.push("/rapport");
    } else if (role === "gestionnaire") {
      router.push("/stock");
    } else {
      router.push("/vente");
    }
  }
}, [status, data]);


const handleLogin = async () => {
  if (!email || !password) {
    setErrorMsg("Tous les champs sont requis");
    return;
  }
  setLoading(true);
  setErrorMsg("");
  
  try {
    await signIn("credentials", { email, password, redirect: false });
    setSuccessMsg("Connexion réussie !");
  } catch (error: any) {
    setErrorMsg("Email ou mot de passe invalide");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen" style={{ background: "#0a1628", fontFamily: "sans-serif" }}>

      {/* HERO SECTION */}
      <div
        className="relative flex flex-col items-center justify-center px-4 py-16"
        style={{
          background: "linear-gradient(180deg, rgba(10,22,40,0.92) 0%, rgba(10,22,40,0.98) 100%), url('/bg-pharmacy.jpg') center/cover no-repeat",
          minHeight: "100vh",
        }}
      >
        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "#3B6D11" }}>
            <Stethoscope size={32} color="white" />
          </div>
          <h1 className="text-4xl font-bold" style={{ color: "white" }}>
            Derma<span style={{ color: "#5DCAA5" }}>Stock</span>
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#8BA0B8" }}>
            Gestion médicale intelligente et sécurisée
          </p>
          <div className="w-12 h-0.5 mt-3 rounded" style={{ background: "#3B6D11" }} />
          <p className="mt-3 text-xs text-center max-w-sm" style={{ color: "#8BA0B8", lineHeight: 1.7 }}>
            DermaStock vous aide à gérer votre stock, vos ventes et vos consultations en temps réel, adapté au marché togolais.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="w-full max-w-sm rounded-2xl p-8"
          style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>

          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ background: "rgba(93,202,165,0.15)", border: "0.5px solid rgba(93,202,165,0.3)" }}>
              <Shield size={22} color="#5DCAA5" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: "white" }}>Se connecter</h2>
            <p className="text-xs mt-1" style={{ color: "#8BA0B8" }}>Accédez à votre espace de gestion</p>
          </div>

          {/* EMAIL */}
          <div className="relative mb-3">
            <Mail size={15} color="#8BA0B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: "100%", background: "rgba(255,255,255,0.06)",
                border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 10,
                padding: "11px 14px 11px 38px", color: "white", fontSize: 14, outline: "none",
              }}
            />
          </div>

          {/* PASSWORD */}
          <div className="relative mb-5">
            <Lock size={15} color="#8BA0B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%", background: "rgba(255,255,255,0.06)",
                border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 10,
                padding: "11px 38px 11px 38px", color: "white", fontSize: 14, outline: "none",
              }}
            />
            <button onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
              {showPassword ? <EyeOff size={15} color="#8BA0B8" /> : <Eye size={15} color="#8BA0B8" />}
            </button>
          </div>

          {/* BUTTON */}
          <button onClick={handleLogin} disabled={loading}
            style={{
              width: "100%", background: "#3B6D11", color: "white", border: "none",
              borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              transition: "background 0.2s",
            }}>
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span style={{ color: "#8BA0B8", fontSize: 11 }}>ou</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* INFO */}
          <div className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
            <Lock size={14} color="#8BA0B8" style={{ marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: "#8BA0B8", lineHeight: 1.6 }}>
              La création de compte est réservée à l'administrateur. Veuillez contacter l'administrateur pour obtenir un accès.
            </p>
          </div>
        </div>
      </div>

      {/* DEVELOPER SECTION */}
      <div className="px-4 py-12 flex justify-center" style={{ background: "#0d1d35" }}>
        <div className="w-full max-w-2xl rounded-2xl p-6 flex flex-col md:flex-row gap-6"
          style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>

          {/* AVATAR */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: "rgba(93,202,165,0.15)", border: "2px solid rgba(93,202,165,0.3)", color: "#5DCAA5" }}>
              DJ
            </div>
          </div>

          {/* INFO */}
          <div className="flex-1">
            <p style={{ color: "#5DCAA5", fontSize: 12, marginBottom: 4 }}>À propos du développeur</p>
            <h3 style={{ color: "white", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>David DJOBO</h3>
            <p style={{ color: "#5DCAA5", fontSize: 12, marginBottom: 10 }}>Développeur & Médecin en puissance</p>
            <p style={{ color: "#8BA0B8", fontSize: 12, lineHeight: 1.7 }}>
              Passionné par la technologie et la santé, je conçois des solutions numériques innovantes pour améliorer la gestion et l'efficacité des structures médicales au Togo.
            </p>
          </div>

          {/* CONTACTS */}
          <div className="flex flex-col gap-2">
            <p style={{ color: "#5DCAA5", fontSize: 12, marginBottom: 4 }}>Coordonnées</p>
            {[
              { icon: <Mail size={13} />, text: "djobodavid4@gmail.com" },
              { icon: <Phone size={13} />, text: "+228 91 08 46 52" },
              { icon: <MapPin size={13} />, text: "Lomé, Togo" },
              { icon: <Github size={13} />, text: "github.com/Djobodavid" },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ color: "#5DCAA5" }}>{c.icon}</span>
                <span style={{ color: "#8BA0B8", fontSize: 12 }}>{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUOTE */}
      <div className="px-4 py-10 flex justify-center" style={{ background: "#0a1628" }}>
        <div className="w-full max-w-2xl rounded-2xl p-8 flex items-center gap-6"
          style={{ background: "rgba(93,202,165,0.05)", border: "0.5px solid rgba(93,202,165,0.15)" }}>
          <span style={{ fontSize: 48, color: "#3B6D11", lineHeight: 1, flexShrink: 0 }}>"</span>
          <p style={{ color: "#B8C8D8", fontSize: 15, fontStyle: "italic", lineHeight: 1.7 }}>
            Une bonne gestion médicale aujourd'hui, c'est la performance et la santé de demain.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-6 py-6 flex flex-col md:flex-row items-center justify-between"
        style={{ background: "#071020", borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 mb-3 md:mb-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#3B6D11" }}>
            <Stethoscope size={14} color="white" />
          </div>
          <span style={{ color: "white", fontWeight: 600, fontSize: 14 }}>Derma<span style={{ color: "#5DCAA5" }}>Stock</span></span>
        </div>
        <p style={{ color: "#4A6080", fontSize: 11 }}>© 2026 DermaStock. Tous droits réservés.</p>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "#5DCAA5", fontSize: 11 }}>Développé par</p>
          <p style={{ color: "white", fontSize: 13, fontWeight: 600 }}>DavThemedCoder</p>
          <p style={{ color: "#4A6080", fontSize: 11 }}>Avec passion 💚</p>
        </div>
      </div>
    </div>
  );
}