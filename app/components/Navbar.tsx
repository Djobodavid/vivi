"use client";

import {
  History,
  Home,
  Icon,
  Layers,
  LayoutDashboard,
  ListTree,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  User,
  Wallet,
  Warehouse,
  Wifi,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaBriefcaseMedical } from "react-icons/fa";

const Navbar = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const route = useRouter();
  const { data, status } = useSession();
  type NavLink = {
    href?: string;
    label: string;
    icon: any;
    roles?: string[];
    children?: {
      href: string;
      label: string;
      roles?: string[];
      icon?: any;
    }[];
  };

  const hasAccess = (roles?: string[]) => {
    if (!roles) return true;
    if (!role) return false;
    return roles.includes(role);
  };

  const role = (data?.user as any)?.role;

  const navLinks: NavLink[] = [
    {
      href: "/",
      label: "Accueil",
      icon: Home,
      roles: ["admin", "agent", "gestionnaire"],
    },


    {
      label: "Caisse",
      roles: ["admin","agent"],
      icon: Wallet,
      children: [
        { href: "/vente", label: "Vente", icon: Layers, roles: ["admin","agent"] },
        {
          href: "/Historiques",
          label: "Historique",
          icon: History,
          roles: ["admin","agent"],
        },
      ],
    },
    {
      href: "/produit",
      label: "Produits",
      icon: Package,
      roles: ["admin", "gestionnaire"],
    },
    {
      href: "/stock",
      label: "Stock",
      icon: Warehouse,
      roles: ["admin", "gestionnaire"],
    },
    {
      href: "/rapport",
      label: "Rapports",
      icon: LayoutDashboard,
      roles: ["admin"],
    },
    { href: "/clients", label: "Clients", icon: User, roles: ["admin", "agent"] },
    {
      href: "/fournisseur",
      label: "Fournisseurs",
      icon: User,
      roles: ["admin"],
    },

    // 🔥 EXEMPLE DROPDOWN
    {
      label: "Paramètres",
      roles: ["admin"],
      icon: Settings,
      children: [
        { href: "/unite", label: "Unité", icon: Layers, roles: ["admin"] },
        {
          href: "/category",
          label: "Catégories",
          icon: ListTree,
          roles: ["admin"],
        },
        { href: "/promotion", label: "Promotion", icon: Tag, roles: ["admin"] },
        {
          href: "/utilisateur",
          label: "Utilisateurs",
          icon: User,
          roles: ["admin"],
        },
      ],
    },
    
  ];

  

  const renderLinks = (baseClass: string) => (
    <>
      {navLinks
        .filter((item) => hasAccess(item.roles))
        .map((item, index) => {
          const isActive = item.href && pathname === item.href;
          const activeClass = isActive ? "btn-primary" : "btn-ghost";

          // 🔥 DROPDOWN
          if (item.children) {
            return (
              <div key={index} className="dropdown dropdown-end">
                <label
                  tabIndex={0}
                  className={`${baseClass} btn-sm flex gap-2 items-center`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </label>

                <ul className="dropdown-content z-index: 999 menu p-2 shadow bg-base-100 rounded-box w-52">
                  {item.children.map((child, i) => (
                    <li key={i}>
                      <Link
                        href={child.href}
                        onClick={() => setMenuOpen(false)}
                      >
                        {child.icon && <child.icon className="w-4 h-4" />}
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          // 🔥 NORMAL LINK
          return (
            <Link
              href={item.href!}
              key={index}
              onClick={() => setMenuOpen(false)} // 🔥 AJOUT IMPORTANT
              className={`${baseClass} 
            ${activeClass} btn-sm gap-2 items-center`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      {status === "authenticated" && (
        <button
          className="btn btn-sm m-t-9"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            signOut({
              redirectTo: "/",
            });
          }}
        >
          Se Déconnecter
        </button>
      )}
    </>
  );

  /*   useEffect(() => {
    if (status !== "authenticated") {
      //  redirect("/")
      console.log("status session",status)
      route.push("/");
    }
  }, [status]);
 */
  return (
    <div className="border-b border-base-300 px-5 md:px-[5%] py-4 relative">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="p-2">
            <FaBriefcaseMedical className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl hidden sm:inline">DermaStock</span>
        </div>

        <button
          aria-label="text"
          className="btn w-fit sm:hidden btn-sm"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="hidden space-x-2 sm:flex items-center">
          {renderLinks("btn")}
        </div>
      </div>
      <div
        className={`absolute top-0 w-full bg-base-100 h-screen flex flex-col gap-2 p-4 transition-all duration-300 sm:hidden z-50 ${menuOpen ? "left-0" : "-left-full"} `}
      >
        <div className="flex justify-between">
          <button
            aria-label="text"
            className="btn w-fit sm:hidden btn-sm"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <span
          className="font-bold text-primary text-lg flex justify-center cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          DermaStok
        </span>
        {renderLinks("btn")}
      </div>
    </div>
  );
};

export default Navbar;
