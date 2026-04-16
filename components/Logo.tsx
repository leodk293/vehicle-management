import React from "react";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 no-underline">
      <div className="w-[34px] h-[34px] rounded-[9px] bg-yellow-400 flex items-center justify-center flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M5 17L10 7L14 14L17 10L20 17H5Z" fill="#0a0a0f" />
        </svg>
      </div>
      <span className="font-serif text-[20px] font-bold text-[#f5f0e8] tracking-tight">
        Locomote
      </span>
    </Link>
  );
}
