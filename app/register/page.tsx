import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12">

        {/* Left Side */}
        <div className="hidden flex-1 lg:flex flex-col justify-center pr-16">

          <span className="mb-6 inline-flex w-fit rounded-full bg-emerald-500/20 px-4 py-2 text-sm text-emerald-400">
            Welcome to K-NETWORK
          </span>

          <h1 className="text-5xl font-bold leading-tight text-white">
            Start Your Wellness &
            <span className="block text-emerald-400">
              Income Journey
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-slate-400">
            Join thousands of members earning monthly rewards while promoting premium herbal wellness products.
          </p>

          <div className="mt-10 space-y-4">

            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Secure Registration</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Email Verification</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Instant Referral Tracking</span>
            </div>

          </div>

        </div>

        {/* Right Side */}
        <div className="flex flex-1 justify-center">
          <RegisterForm />
        </div>

      </div>
    </main>
  );
}
