"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { useState } from "react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Vagas" },
  { href: "/interviews", label: "Entrevistas" },
];

export function Topbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const userName = user?.email?.split("@")[0] || "Usuário";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-2 md:px-8 h-16 z-50 relative">
      <div className="flex items-center gap-4">
        <span className="text-blue-700 font-extrabold text-lg md:text-xl">TalentFlow</span>
        {/* Desktop nav */}
        <nav className="hidden md:flex gap-2 md:gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-blue-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          <FiMenu className="text-2xl text-blue-700" />
        </button>
      </div>
      {/* Usuário e logout */}
      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex flex-col items-end">
          <span className="font-semibold text-gray-800 text-sm md:text-base">{userName}</span>
          <span className="text-xs text-gray-500">{user?.role}</span>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded hover:bg-red-100 text-red-700 transition"
          title="Sair"
        >
          <FiLogOut />
        </button>
      </div>
      {/* Mobile nav dropdown */}
      {menuOpen && (
        <nav className="absolute left-0 top-16 w-full bg-white border-b border-gray-200 shadow-md flex flex-col md:hidden z-50">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-3 border-b border-gray-100 font-medium ${
                pathname.startsWith(link.href)
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-blue-50"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}