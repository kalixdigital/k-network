"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface AuthHeaderProps {
  title: string;
  description: string;
  showLogo?: boolean;
}

export default function AuthHeader({
  title,
  description,
  showLogo = true,
}: AuthHeaderProps) {
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("K-NETWORK");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompanySettings() {
      try {
        const { data, error } = await supabase
          .from("company_settings")
          .select("site_logo, site_name")
          .eq("id", 1)
          .single();

        if (error) {
          console.error("Error loading company settings:", error);
          setLoading(false);
          return;
        }

        if (data) {
          setSiteLogo(data.site_logo || null);
          if (data.site_name) setSiteName(data.site_name);
        }
      } catch (error) {
        console.error("Error loading company settings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCompanySettings();
  }, []);

  return (
    <div className="text-center space-y-6">
      {showLogo && (
        <div className="mx-auto">
          {loading ? (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500/20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            </div>
          ) : siteLogo ? (
            <div className="relative h-24 w-24 md:h-32 md:w-32 mx-auto">
              <Image
                src={siteLogo}
                alt={siteName}
                fill
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 md:h-32 md:w-32 mx-auto items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500/20">
              <span className="text-6xl md:text-7xl">🌿</span>
            </div>
          )}
        </div>
      )}

      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          {title}
        </h1>

        <p className="mt-3 text-slate-400 leading-7 max-w-sm mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
}