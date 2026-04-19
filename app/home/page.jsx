"use client";
import React, { useState, useEffect } from "react";
import { getSession } from "@/utils/auth";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";
import { nanoid } from "nanoid";
import Link from "next/link";

export default function HomePage() {
  const supabase = createClient();
  const [session, setSession] = useState(null);

  async function fetchSession() {
    const session = await getSession();
    setSession(session);
  }
  const [vehicles, setVehicles] = useState({
    error: false,
    loading: false,
    data: [],
  });
  async function getVehicles() {
    setVehicles({
      error: false,
      loading: true,
      data: [],
    });
    try {
      const { data, error } = await supabase.from("vehicules").select();
      if (error) {
        throw new Error(error.message || "Failed to load vehicles");
      }
      setVehicles({
        error: false,
        loading: false,
        data: data ?? [],
      });
    } catch (error) {
      console.error(error?.message ?? error);
      setVehicles({
        error: true,
        loading: false,
        data: [],
      });
    }
  }

  useEffect(() => {
    (async () => {
      await fetchSession();
    })();
  }, [session]);

  useEffect(() => {
    getVehicles();
  }, []);

  return (
    <div className="flex flex-col items-center gap-5">
      <h1 className="text-4xl text-white font-bold">Welcome to Locomote</h1>
      {vehicles.error ? (
        <p className="text-center text-white text-lg">
          Error loading vehicles
        </p>
      ) : vehicles.loading ? (
        <p className="text-center text-white text-lg">Loading</p>
      ) : (
        <div className="flex flex-wrap gap-6 justify-center mt-6">
          {vehicles.data.map((vehicle) => (
            <div
              className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-4 w-64 flex flex-col items-center hover:scale-105 hover:border-[#4f46e5] transition-all duration-200"
              key={vehicle.id}
            >
              <Link
                href={`/home/vehicle/${vehicle.id}`}
                className="w-full flex flex-col items-center text-inherit"
                style={{ textDecoration: "none" }}
              >
                <div className="relative w-48 h-32 mb-3 rounded-lg overflow-hidden bg-white/10">
                  <Image
                    className="object-cover w-full h-full"
                    fill
                    src={vehicle.image_url}
                    alt={vehicle.marque}
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 200px"
                  />
                </div>
                <div className="w-full flex flex-col gap-1 mb-3">
                  <p className="text-xl font-semibold text-[#e0e7ef] truncate">
                    {vehicle.marque}
                  </p>
                  <p className="text-[14px] font-medium text-indigo-300">
                    {vehicle.categorie}
                  </p>
                </div>
                <div className="flex items-center justify-between w-full border-t border-white/10 pt-2">
                  <span className="text-sm text-slate-300">Daily Price:</span>
                  <span className="text-lg font-bold text-indigo-400">
                    {vehicle.prix_journalier}$
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
)
}