import Navbar from "@/components/Navbar";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedProduct from "@/components/home/FeaturedProduct";
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
      <div className="absolute inset-0 -z-10">

  <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

  <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

</div>
        <Hero />
	<Stats />
	<HowItWorks />
	<FeaturedProduct />
	<MembershipLevels />
	<CompensationOverview />
	<Testimonials />
	<FAQ />
      </main>

      <Footer />
    </>
  );
}
