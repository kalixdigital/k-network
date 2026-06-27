import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">

      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

          <div>

            <h2 className="text-2xl font-bold text-emerald-400">
              K-NETWORK
            </h2>

            <p className="mt-2 text-slate-400">
              Wellness Today. Wealth Tomorrow.
            </p>

          </div>

          <div className="flex gap-6 text-slate-400">

            <Link href="/">Home</Link>
            <Link href="/products">Products</Link>
            <Link href="/plan">Plan</Link>
            <Link href="/contact">Contact</Link>

          </div>

        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">

          © {new Date().getFullYear()} K-NETWORK. All rights reserved.

        </div>

      </div>

    </footer>
  );
}
