"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Sparkles, LogIn, UserPlus } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-slate-700/50 bg-slate-950/95 backdrop-blur-xl shadow-lg shadow-slate-900/50"
          : "border-slate-800 bg-slate-950/90 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 transition-colors group-hover:bg-emerald-500/20">
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            K-NETWORK
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg"
            >
              {link.label}
            </Link>
          ))}

          <div className="w-px h-6 bg-slate-700 mx-2" />

          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>

          <Link
            href="/register"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
          >
            <UserPlus className="h-4 w-4" />
            Join Now
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-1 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800/50 hover:text-emerald-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/50" />
              {link.label}
            </Link>
          ))}

          <div className="my-3 h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />

          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800/50 hover:text-emerald-400"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>

          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 mt-2"
          >
            <UserPlus className="h-4 w-4" />
            Join Now
          </Link>
        </div>
      )}
    </nav>
  );
}