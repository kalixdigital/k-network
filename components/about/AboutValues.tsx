// components/about/AboutValues.tsx
import { Card } from "@/components/ui/card";
import { Shield, Sparkles, Users, TrendingUp, Heart, Star } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Trust & Integrity",
    description: "We believe in transparency, honesty, and building trust with our community.",
    color: "text-emerald-400",
  },
  {
    icon: Sparkles,
    title: "Excellence",
    description: "We strive for excellence in everything we do, from products to community support.",
    color: "text-yellow-400",
  },
  {
    icon: Users,
    title: "Community First",
    description: "Our members are at the heart of everything we build and every decision we make.",
    color: "text-blue-400",
  },
  {
    icon: TrendingUp,
    title: "Growth Mindset",
    description: "We believe in continuous growth, learning, and helping our members succeed.",
    color: "text-purple-400",
  },
  {
    icon: Heart,
    title: "Wellness Focus",
    description: "Promoting health and wellness is at the core of our mission and products.",
    color: "text-pink-400",
  },
  {
    icon: Star,
    title: "Innovation",
    description: "We're constantly evolving to provide the best platform and opportunities.",
    color: "text-orange-400",
  },
];

export default function AboutValues() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 lg:py-28 border-t border-slate-800">
      <div className="relative">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Our Values
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto">
            The principles that guide everything we do at K-NETWORK.
          </p>
        </div>

        <div className="mt-12 sm:mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <Card
                key={value.title}
                className="group relative border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 rounded-lg ${value.color} bg-emerald-500/10 p-2.5`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${value.color}`}>
                      {value.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}