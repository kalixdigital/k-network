// components/about/AboutMission.tsx
import { Card } from "@/components/ui/card";
import { Target, Heart, Users, Award } from "lucide-react";

export default function AboutMission() {
  const items = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To empower individuals to achieve wellness and financial freedom through a community-driven referral platform.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      icon: Heart,
      title: "Our Vision",
      description:
        "To become Nigeria's most trusted network marketing platform, creating wealth for thousands of families.",
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
    },
    {
      icon: Users,
      title: "Our Community",
      description:
        "A growing community of wellness enthusiasts and entrepreneurs building their networks and earning rewards.",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      icon: Award,
      title: "Our Promise",
      description:
        "To provide quality wellness products, transparent rewards, and a supportive community that helps you grow.",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
  ];

  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 lg:py-28">
      <div className="relative">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Why <span className="text-emerald-400">K-NETWORK</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto">
            We're building a platform that combines wellness, community, and financial opportunity.
          </p>
        </div>

        <div className="mt-12 sm:mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className={`group relative border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 text-center transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-${item.color.replace('text-', '')}/10 overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${item.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className={`relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} border ${item.border} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                  <Icon className={`h-7 w-7 ${item.color}`} />
                </div>

                <h3 className="relative mt-5 text-xl font-bold text-white">
                  {item.title}
                </h3>

                <p className="relative mt-3 text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>

                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}