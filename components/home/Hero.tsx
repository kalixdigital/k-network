import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">

      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">

        <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* Left Side */}

          <div>

            <Badge className="mb-6 bg-emerald-500 text-white">
              🌿 Digital Wellness Platform
            </Badge>

            <h1 className="text-5xl font-extrabold leading-tight text-white md:text-7xl">
              Wellness Today.
              <br />
              <span className="text-emerald-400">
                Wealth Tomorrow.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg text-slate-300">
              Buy trusted wellness products, build your referral
              network, earn reward points and receive monthly payouts
              through K-NETWORK.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <Button size="lg" asChild>
                <Link href="/register">
                  Join Now
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
              >
                <Link href="/products">
                  View Products
                </Link>
              </Button>

            </div>

          </div>

          {/* Right Side */}

          <Card className="border-slate-800 bg-slate-900 p-8">

            <div className="space-y-6">

              <div>

                <h2 className="text-2xl font-bold text-white">
                  K-Herbal Flusher
                </h2>

                <p className="mt-2 text-slate-400">
                  Premium wellness supplement designed to support
                  healthy living.
                </p>

              </div>

              <div className="rounded-xl bg-emerald-500/10 p-6">

                <p className="text-sm text-slate-400">
                  Starting Price
                </p>

                <p className="mt-2 text-4xl font-bold text-emerald-400">
                  ₦3,000
                </p>

              </div>

              <Button className="w-full" asChild>
                <Link href="/register">
                  Become a Member
                </Link>
              </Button>

            </div>

          </Card>

        </div>

      </div>

    </section>
  );
}
