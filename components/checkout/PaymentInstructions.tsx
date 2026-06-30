"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function PaymentInstructions() {
  const [memberId, setMemberId] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("id_number")
        .eq("id", user.id)
        .single();

      if (data) {
        setMemberId(data.id_number);
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="rounded-2xl bg-slate-900 p-6">

      <h2 className="text-xl font-bold text-white">
        Payment Instructions
      </h2>

      <div className="mt-4 space-y-3 text-slate-300">

        <p>
          • Transfer the exact order amount.
        </p>

        <p>
          • Upload a clear payment receipt.
        </p>

        <p>
          • Use your Member ID as the transfer narration.
        </p>

        <div className="rounded-xl bg-slate-800 p-4">

          <p className="text-sm text-slate-400">
            Transfer Narration
          </p>

          <p className="mt-2 text-xl font-bold text-emerald-400">
            {memberId}
          </p>

        </div>

      </div>

    </div>
  );
}
