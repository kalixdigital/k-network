import Navbar from "@/components/Navbar";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import HowItWorks from "@/components/home/HowItWorks";
import MembershipLevels from "@/components/home/MembershipLevels";
import CompensationOverview from "@/components/home/CompensationOverview";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        {/* Background Effects - Enhanced */}
        <div className="absolute inset-0 -z-10">
          {/* Main glow */}
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          
          {/* Additional glow effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]" />
          
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/0 via-slate-950/50 to-slate-950" />
        </div>

        {/* Sections with smooth transitions */}
        <div className="relative">
          {/* Hero - CTA focused on registration */}
          <section id="hero" className="scroll-mt-16">
            <Hero />
          </section>
          
          {/* Stats - Social proof */}
          <section id="stats" className="scroll-mt-16">
            <Stats />
          </section>
          
          {/* How It Works - Registration flow */}
          <section id="how-it-works" className="scroll-mt-16">
            <HowItWorks />
          </section>
          
          {/* Membership Levels - Key motivator */}
          <section id="membership-levels" className="scroll-mt-16">
            <MembershipLevels />
          </section>
          
          {/* Compensation Overview - The "why join" section */}
          <section id="compensation-plan" className="scroll-mt-16">
            <CompensationOverview />
          </section>
          
          {/* Testimonials - Social proof */}
          <section id="testimonials" className="scroll-mt-16">
            <Testimonials />
          </section>
          
          {/* FAQ - Address objections */}
          <section id="faq" className="scroll-mt-16">
            <FAQ />
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}