import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    name: "Aisha M.",
    role: "Member",
    text: "K-NETWORK made it easy to discover wellness products while building an extra source of income.",
  },
  {
    name: "Samuel O.",
    role: "Level 2 Member",
    text: "The platform is easy to use and the monthly reward system keeps me motivated.",
  },
  {
    name: "Fatima A.",
    role: "Member",
    text: "I love how simple the referral process is. Everything is clear and professional.",
  },
];

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">

      <div className="text-center">

        <Badge className="bg-emerald-500 text-white">
          TESTIMONIALS
        </Badge>

        <h2 className="mt-4 text-4xl font-bold text-white">
          What Our Members Say
        </h2>

      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">

        {testimonials.map((item) => (
          <Card
            key={item.name}
            className="bg-slate-900 border-slate-800 p-6"
          >
            <p className="text-slate-300 italic">
              "{item.text}"
            </p>

            <div className="mt-6">
              <h3 className="font-bold text-white">
                {item.name}
              </h3>

              <p className="text-sm text-emerald-400">
                {item.role}
              </p>
            </div>
          </Card>
        ))}

      </div>

    </section>
  );
}
