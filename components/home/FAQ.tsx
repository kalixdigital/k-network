"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, HelpCircle, Sparkles } from "lucide-react";

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
  {
    q: "What are the membership levels?",
    a: "There are 6 membership levels: Starter, Bronze, Silver, Gold, Platinum, and Diamond. Each level unlocks higher referral bonuses and rewards.",
  },
  {
    q: "How do I earn points?",
    a: "You earn points through product purchases, direct referrals, and indirect referrals. Points are tracked monthly and determine your membership level.",
  },
  {
    q: "What is the referral bonus structure?",
    a: "You earn direct referral bonuses (10% of product points) and indirect referral bonuses (5% of product points) from your network.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20 lg:py-28 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative text-center">
        <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-2 text-sm font-medium">
          <HelpCircle className="h-3 w-3 mr-1.5" />
          FAQ
        </Badge>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          Frequently Asked Questions
        </h2>

        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Find answers to the most common questions about K-NETWORK
        </p>
      </div>

      {/* FAQ List */}
      <div className="relative mt-10 sm:mt-12 space-y-3 sm:space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? "border-emerald-500/30 bg-emerald-500/5 shadow-lg shadow-emerald-500/5"
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
              }`}
            >
              {/* Question */}
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between gap-4 p-4 sm:p-6 text-left transition-colors hover:bg-slate-800/30 group"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <h3 className={`text-sm sm:text-base font-semibold transition-colors ${
                    isOpen ? "text-emerald-400" : "text-white"
                  }`}>
                    {faq.q}
                  </h3>
                </div>
                <div className="flex-shrink-0 ml-4">
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                  )}
                </div>
              </button>

              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1">
                  <div className="h-px w-full bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent mb-4" />
                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed pl-9 sm:pl-10">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="relative mt-10 sm:mt-12 text-center">
        <p className="text-sm text-slate-400">
          Still have questions?
        </p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 mt-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors group"
        >
          Contact Support
          <Sparkles className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
        </a>
      </div>
    </section>
  );
}