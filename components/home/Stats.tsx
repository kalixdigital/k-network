import { Card } from "@/components/ui/card";
import { Users, Gift, Leaf, Trophy } from "lucide-react";

export default function Stats() {
  const stats = [
    {
      title: "Members",
      value: "1,000+",
      icon: Users,
    },
    {
      title: "Natural Product",
      value: "100%",
      icon: Leaf,
    },
    {
      title: "Reward Points",
      value: "50K+",
      icon: Gift,
    },
    {
      title: "Growing Network",
      value: "36 States",
      icon: Trophy,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="border-slate-800 bg-slate-900 p-6 text-center"
          >
            <stat.icon className="mx-auto h-10 w-10 text-emerald-400" />
            <h3 className="mt-4 text-3xl font-bold text-white">
              {stat.value}
            </h3>
            <p className="mt-2 text-slate-400">
              {stat.title}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
