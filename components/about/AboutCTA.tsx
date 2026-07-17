// components/about/AboutCTA.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function AboutCTA() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 lg:py-28 border-t border-slate-800">
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-950 border border-emerald-500/20 p-8 sm:p-12 text-center">
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl" />
        </div>

        <div className="relative">
          <Sparkles className="mx-auto h-12 w-12 text-emerald-400" />
          <h2 className="mt-6 text-3xl sm:text-4xl font-bold text-white">
            Ready to Start Your Journey?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Join thousands of members building their wellness and wealth with K-NETWORK.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 group">
              <Link href="/register">
                Join Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-slate-700 text-white hover:bg-slate-800 hover:border-slate-600"
            >
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}