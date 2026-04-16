"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, getSession } from "@/utils/auth";
import Image from "next/image";
import googleLogo from "../../public/google-logo.png";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) router.push("/home");
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:48px_48px]" />

      {/* Speed lines */}
      <div className="absolute top-[28%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent animate-[sweep_3.5s_ease-in-out_infinite]" />
      <div className="absolute top-[52%] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent animate-[sweep_3.5s_ease-in-out_infinite] [animation-delay:1.1s]" />
      <div className="absolute top-[71%] left-[30%] right-[25%] h-px bg-gradient-to-r from-transparent via-yellow-300/15 to-transparent animate-[sweep_3.5s_ease-in-out_infinite] [animation-delay:2.2s]" />

      {/* Keyframe injection */}
      <style>{`@keyframes sweep{0%{opacity:0;transform:scaleX(.2) translateX(-30%)}40%{opacity:1;transform:scaleX(1) translateX(0)}100%{opacity:0;transform:scaleX(.6) translateX(20%)}}`}</style>

      {/* Card */}
      <div className="relative z-10 w-[360px] flex flex-col items-center px-10 py-11 rounded-[20px] border border-white/[0.08] bg-[rgba(16,16,22,0.92)]">
        {/* Logomark */}
        <div className="w-11 h-11 rounded-xl bg-yellow-400 flex items-center justify-center mb-6">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 17L10 7L14 14L17 10L20 17H5Z" fill="#0a0a0f" />
          </svg>
        </div>

        {/* Wordmark */}
        <h1 className="text-[28px] font-bold text-[#f5f0e8] tracking-tight mb-2 font-serif">
          Locomote
        </h1>
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 font-light mb-9">
          Move with purpose
        </p>

        <div className="w-full h-px bg-white/[0.07] mb-8" />

        {/* Google button */}
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-white/[0.12] bg-white/[0.05] text-[#f0ede8] text-sm font-medium tracking-wide transition-all duration-150 hover:bg-white/[0.09] hover:border-white/25 active:scale-[0.985] cursor-pointer"
        >
          <Image src={googleLogo} alt="Google" width={18} height={18} />
          Continue with Google
        </button>

        {/* Footer note */}
        <p className="mt-7 text-[11px] text-white/25 text-center leading-relaxed font-light">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5 align-middle" />
          By continuing, you agree to our Terms of Service
          <br />
          and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
