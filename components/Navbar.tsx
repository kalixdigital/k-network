"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link
          href="/"
          className="text-2xl font-bold text-emerald-400"
        >
          K-NETWORK
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/products">Products</Link>
          <Link href="/plan">Plan</Link>
          <Link href="/contact">Contact</Link>

          <Link
            href="/login"
            className="rounded-lg border border-slate-700 px-4 py-2"
          >
            Login          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
          >
            Join Now
          </Link>
        </div>
	<button
  onClick={() => setOpen(!open)}
  className="md:hidden text-white"
  aria-label="Toggle menu"
>
  {open ? <X size={28} /> : <Menu size={28} />}
</button>


      </div>

      {open && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-6 py-4 space-y-4">

          <Link href="/" className="block">Home</Link>

          <Link href="/about" className="block">About</Link>

          <Link href="/products" className="block">Products</Link>

          <Link href="/plan" className="block">Compensation Plan</Link>

          <Link href="/contact" className="block">Contact</Link>

          <Link href="/login" className="block">
            Login
          </Link>

          <Link
            href="/register"
            className="block rounded-lg bg-emerald-500 px-4 py-3 text-center font-bold text-slate-950"
          >
            Join Now
          </Link>

        </div>
      )}
    </nav>
  );
}
