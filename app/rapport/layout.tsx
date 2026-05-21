"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Warehouse,
  TrendingDown,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Stethoscope,
} from "lucide-react";

const sidebarLinks = [
  {
    section: "Analyse",
    items: [
      { href: "/rapport", label: "Dashboard", icon: LayoutDashboard },
      { href: "/rapport/ventes", label: "Rapport ventes", icon: FileText },
      { href: "/rapport/stock", label: "Rapport stock", icon: Warehouse },
      { href: "/rapport/pertes", label: "Rapport pertes", icon: TrendingDown },
      { href: "/rapport/consultations", label: "Rapport consultations", icon: Stethoscope },
    ],
  },
  {
    section: "Gestion",
    items: [
      { href: "/utilisateur", label: "Utilisateurs", icon: Users },
      { href: "/reglages", label: "Réglages", icon: Settings },
    ],
  },
];

export default function RapportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-base-300">
        {!collapsed && (
          <div>
            <p className="font-semibold text-sm">DermaStock</p>
            <p className="text-xs text-gray-500">Espace Admin</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-ghost btn-xs hidden md:flex"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <button
          aria-label="text"
          onClick={() => setMobileOpen(false)}
          className="btn btn-ghost btn-xs md:hidden"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1 py-4 flex-1 overflow-y-auto">
        {sidebarLinks.map((section, si) => (
          <div key={si}>
            {!collapsed && (
              <p className="text-xs text-gray-400 uppercase tracking-wider px-4 py-2">
                {section.section}
              </p>
            )}
            {section.items.map((item, i) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm transition-all ${
                    isActive
                      ? "bg-green-50 text-green-700 font-medium border-l-2 border-green-600"
                      : "text-gray-500 hover:bg-base-200"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR DESKTOP */}
      <div
        className={`border-r border-base-300 bg-base-100 hidden md:flex flex-col transition-all duration-300 ${
          collapsed ? "w-16" : "w-52"
        }`}
      >
        <SidebarContent />
      </div>

      {/* SIDEBAR MOBILE — overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* fond noir */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* sidebar */}
          <div className="absolute left-0 top-0 h-full w-64 bg-base-100 shadow-xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 bg-base-200 overflow-auto">
        {/* BOUTON HAMBURGER MOBILE */}
        <div className="md:hidden flex items-center gap-3 p-4 bg-base-100 border-b border-base-300">
          <button
          aria-label="text"
            onClick={() => setMobileOpen(true)}
            className="btn btn-ghost btn-sm"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm">DermaStock</span>
        </div>

        {children}
      </div>
    </div>
  );
}