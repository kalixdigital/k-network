// components/home/MembershipLevels.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, Star, ArrowRight, Sparkles, Award, TrendingUp, Zap, Trophy,
  Users, Gift, Coins, Rocket
} from "lucide-react";

const levels = [
  {
    level: "Starter",
    requirement: "Join K-NETWORK",
    reward: "Begin building your referral network",
    icon: Sparkles,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    badge: "Join Now",
    points: "0 pts",
  },
  {
    level: "Level 1",
    requirement: "50 Points",
    reward: "10 pts Direct • 5 pts Indirect",
    icon: Star,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    badge: "Beginner",
    points: "50 pts",
  },
  {
    level: "Level 2",
    requirement: "100 Points",
    reward: "15 pts Direct • 8 pts Indirect",
    icon: Award,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    badge: "Bronze",
    points: "100 pts",
  },
  {
    level: "Level 3",
    requirement: "200 Points",
    reward: "20 pts Direct • 10 pts Indirect",
    icon: TrendingUp,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    badge: "Silver",
    points: "200 pts",
  },
  {
    level: "Level 4",
    requirement: "500 Points",
    reward: "25 pts Direct • 15 pts Indirect",
    icon: Crown,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    badge: "Gold",
    points: "500 pts",
  },
  {
    level: "Level 5",
    requirement: "1000 Points",
    reward: "30 pts Direct • 20 pts Indirect",
    icon: Trophy,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    badge: "Platinum",
    points: "1000+ pts",
  },
];

export default function MembershipLevels() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 lg:py-28">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative text-center">
        <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-2 text-sm font-medium">
          <Rocket className="h-3 w-3 mr-1.5" />
          Grow Your Way to the Top
        </Badge>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          Membership Levels
        </h2>

        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto">
          The more points you earn, the higher you climb. Each level unlocks bigger rewards.
        </p>
      </div>

      {/* Levels Grid */}
      <div className="relative mt-12 sm:mt-16 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((level, index) => {
          const Icon = level.icon;
          const isHighlighted = level.level === "Level 5" || level.level === "Starter";

          return (
            <Card
              key={level.level}
              className={`group relative border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-${level.color.replace('text-', '')}/10 overflow-hidden ${
                isHighlighted ? "border-emerald-500/20" : ""
              }`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${level.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Featured Badge */}
              {isHighlighted && (
                <Badge className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                  {level.level === "Level 5" ? "🏆 Top Tier" : "🌟 Start Here"}
                </Badge>
              )}

              {/* Points Display */}
              <div className="absolute top-4 left-4 text-xs text-slate-500">
                {level.points}
              </div>

              {/* Icon */}
              <div className={`relative mt-2 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl ${level.bg} border ${level.border} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${level.color}`} />
              </div>

              {/* Content */}
              <div className="relative mt-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {level.level}
                  </h3>
                  <Badge variant="outline" className={`${level.border} ${level.color} text-xs`}>
                    {level.badge}
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Requirement
                    </p>
                    <p className="text-sm sm:text-base text-white font-medium mt-1">
                      {level.requirement}
                    </p>
                  </div>

                  <div className="h-px bg-slate-800" />

                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      Rewards
                    </p>
                    <p className="text-sm sm:text-base text-slate-300 mt-1">
                      {level.reward}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step Indicator */}
              <div className="relative mt-6 flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full ${level.bg} ${level.color} text-xs font-bold`}>
                  {index + 1}
                </div>
                <span className="text-xs text-slate-500">Level {index + 1} of 6</span>
                {index < levels.length - 1 && (
                  <ArrowRight className="ml-auto h-3 w-3 text-slate-600" />
                )}
              </div>

              {/* Decorative Elements */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${level.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${level.color} opacity-0 group-hover:opacity-10 rounded-2xl blur-xl transition-opacity duration-500`} />
            </Card>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="relative mt-12 sm:mt-16 text-center">
        <p className="text-sm text-slate-400">
          Start earning points and unlock higher levels today
        </p>
        <a
          href="/register"
          className="inline-flex items-center gap-2 mt-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors group"
        >
          Join K-NETWORK now
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}