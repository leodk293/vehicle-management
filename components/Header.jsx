"use client";
import React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/utils/auth";
import Image from "next/image";
import Logo from "./Logo";

export default function Header() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  async function fetchSession() {
    const session = await getSession();
    //console.log("User session:", session);
    setSession(session);
    if (!session) {
      router.push("/login");
    }
  }

  useEffect(() => {
    (async () => {
      await fetchSession();
    })();
  }, [session]);

  return (
    <header className="bg-[#0d0d14] border-b border-white/[0.07] h-16 px-4 md:px-8 flex items-center justify-between relative">
      {/* Brand */}
      <Logo />

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-1">
        {[
          { label: "Dashboard", href: "/home", active: true },
          { label: "Profile", href: "/home/profile" },
          { label: "Contact", href: "/home/contact" },
          { label: "X/Twitter", href: "/home/contact" },
        ].map(({ label, href, active }) => (
          <Link
            key={label}
            href={href}
            className={`text-[13px] px-3.5 py-1.5 rounded-lg transition-all duration-150 no-underline
              ${
                active
                  ? "text-[#f5f0e8] bg-white/[0.07]"
                  : "text-white/45 hover:text-white/85 hover:bg-white/[0.05]"
              }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {session?.user ? (
          <div className="hidden sm:flex items-center gap-1">
            <div className="flex items-center gap-2 p-1 rounded-full">
              {session.user.user_metadata.avatar_url && (
                <Image
                  src={session.user.user_metadata.avatar_url}
                  alt="User Avatar"
                  width={32}
                  height={32}
                  className="rounded-full border border-white/[0.12] bg-white/[0.06]"
                />
              )}
              <p className="text-[13px] text-white/45">{session.user.name}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="text-[13px] cursor-pointer text-white/45 p-2 font-medium rounded-full hover:text-white/85 hover:bg-white/[0.05] no-underline transition-colors duration-150"
            >
              Sign Out
            </button>
          </div>
        ) : null}

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-white/[0.03]"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((s) => !s)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white/75"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu (collapsible) */}
      {mobileOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-[#0d0d14] border-b border-white/[0.04] z-40 shadow-md">
          <div className="px-4 py-3 flex flex-col gap-2">
            {[
              { label: "Dashboard", href: "/home", active: true },
              { label: "Profile", href: "/home/profile" },
              { label: "Contact", href: "/home/contact" },
              { label: "X/Twitter", href: "/home/contact" },
            ].map(({ label, href, active }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`block text-[15px] px-3 py-2 rounded-md transition-all duration-150 no-underline
                  ${
                    active
                      ? "text-[#f5f0e8] bg-white/[0.03]"
                      : "text-white/70 hover:text-white/90 hover:bg-white/[0.02]"
                  }`}
              >
                {label}
              </Link>
            ))}

            {/* Mobile sign out / user */}
            {session?.user ? (
              <div className="pt-2 border-t border-white/[0.03] mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {session.user.user_metadata.avatar_url && (
                    <Image
                      src={session.user.user_metadata.avatar_url}
                      alt="User Avatar"
                      width={36}
                      height={36}
                      className="rounded-full border border-white/[0.12] bg-white/[0.06]"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm text-white">
                      {session.user.name}
                    </span>
                    <span className="text-xs text-white/60">
                      {session.user.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut();
                  }}
                  className="text-sm text-white/70 px-3 py-1 rounded-md hover:bg-white/[0.03]"
                >
                  Sign Out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
