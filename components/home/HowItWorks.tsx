import { Card } from "@/components/ui/card";
import { UserPlus, Share2, Trophy } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "1. Join",
    description:
      "Register, purchase K-Herbal Flusher, upload your payment proof, and wait for admin approval.",
  },
  {
    icon: Share2,
    title: "2. Refer",
    description:
      "Share your unique referral code with friends and grow your K-NETWORK team.",
  },
  {
    icon: Trophy,
    title: "3. Earn",
    description:
      "Receive reward points, unlock new levels, and qualify for monthly payouts.",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">

      <div className="text-center">

        <p className="text-emerald-400 font-semibold uppercase tracking-widest">
          HOW IT WORKS
        </p>

        <h2 className="mt-4 text-4xl font-bold text-white">
          Three Simple Steps
        </h2>

        <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
          Joining K-NETWORK is simple. Start your wellness journey,
          build your referral network, and earn rewards as you grow.
        </p>

      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">

        {steps.map((step) => (
          <Card
            key={step.title}
            className="border-slate-800 bg-slate-900 p-8 hover:border-emerald-500 transition-all duration-300"
          >
            <step.icon className="h-12 w-12 text-emerald-400" />

            <h3 className="mt-6 text-2xl font-bold text-white">
              {step.title}
            </h3>

            <p className="mt-4 text-slate-400 leading-7">
              {step.description}
            </p>
          </Card>
        ))}

      </div>

    </section>
  );
}
