// app/register/page.tsx
import { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}