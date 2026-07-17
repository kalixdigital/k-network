import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  UserPlus, 
  Share2, 
  Award, 
  TrendingUp,
  Sparkles,
  Trophy,
  Users,
  Gift,
  Crown
} from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Join",
    description: "Purchase K-Herbal Flusher and activate your account.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    stat: "Start earning",
  },
  {
    icon: Share2,
    title: "Refer",
    description: "Invite friends using your personal referral code.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    stat: "Build your team",
  },
  {
    icon: Award,
    title: "Earn",
    description: "Receive reward points as your network expands.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    stat: "Maximize rewards",
  },
  {
    icon: Crown,
    title: "Grow",
    description: "Reach new levels and qualify for monthly rewards.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    stat: "Level up",
  },
];

export default function CompensationOverview() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 lg:py-28 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative text-center">
        <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-2 text-sm font-medium">
          <Trophy className="h-3 w-3 mr-1.5" />
          Compensation Plan
        </Badge>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          Earn More As Your Network Grows
        </h2>

        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-3xl mx-auto">
          Build your team, earn reward points, unlock higher membership
          levels, and qualify for monthly payouts.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="relative mt-10 sm:mt-16 grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Connecting Line */}
        <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent hidden lg:block" />

        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <Card
              key={step.title}
              className={`group relative border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 text-center transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-${step.color.replace('text-', '')}/10 overflow-hidden`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-b ${step.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Step Number */}
              <div className="absolute top-3 right-3 text-4xl font-bold text-slate-800/20 select-none">
                {String(index + 1).padStart(2, '0')}
              </div>

              {/* Icon */}
              <div className={`relative mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl ${step.bg} border ${step.border} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                <Icon className={`h-7 w-7 sm:h-8 sm:w-8 ${step.color} transition-transform duration-300 group-hover:scale-110`} />
              </div>

              {/* Content */}
              <div className="relative mt-5">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm sm:text-base text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Stat Badge */}
              <div className="relative mt-4">
                <Badge variant="outline" className={`${step.border} ${step.color} text-xs font-medium`}>
                  {step.stat}
                </Badge>
              </div>

              {/* Decorative Elements */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-10 rounded-2xl blur-xl transition-opacity duration-500`} />
            </Card>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="relative mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 sm:p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50">
        <div className="text-center">
          <p className="text-xl sm:text-2xl font-bold text-emerald-400">2.5K+</p>
          <p className="text-xs text-slate-400">Active Members</p>
        </div>
        <div className="text-center">
          <p className="text-xl sm:text-2xl font-bold text-yellow-400">6</p>
          <p className="text-xs text-slate-400">Levels</p>
        </div>
        <div className="text-center">
          <p className="text-xl sm:text-2xl font-bold text-blue-400">10%</p>
          <p className="text-xs text-slate-400">Direct Bonus</p>
        </div>
        <div className="text-center">
          <p className="text-xl sm:text-2xl font-bold text-purple-400">5%</p>
          <p className="text-xs text-slate-400">Indirect Bonus</p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative mt-10 sm:mt-12 text-center">
        <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 group">
          <Link href="/plan">
            View Full Compensation Plan
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>

        <p className="mt-4 text-sm text-slate-400">
          <Sparkles className="h-3 w-3 inline mr-1 text-emerald-400" />
          Join thousands of members building their wealth
        </p>
      </div>
    </section>
  );
}