"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function TestAdminPage() {
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role");

      console.error("Profiles:", data);
      console.error("Error:", error);
    }

    load();
  }, []);

  return <div>Check your browser console.</div>;
}