"use client";
import React from "react";
import { useEffect, useState } from "react";
import { getSession } from "@/utils/auth";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

export default function ProfilePage() {
  const [session, setSession] = useState(null);
  const [locations, setLocations] = useState({
    error: false,
    loading: false,
    data: [],
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const nextSession = await getSession();
      if (mounted) setSession(nextSession);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const clientId = session?.user?.id;
    if (!clientId) {
      setLocations({ error: false, loading: false, data: [] });
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    setLocations({
      error: false,
      loading: true,
      data: [],
    });

    (async () => {
      try {
        const { data, error } = await supabase
          .from("locations")
          .select()
          .eq("client_id", clientId);

        if (cancelled) return;
        if (error) {
          throw new Error(`Impossible to get the locations : ${error.message}`);
        }
        setLocations({
          error: false,
          loading: false,
          data: data ?? [],
        });
      } catch (error) {
        if (cancelled) return;
        console.error(error instanceof Error ? error.message : error);
        setLocations({
          error: true,
          loading: false,
          data: [],
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return (
    <div className="min-h-screen text-white flex flex-col items-center py-12">
      <div className="bg-white/5 border border-white/20 rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center gap-6 w-full max-w-2xl">
        <div className="flex flex-col sm:flex-row gap-6 items-center w-full">
          {session?.user.user_metadata.avatar_url && (
            <Image
              src={session?.user.user_metadata.avatar_url}
              alt={
                session?.user.user_metadata.name
                  ? session?.user.user_metadata.name
                  : "User avatar"
              }
              title={session?.user.user_metadata.name}
              width={80}
              height={80}
              className="rounded-full border-4 border-indigo-500 shadow-lg bg-white/[0.08] transition-transform hover:scale-105"
            />
          )}
          <div className="flex flex-col gap-1 sm:ml-6 items-center sm:items-start">
            <h1 className="text-3xl font-bold text-indigo-300">
              {session?.user?.user_metadata.name}
            </h1>
            <p className="text-base text-indigo-100">
              {session?.user.user_metadata.email}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-7 bg-white/10 border border-white/10 rounded-xl p-6 w-full shadow-inner">
          <h2 className="text-2xl font-semibold text-indigo-200 mb-2 border-b border-indigo-400/20 pb-2">
            Your Vehicle Locations
          </h2>
          <div className="flex flex-col gap-3">
            {locations.error ? (
              <div className="flex items-center gap-2 text-red-300 bg-red-900/30 px-3 py-2 rounded-md">
                <svg
                  className="w-5 h-5 text-red-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Something went wrong</span>
              </div>
            ) : locations.loading ? (
              <div className="flex items-center gap-2 text-white/80">
                <svg
                  className="animate-spin w-6 h-6 text-indigo-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                <span>Loading...</span>
              </div>
            ) : locations.data && locations.data.length > 0 ? (
              locations.data.map((location) => (
                <div
                  key={
                    location.id ??
                    `${location.vehicule_id}-${location.date_debut}-${location.date_fin}`
                  }
                  className="flex flex-col sm:flex-row items-center gap-5 bg-black/30 border border-indigo-400/10 rounded-xl px-4 py-3 shadow-md transition hover:ring-2 hover:ring-indigo-300"
                >
                  <Image
                    src={location.vehicle_image}
                    alt="Vehicle"
                    width={110}
                    height={110}
                    className="rounded-lg shadow-md object-cover border-2 border-indigo-500/40"
                  />
                  <div className="flex flex-1 flex-col sm:flex-row gap-6 w-full justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-indigo-300 uppercase font-semibold">
                        Start Date
                      </span>
                      <span className="font-mono text-base text-white">
                        {new Date(location.date_debut).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-indigo-300 uppercase font-semibold">
                        End Date
                      </span>
                      <span className="font-mono text-base text-white">
                        {new Date(location.date_fin).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-indigo-300 uppercase font-semibold">
                        Total Price
                      </span>
                      <span className="text-lg font-semibold text-green-300">
                        {location.montant_total}$
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-indigo-100 text-base text-center py-2">
                You have no vehicle locations yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
