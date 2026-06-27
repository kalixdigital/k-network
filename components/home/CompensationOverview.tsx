import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export default function CompensationOverview() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">

      <div className="text-center">

        <Badge className="bg-emerald-500 text-white">
          COMPENSATION PLAN
        </Badge>

        <h2 className="mt-4 text-4xl font-bold text-white">
          Earn More As Your Network Grows
        </h2>

        <p className="mt-4 max-w-3xl mx-auto text-slate-400">
          Build your team, earn reward points, unlock higher membership
          levels, and qualify for monthly payouts.
        </p>

      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-4">

        <Card className="bg-slate-900 border-slate-800 p-6 text-center">
          <h3 className="text-xl font-bold text-white">Join</h3>
          <p className="mt-2 text-slate-400">
            Purchase K-Herbal Flusher and activate your account.
          </p>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 text-center">
          <h3 className="text-xl font-bold text-white">Refer</h3>
          <p className="mt-2 text-slate-400">
            Invite friends using your personal referral code.
          </p>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 text-center">
          <h3 className="text-xl font-bold text-white">Earn</h3>
          <p className="mt-2 text-slate-400">
            Receive reward points as your network expands.
          </p>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 text-center">
          <h3 className="text-xl font-bold text-white">Grow</h3>
          <p className="mt-2 text-slate-400">
            Reach new levels and qualify for monthly rewards.
          </p>
        </Card>

      </div>

      <div className="mt-12 text-center">

        <Button asChild size="lg">
          <Link href="/plan">
            View Full Compensation Plan
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>

      </div>

    </section>
  );
}
