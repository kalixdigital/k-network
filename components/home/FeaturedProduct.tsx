import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Shield, 
  Leaf, 
  Users, 
  Gift, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  TrendingUp
} from "lucide-react";

export default function FeaturedProduct() {
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
          <Sparkles className="h-3 w-3 mr-1.5" />
          Best Seller
        </Badge>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          K-Herbal Flusher
        </h2>

        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          A premium herbal wellness supplement developed to support a
          healthier lifestyle while giving members the opportunity to
          build a rewarding referral network.
        </p>
      </div>

      {/* Product Card */}
      <Card className="relative mt-12 sm:mt-16 border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent" />

        <div className="relative grid gap-8 sm:gap-10 items-center p-6 sm:p-8 lg:grid-cols-2">
          {/* Product Image */}
          <div className="relative flex justify-center order-2 lg:order-1">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-10 bg-emerald-500/10 blur-3xl rounded-full" />
              
              {/* Image Container */}
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 to-transparent p-4">
                <Image
                  src="/products/k-herbal-flusher.png"
                  alt="K-Herbal Flusher"
                  width={400}
                  height={400}
                  className="rounded-xl relative z-10 transition-transform duration-500 hover:scale-105"
                />
                
                {/* Badge Overlay */}
                <div className="absolute top-4 left-4 z-20">
                  <Badge className="bg-emerald-500 text-white border-none px-3 py-1.5 text-xs font-semibold shadow-lg shadow-emerald-500/20">
                    🌿 Premium
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 z-20">
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-3 py-1.5 text-xs font-semibold">
                    ⭐ 4.8 ★
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Category */}
            <p className="text-sm font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Natural Herbal Supplement
            </p>

            {/* Price */}
            <div className="flex items-end gap-3">
              <h3 className="text-4xl sm:text-5xl font-bold text-white">
                ₦3,000
              </h3>
              <span className="text-sm text-slate-400 line-through mb-1">
                ₦4,500
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                Save 33%
              </Badge>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-300">What you get:</p>
              <ul className="space-y-2.5">
                {[
                  "Premium herbal ingredients for optimal wellness",
                  "Easy to use daily supplement",
                  "Earn reward points when you join",
                  "Access to the K-NETWORK community",
                  "Monthly referral bonuses",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-400">50</p>
                <p className="text-[10px] text-slate-400">Points</p>
              </div>
              <div className="text-center border-x border-slate-700/50">
                <p className="text-lg font-bold text-yellow-400">10%</p>
                <p className="text-[10px] text-slate-400">Referral</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-400">5%</p>
                <p className="text-[10px] text-slate-400">Indirect</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 group">
                <Link href="/register">
                  Join Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-slate-700 text-white hover:bg-slate-800 hover:border-slate-600"
              >
                <Link href="/products">
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                Secure Checkout
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-emerald-400" />
                2,500+ Members
              </span>
              <span className="flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 text-emerald-400" />
                Reward Points
              </span>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}