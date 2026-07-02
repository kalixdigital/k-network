"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LogoutPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Logging out...");

  useEffect(() => {
    async function handleLogout() {
      try {
        setStatus("Signing out...");
        
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error("❌ Logout error:", error);
          setStatus(`Error: ${error.message}`);
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
          return;
        }

        setStatus("✅ Signed out successfully!");
        
        // Clear any local storage or session storage if needed
        localStorage.removeItem('supabase.auth.token');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/login");
          router.refresh();
        }, 1500);

      } catch (err) {
        console.error("💥 Unexpected error during logout:", err);
        setStatus("An error occurred during logout");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    }

    handleLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-lg max-w-md w-full text-center">
        <div className="mb-6">
          {status.includes("Error") ? (
            <div className="text-6xl mb-4">❌</div>
          ) : status.includes("successful") ? (
            <div className="text-6xl mb-4">✅</div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          {status.includes("Error") ? "Logout Failed" : "Logging Out"}
        </h1>
        
        <p className="text-slate-400">
          {status}
        </p>
        
        {status.includes("Error") && (
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}