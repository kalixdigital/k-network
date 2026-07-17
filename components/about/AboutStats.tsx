// components/about/AboutStats.tsx
import { Card } from "@/components/ui/card";
import { Users, Gift, TrendingUp, Award, Star, Sparkles } from "lucide-react";

const stats = [
  {
    value: "2,500+",
    label: "Active Members",
    icon: Users,
    color: "text-emerald-400",
  },
  {
    value: "100K+",
    label: "Points Earned",
    icon: Gift,
    color: "text-yellow-400",
  },
  {
    value: "₦50M+",
    label: "Total Earnings",
    icon: TrendingUp,
    color: "text-blue-400",
  },
  {
    value: "6",
    label: "Membership Levels",
    icon: Award,
    color: "text-purple-400",
  },
  {
    value: "36",
    label: "States Across Nigeria",
    icon: Star,
    color: "text-orange-400",
  },
  {
    value: "100%",
    label: "Natural Products",
    icon: Sparkles,
    color: "text-pink-400",
  },
];

export default function AboutStats() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 lg:py-28 border-t border-slate-800">
      <div className="relative">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Our Impact in Numbers
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto">
            The K-NETWORK community is growing and making a real difference.
          </p>
        </div>

        <div className="mt-12 sm:mt-16 grid gap-6 grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="border-slate-800 bg-slate-900/50 p-6 text-center transition-all duration-300 hover:border-emerald-500/20 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <Icon className={`mx-auto h-8 w-8 ${stat.color}`} />
                <p className={`mt-4 text-3xl sm:text-4xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {stat.label}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}