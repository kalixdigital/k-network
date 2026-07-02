"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "icon" | "text";
  onLogout?: () => void;
}

export default function LogoutButton({ 
  className = "", 
  variant = "default",
  onLogout 
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    // Optional: Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to sign out?");
    if (!confirmed) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("❌ Logout error:", error);
        alert(`Logout error: ${error.message}`);
        setLoading(false);
        return;
      }

      // Call optional callback
      if (onLogout) {
        onLogout();
      }

      // Redirect to logout page for smooth transition
      router.push("/logout");
      router.refresh();

    } catch (err) {
      console.error("💥 Unexpected error during logout:", err);
      alert("An unexpected error occurred during logout");
      setLoading(false);
    }
  };

  // Icon only variant
  if (variant === "icon") {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className={`p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors ${className}`}
        title="Sign Out"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        )}
      </button>
    );
  }

  // Text only variant
  if (variant === "text") {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className={`text-red-400 hover:text-red-300 transition-colors ${className}`}
      >
        {loading ? "Signing out..." : "Sign Out"}
      </button>
    );
  }

  // Default button variant
  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Signing out...
        </span>
      ) : (
        "Sign Out"
      )}
    </button>
  );
}