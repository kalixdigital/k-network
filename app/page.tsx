import Navbar from "@/components/Navbar";

export default function Home() {
  return (
   <>
         <Navbar />
         
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">

        <h1 className="text-5xl md:text-7xl font-extrabold">
          K-NETWORK
        </h1>

        <p className="mt-6 text-xl text-slate-300">
          Wellness Today. Wealth Tomorrow.
        </p>

        <p className="mt-8 text-slate-400 max-w-2xl mx-auto">
          Join Nigeria's modern wellness and referral platform.
          Buy trusted health products, build your network,
          earn reward points, and grow together.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <button className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-xl font-semibold">
            Get Started
          </button>

          <button className="border border-slate-600 px-6 py-3 rounded-xl">
            Learn More
          </button>
        </div>

      </section>
    </main>
    </>
  );
}
