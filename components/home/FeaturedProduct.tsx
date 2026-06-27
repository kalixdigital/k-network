import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FeaturedProduct() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">

      <div className="text-center">
        <Badge className="bg-emerald-500 text-white">
          BEST SELLER
        </Badge>

        <h2 className="mt-4 text-4xl font-bold text-white">
          K-Herbal Flusher
        </h2>

        <p className="mt-4 max-w-2xl mx-auto text-slate-400">
          A premium herbal wellness supplement developed to support a
          healthier lifestyle while giving members the opportunity to
          build a rewarding referral network.
        </p>
      </div>

      <Card className="mt-16 grid gap-10 items-center border-slate-800 bg-slate-900 p-8 lg:grid-cols-2">

        <div className="flex justify-center">
          <Image
            src="/products/k-herbal-flusher.png"
            alt="K-Herbal Flusher"
            width={420}
            height={420}
            className="rounded-xl"
          />
        </div>

        <div>

          <p className="text-emerald-400 font-semibold">
            Natural Herbal Supplement
          </p>

          <h3 className="mt-3 text-4xl font-bold text-white">
            ₦3,000
          </h3>

          <ul className="mt-8 space-y-4 text-slate-300">
            <li>✔ Premium herbal ingredients</li>
            <li>✔ Easy to use</li>
            <li>✔ Earn reward points when you join</li>
            <li>✔ Access to the K-NETWORK community</li>
          </ul>

          <div className="mt-10 flex flex-wrap gap-4">

            <Button asChild size="lg">
              <Link href="/register">
                Join Now
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/products">
                Learn More
              </Link>
            </Button>

          </div>

        </div>

      </Card>

    </section>
  );
}
