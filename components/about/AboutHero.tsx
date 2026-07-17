// components/about/AboutHero.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Users, TrendingUp, Gift } from "lucide-react";

export default function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 sm:pt-28 lg:pt-36">
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20 lg:pb-28 text-center">
        <Badge className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-2 text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          About K-NETWORK
        </Badge>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Empowering Wellness
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            & Wealth Creation
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300 md:text-xl">
          K-NETWORK is Nigeria's modern wellness and referral platform,
          combining trusted health products with a powerful network marketing
          system that rewards you for building your community.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            2,500+ Members
          </span>
          <span className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-emerald-400" />
            100K+ Points Earned
          </span>
          <span className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Monthly Payouts
          </span>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 group">
            <Link href="/register">
              Join Our Community
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}