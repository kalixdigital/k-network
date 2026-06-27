import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const levels = [
  {
    level: "Starter",
    requirement: "Join K-NETWORK",
    reward: "Begin building your referral network",
  },
  {
    level: "Level 1",
    requirement: "50 Points",
    reward: "10 pts Direct • 5 pts Level 2",
  },
  {
    level: "Level 2",
    requirement: "100 Points",
    reward: "3 pts Level 3 • 2 pts Level 4",
  },
  {
    level: "Level 3",
    requirement: "200 Points",
    reward: "1 pt Level 4",
  },
  {
    level: "Level 4",
    requirement: "500 Points",
    reward: "1 pt Level 5",
  },
  {
    level: "Level 5",
    requirement: "1000 Points",
    reward: "Leadership Benefits",
  },
];

export default function MembershipLevels() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">

      <div className="text-center">

        <Badge className="bg-emerald-500 text-white">
          MEMBERSHIP LEVELS
        </Badge>

        <h2 className="mt-4 text-4xl font-bold text-white">
          Grow Your Network. Unlock More Rewards.
        </h2>

        <p className="mt-4 max-w-3xl mx-auto text-slate-400">
          As you earn more points each month, you unlock higher
          membership levels and additional referral rewards.
        </p>

      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {levels.map((level) => (
          <Card
            key={level.level}
            className="border-slate-800 bg-slate-900 p-6 hover:border-emerald-500 transition-all"
          >

            <h3 className="text-2xl font-bold text-white">
              {level.level}
            </h3>

            <p className="mt-4 text-emerald-400 font-semibold">
              Unlock:
            </p>

            <p className="text-white">
              {level.requirement}
            </p>

            <hr className="my-6 border-slate-700" />

            <p className="text-slate-300">
              {level.reward}
            </p>

          </Card>
        ))}

      </div>

    </section>
  );
}
