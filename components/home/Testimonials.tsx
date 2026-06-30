import SectionHeader from "@/components/ui/section-header";
import TestimonialCard from "@/components/ui/testimonial-card";
import { testimonials } from "@/lib/testimonials";

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeader
        badge="TESTIMONIALS"
        title="What Our Members Say"
        description="Hear from members who have improved their wellness while growing with the K-NETWORK community."
      />

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {testimonials.map((item) => (
          <TestimonialCard
            key={item.name}
            name={item.name}
            role={item.role}
            message={item.message}
          />
        ))}
      </div>
    </section>
  );
}
