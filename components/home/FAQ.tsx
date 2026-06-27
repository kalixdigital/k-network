import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    q: "How do I join K-NETWORK?",
    a: "Register an account, purchase the product, upload your payment proof and wait for admin approval.",
  },
  {
    q: "When are monthly rewards paid?",
    a: "Points are calculated on the 23rd of each month and eligible rewards are processed on the 25th.",
  },
  {
    q: "Can I invite anyone?",
    a: "Yes. Every approved member receives a unique referral code to invite others.",
  },
];

export default function FAQ() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24">

      <div className="text-center">

        <Badge className="bg-emerald-500 text-white">
          FAQ
        </Badge>

        <h2 className="mt-4 text-4xl font-bold text-white">
          Frequently Asked Questions
        </h2>

      </div>

      <div className="mt-12 space-y-6">

        {faqs.map((faq) => (
          <div
            key={faq.q}
            className="rounded-xl border border-slate-800 bg-slate-900 p-6"
          >
            <h3 className="font-bold text-white">
              {faq.q}
            </h3>

            <p className="mt-3 text-slate-400">
              {faq.a}
            </p>
          </div>
        ))}

      </div>

    </section>
  );
}
