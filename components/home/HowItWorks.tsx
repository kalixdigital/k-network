import { Card } from "@/components/ui/card";
import { UserPlus, Share2, Trophy, ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    icon: UserPlus,
    title: "1. Join",
    description:
      "Register, purchase K-Herbal Flusher, upload your payment proof, and wait for admin approval.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    step: "01",
  },
  {
    icon: Share2,
    title: "2. Refer",
    description:
      "Share your unique referral code with friends and grow your K-NETWORK team.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    step: "02",
  },
  {
    icon: Trophy,
    title: "3. Earn",
    description:
      "Receive reward points, unlock new levels, and qualify for monthly payouts.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    step: "03",
  },
];

export default function HowItWorks() {
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
          <Sparkles className="h-3 w-3 mr-1.5" />
          Getting Started
        </Badge>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          Three Simple Steps
          <br />
          <span className="text-emerald-400">to Success</span>
        </h2>

        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          Joining K-NETWORK is simple. Start your wellness journey,
          build your referral network, and earn rewards as you grow.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="relative mt-12 sm:mt-16 grid gap-6 sm:gap-8 md:grid-cols-3">
        {/* Connecting Line (Desktop) */}
        <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-500/40 to-emerald-500/20 hidden md:block -translate-y-1/2" />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;

          return (
            <Card
              key={step.title}
              className={`group relative border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-${step.color.replace('text-', '')}/10 overflow-hidden`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${step.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Step Number Background */}
              <div className="absolute -top-4 -right-4 text-7xl font-bold text-slate-800/10 select-none">
                {step.step}
              </div>

              {/* Icon Container */}
              <div className={`relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl ${step.bg} border ${step.border} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                <Icon className={`h-7 w-7 sm:h-8 sm:w-8 ${step.color} transition-transform duration-300 group-hover:scale-110`} />
              </div>

              {/* Content */}
              <div className="relative mt-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Step Indicator */}
              <div className="relative mt-6 flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full ${step.bg} ${step.color} text-xs font-bold`}>
                  {index + 1}
                </div>
                <span className="text-xs text-slate-500">Step {index + 1} of 3</span>
                {!isLast && (
                  <ArrowRight className="ml-auto h-4 w-4 text-slate-600 hidden sm:block" />
                )}
              </div>

              {/* Decorative Elements */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-10 rounded-2xl blur-xl transition-opacity duration-500`} />
            </Card>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="relative mt-12 sm:mt-16 text-center">
        <p className="text-sm text-slate-400">
          Ready to start your journey?
        </p>
        <a
          href="/register"
          className="inline-flex items-center gap-2 mt-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors group"
        >
          Join K-NETWORK today
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}