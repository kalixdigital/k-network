// app/login/page.tsx
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { Loader2 } from "lucide-react";

// Loading fallback that matches your UI
function LoginFormFallback() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 sm:px-6">
      <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col items-center justify-center py-8 sm:py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="mt-4 text-sm sm:text-base text-slate-400">Loading login...</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 sm:px-6">
        <LoginForm />
      </div>
    </Suspense>
  );
}