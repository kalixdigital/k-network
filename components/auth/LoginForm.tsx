"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

import AuthHeader from "./AuthHeader";
import FormInput from "@/components/form/FormInput";
import FormPassword from "@/components/form/FormPassword";
import FormCheckbox from "@/components/form/FormCheckbox";
import SubmitButton from "@/components/form/SubmitButton";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl">

      <AuthHeader
        title="Welcome Back"
        description="Sign in to your K-NETWORK account."
      />

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-6"
      >
        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormPassword
          label="Password"
          value={password}
          onChange={setPassword}
        />

        <div className="flex items-center justify-between">

          <FormCheckbox
            checked={remember}
            onCheckedChange={setRemember}
            label="Remember me"
          />

          <a
            href="/forgot-password"
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            Forgot Password?
          </a>

        </div>

        <SubmitButton loading={loading}>
          Sign In
        </SubmitButton>


	<div className="text-center pt-2">
  <p className="text-sm text-slate-400">
    Don't have an account?{" "}
    <a
      href="/register"
      className="font-semibold text-emerald-400 hover:text-emerald-300"
    >
      Create one
    </a>
  </p>
</div>


      </form>

    </div>
  );
}
