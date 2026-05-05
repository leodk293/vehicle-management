"use client";
import React, { useState, useEffect } from "react";
import { getSession } from "@/utils/auth";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Typewriter } from "react-simple-typewriter";
import { Allerta } from "next/font/google";

const allerta = Allerta({
  subsets: ["latin"],
  weight: "400",
});

export default function HomePage() {
  const supabase = createClient();
  const [session, setSession] = useState(null);
  const [vehicles, setVehicles] = useState({
    error: false,
    loading: false,
    data: [],
  });

  async function fetchSession() {
    const s = await getSession();
    setSession(s);
  }

  async function getVehicles() {
    setVehicles({ error: false, loading: true, data: [] });
    try {
      const { data, error } = await supabase.from("vehicules").select();
      if (error) throw new Error(error.message || "Failed to load vehicles");
      setVehicles({ error: false, loading: false, data: data ?? [] });
    } catch (err) {
      console.error(err?.message ?? err);
      setVehicles({ error: true, loading: false, data: [] });
    }
  }

  useEffect(() => {
    fetchSession();
  }, []);
  useEffect(() => {
    getVehicles();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0b] px-6 py-10 font-[DM_Sans]">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.22em] uppercase text-amber-600 mb-2 font-medium">
          Fleet Management Portal
        </p>
        <p className="text-2xl font-semibold capitalize tracking-wider text-[#f0ece4] leading-none mb-2 flex items-center justify-center gap-1">
          Hello{" "}
          <span className="text-amber-500 ml-1">
            <Typewriter
              words={
                session?.user?.user_metadata?.name
                  ? [`${session.user.user_metadata.name.split(" ")[0]}`]
                  : ["Guest"]
              }
              typeSpeed={50}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          </span>
          <span
            aria-label="Waving hand"
            role="img"
            className="animate-waving-hand text-2xl ml-2"
          >
            👋
          </span>
        </p>
        <h1
          className={`text-5xl font-bold uppercase tracking-wider text-[#f0ece4] leading-none mb-4 ${allerta.className}`}
        >
          <Typewriter
            words={["Welcome to LocoMote"]}
            loop={1}
            typeSpeed={100}
            deleteSpeed={40}
            delaySpeed={1600}
          />
        </h1>
        <p className="text-xs sm:text-sm text-[#d6a85c] tracking-wider mb-2 font-semibold">
          {session?.user?.user_metadata?.name
            ? `Ready for your next adventure, ${
                session.user.user_metadata.name.split(" ")[0]
              }?`
            : "Sign in to unlock the full driving experience"}
        </p>
        <p className="text-xs text-[#6b6862] tracking-widest mb-3">
          Choose your drive for the day and hit the road with style.
        </p>
        <p className="text-[12px] text-[#8f8b83] max-w-lg mx-auto mb-2">
          From sporty coupes to family SUVs, LocoMote puts the power of choice
          in your hands. Explore our curated fleet and manage your journeys with
          ease and confidence.
        </p>
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-4" />
      </div>

      {/* Error State */}
      {vehicles.error && (
        <p className="text-center text-[#6b6862] text-sm tracking-widest uppercase mt-20">
          — Unable to load vehicles —
        </p>
      )}

      {/* Loading Skeleton */}
      {vehicles.loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4  mx-auto">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#111113] border border-[#1f1e1c] rounded-sm overflow-hidden"
            >
              <Skeleton className="w-full aspect-[16/10] bg-[#1a1916]" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-2.5 w-1/2 bg-[#1f1e1c] rounded-none" />
                <Skeleton className="h-4 w-3/4 bg-[#1f1e1c] rounded-none" />
                <Skeleton className="h-px w-full bg-[#1f1e1c] rounded-none mt-3" />
                <Skeleton className="h-4 w-1/3 bg-[#1f1e1c] rounded-none ml-auto" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicle Grid */}
      {!vehicles.error && !vehicles.loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4  mx-auto">
          {vehicles.data.map((vehicle, i) => (
            <Link
              key={vehicle.id}
              href={`/home/vehicle/${vehicle.id}`}
              className="group bg-[#111113] border border-[#1f1e1c] hover:border-amber-600/70 rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 block"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Image */}
              <div className="relative w-full aspect-[16/10] bg-[#161513] overflow-hidden">
                <Image
                  src={vehicle.image_url}
                  alt={vehicle.marque}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                {/* Bottom fade overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Body */}
              <div className="p-3.5 pt-3">
                <p className="text-[10px] tracking-[0.18em] uppercase text-amber-700 mb-0.5">
                  {vehicle.categorie}
                </p>
                <p
                  className="text-[1.15rem] font-bold uppercase tracking-wide text-[#f0ece4] truncate mb-3 leading-tight"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {vehicle.marque}
                </p>

                {/* Price row */}
                <div className="flex items-center justify-between border-t border-[#222221] pt-2.5">
                  <span className="text-[10px] text-[#4a4845] uppercase tracking-widest">
                    Daily
                  </span>
                  <div
                    className="text-amber-500 text-lg font-bold leading-none"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {vehicle.prix_journalier}$
                    <span className="text-[10px] text-[#6b6862] font-normal ml-0.5 tracking-wide">
                      /day
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
