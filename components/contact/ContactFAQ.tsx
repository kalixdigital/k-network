// components/contact/ContactFAQ.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "How do I join K-NETWORK?",
    a: "Simply click the 'Join Now' button on our homepage, register with your details, and follow the onboarding steps. It's that easy!",
  },
  {
    q: "How long does it take to get a response?",
    a: "We aim to respond to all inquiries within 24 hours during business days.",
  },
  {
    q: "How do I earn points?",
    a: "You earn points through direct referrals, indirect referrals, and product purchases. The more you grow your network, the more points you earn.",
  },
  {
    q: "When are monthly rewards paid?",
    a: "Points are calculated on the 23rd of each month and rewards are processed on the 25th.",
  },
];

export default function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Quick answers to common questions
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <Card
              key={index}
              className={`border-slate-800 bg-slate-900/50 p-4 transition-all duration-300 cursor-pointer hover:border-emerald-500/20 ${
                isOpen ? "border-emerald-500/30 bg-emerald-500/5" : ""
              }`}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <HelpCircle className={`h-5 w-5 mt-0.5 ${isOpen ? "text-emerald-400" : "text-slate-400"}`} />
                  <h3 className={`font-semibold ${isOpen ? "text-emerald-400" : "text-white"}`}>
                    {faq.q}
                  </h3>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-emerald-400 flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0 ml-4" />
                )}
              </div>
              {isOpen && (
                <p className="mt-3 text-sm text-slate-400 leading-relaxed pl-8">
                  {faq.a}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}