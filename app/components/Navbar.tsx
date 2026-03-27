"use client";

import { Home, Icon, Layers, LayoutDashboard, ListTree, Menu, Package, Settings, ShoppingCart, Tag, User, Warehouse, Wifi, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { FaBriefcaseMedical } from "react-icons/fa";

const Navbar = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  type NavLink = {
  href?: string;
  label: string;
  icon: any;
  children?: {
    href: string;
    label: string;
    icon?: any;
  }[];
};

const navLinks: NavLink[] = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/vente", label: "Ventes", icon: ShoppingCart },
  { href: "/produit", label: "Produits", icon: Package },
  { href: "/stock", label: "Stock", icon: Warehouse },
  { href: "/rapport", label: "Rapports", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: User },
  { href: "/fournisseur", label: "Fournisseurs", icon: User },

  // 🔥 EXEMPLE DROPDOWN
  {
    label: "Paramètres",
    icon: Settings,
    children: [
      {href: "/unite", label: "Unité", icon: Layers },
      { href: "/category", label: "Catégories", icon: ListTree },
      { href: "/promotion", label: "Promotion", icon: Tag },
      { href: "/utilisateur", label: "Utilisateurs", icon: User },
      
    ],
  },


];

  

  const renderLinks = (baseClass: string) => (
  <>
    {navLinks.map((item, index) => {
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
                  <Link href={child.href}>
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
          className={`${baseClass} ${activeClass} btn-sm gap-2 items-center`}
        >
          <item.icon className="w-4 h-4" />
          {item.label}
        </Link>
      );
    })}
  </>
  );
  return (
    <div className="border-b border-base-300 px-5 md:px-[5%] py-4 relative">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="p-2">
            <FaBriefcaseMedical className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl hidden sm:inline">DermaStok</span>
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
        <span className="font-bold text-primary text-lg flex justify-center cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>DermaStok</span>
        {renderLinks("btn")}
      </div>
    </div>
  );
};

export default Navbar;
