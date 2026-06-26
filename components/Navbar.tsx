import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link href="/" className="text-2xl font-extrabold text-emerald-400">
          K-NETWORK
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/products">Products</Link>
          <Link href="/plan">Plan</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <div className="hidden gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-lg border border-slate-700 px-4 py-2 hover:border-emerald-400"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Join Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
