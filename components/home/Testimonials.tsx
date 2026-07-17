"use client";

import SectionHeader from "@/components/ui/section-header";
import TestimonialCard from "@/components/ui/testimonial-card";
import { testimonials } from "@/lib/testimonials";
import { Quote, Star, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonialsPerPage = 3;

  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);
  const startIndex = currentIndex * testimonialsPerPage;
  const endIndex = startIndex + testimonialsPerPage;
  const currentTestimonials = testimonials.slice(startIndex, endIndex);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 lg:py-28 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Floating Quote Icon */}
      <div className="absolute top-10 right-10 hidden lg:block">
        <Quote className="h-20 w-20 text-emerald-500/10 rotate-12" />
      </div>

      {/* Header */}
      <div className="relative">
        <SectionHeader
          badge="TESTIMONIALS"
          title="What Our Members Say"
          description="Hear from members who have improved their wellness while growing with the K-NETWORK community."
        />
      </div>

      {/* Testimonials Grid */}
      <div className="relative mt-12 sm:mt-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-500">
          {currentTestimonials.map((item, index) => (
            <div
              key={item.name}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <TestimonialCard
                name={item.name}
                role={item.role}
                message={item.message}
              />
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8 sm:mt-10">
            <button
              onClick={prevSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white hover:border-slate-600"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-8 bg-emerald-400"
                      : "bg-slate-700 hover:bg-slate-500"
                  }`}
                  aria-label={`Go to testimonial page ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white hover:border-slate-600"
              aria-label="Next testimonials"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Stats */}
      <div className="relative mt-10 sm:mt-12 flex flex-wrap justify-center gap-6 sm:gap-10 text-center">
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-white">50+</p>
          <p className="text-xs sm:text-sm text-slate-400">Happy Members</p>
        </div>
        <div className="hidden sm:block w-px bg-slate-700" />
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400">4.8★</p>
          <p className="text-xs sm:text-sm text-slate-400">Average Rating</p>
        </div>
        <div className="hidden sm:block w-px bg-slate-700" />
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-400">100+</p>
          <p className="text-xs sm:text-sm text-slate-400">Success Stories</p>
        </div>
        <div className="hidden sm:block w-px bg-slate-700" />
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-purple-400">98%</p>
          <p className="text-xs sm:text-sm text-slate-400">Satisfaction Rate</p>
        </div>
      </div>
    </section>
  );
}