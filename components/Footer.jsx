import React from "react";
import Link from "next/link";
import Logo from "./Logo";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Live Map", href: "/map" },
      { label: "Fleet Manager", href: "/fleet" },
      { label: "Alerts", href: "/alerts" },
      { label: "Analytics", href: "/analytics" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/api" },
      { label: "Status", href: "/status" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "/security" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0d0d14] mt-30 border-t border-white/[0.07] px-4 md:px-8 pt-8 pb-7">
      {/* Top row */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-7">
        {/* Brand + tagline */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Logo />
          <p className="text-[12px] text-white/30 font-light tracking-wide md:ml-[44px] text-center md:text-left max-w-[320px]">
            Real-time vehicle tracking & fleet intelligence
          </p>
        </div>

        {/* Link columns -> responsive grid */}
        <div className="w-full md:w-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {FOOTER_LINKS.map(({ title, links }) => (
              <div
                key={title}
                className="flex flex-col gap-2.5 items-center md:items-start"
              >
                <span className="text-[11px] uppercase tracking-[0.12em] text-white/35 font-medium mb-1 text-center md:text-left">
                  {title}
                </span>
                {links.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="text-[13px] text-white/45 no-underline hover:text-white/80 transition-colors duration-150 text-center md:text-left"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col md:flex-row items-center md:items-center justify-between pt-5 border-t border-white/[0.05] gap-3">
        <span className="text-[11px] text-white/20 font-light text-center md:text-left">
          © 2026 Locomote. All rights reserved.
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-[11px] text-white/30">
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}
