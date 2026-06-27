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

      <main className="min-h-screen bg-slate-950 text-white">
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
