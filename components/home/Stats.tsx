import { Card } from "@/components/ui/card";
import { Users, Gift, Leaf, Trophy, TrendingUp, Award, Star, Sparkles } from "lucide-react";

export default function Stats() {
  const stats = [
    {
      title: "Active Members",
      value: "2,500+",
      icon: Users,
      description: "Growing community",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Natural Products",
      value: "100%",
      icon: Leaf,
      description: "Pure & natural",
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      title: "Reward Points",
      value: "100K+",
      icon: Gift,
      description: "Earned by members",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      title: "Network Reach",
      value: "36 States",
      icon: Trophy,
      description: "Across Nigeria",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Section Header */}
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Our Impact in Numbers
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Join thousands of members building their wellness and wealth with K-NETWORK
        </p>
      </div>

      <div className="relative grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="group relative border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 text-center transition-all duration-300 hover:scale-105 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/10 overflow-hidden"
            >
              {/* Background Gradient on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />

              {/* Icon */}
              <div className={`relative mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl ${stat.bg} transition-colors duration-300 group-hover:bg-emerald-500/20`}>
                <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${stat.color} transition-transform duration-300 group-hover:scale-110`} />
              </div>

              {/* Value */}
              <h3 className={`relative mt-4 text-2xl sm:text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </h3>

              {/* Title */}
              <p className="relative mt-2 font-medium text-white text-sm sm:text-base">
                {stat.title}
              </p>

              {/* Description */}
              <p className="relative mt-1 text-xs text-slate-400">
                {stat.description}
              </p>

              {/* Animated Line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />

              {/* Animated Border */}
              <div className="absolute inset-0 rounded-xl border border-emerald-500/0 group-hover:border-emerald-500/20 transition-colors duration-300" />
            </Card>
          );
        })}
      </div>

      {/* Bottom Decorative Text */}
      <div className="mt-10 sm:mt-12 text-center">
        <p className="text-sm text-slate-500">
          Join <span className="text-emerald-400 font-medium">2,500+</span> members building their wellness and wealth
        </p>
        <div className="flex justify-center gap-2 mt-2">
          <Sparkles className="h-3 w-3 text-emerald-400" />
          <span className="text-xs text-slate-500">Growing every day</span>
          <Sparkles className="h-3 w-3 text-emerald-400" />
        </div>
      </div>
    </section>
  );
}