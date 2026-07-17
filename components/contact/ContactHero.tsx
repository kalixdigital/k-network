// components/contact/ContactHero.tsx
import { Badge } from "@/components/ui/badge";
import { Sparkles, Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 sm:pt-28 lg:pt-36 pb-12">
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
        <Badge className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-2 text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Get in Touch
        </Badge>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          Contact <span className="text-emerald-400">K-NETWORK</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300 md:text-xl">
          Have questions about joining, referrals, or rewards? We're here to help you every step of the way.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-emerald-400" />
            support@k-network.com
          </span>
          <span className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-emerald-400" />
            +234 813 942 9770
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-400" />
            Mon-Fri, 9AM - 6PM
          </span>
        </div>
      </div>
    </section>
  );
}