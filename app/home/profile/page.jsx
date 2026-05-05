"use client";
import React, { useEffect, useState } from "react";
import { getSession } from "@/utils/auth";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const [session, setSession] = useState(null);
  const [facturesByLocation, setFacturesByLocation] = useState({});
  const [generatingInvoiceFor, setGeneratingInvoiceFor] = useState(null);
  const [locations, setLocations] = useState({
    error: false,
    loading: false,
    data: [],
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const s = await getSession();
      if (mounted) setSession(s);
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
    setLocations({ error: false, loading: true, data: [] });
    (async () => {
      try {
        const { data, error } = await supabase
          .from("locations")
          .select()
          .eq("client_id", clientId);
        if (cancelled) return;
        if (error) throw new Error(error.message);
        const nextLocations = data ?? [];
        setLocations({ error: false, loading: false, data: nextLocations });
        const locationIds = nextLocations.map((l) => l.id).filter(Boolean);
        if (!locationIds.length) {
          setFacturesByLocation({});
          return;
        }
        const { data: factures, error: fErr } = await supabase
          .from("factures")
          .select("id, location_id, numero_facture, date_emission, total_price")
          .in("location_id", locationIds);
        if (fErr) throw new Error(fErr.message);
        setFacturesByLocation(
          (factures ?? []).reduce((acc, f) => {
            if (f.location_id) acc[f.location_id] = f;
            return acc;
          }, {}),
        );
      } catch (err) {
        if (cancelled) return;
        setLocations({ error: true, loading: false, data: [] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  async function handleGenerateInvoice(location) {
    if (!location?.id) return;
    setGeneratingInvoiceFor(location.id);
    const supabase = createClient();
    try {
      let facture = facturesByLocation[location.id] ?? null;
      if (!facture) {
        const { data: created, error } = await supabase
          .from("factures")
          .insert({
            location_id: location.id,
            total_price: Number(location.montant_total ?? 0),
          })
          .select("id, location_id, numero_facture, date_emission, total_price")
          .single();
        if (error) throw new Error(error.message);
        facture = created;
        setFacturesByLocation((prev) => ({ ...prev, [location.id]: created }));
      }
      const invoiceNumber = facture?.numero_facture
        ? `F-${String(facture.numero_facture).padStart(6, "0")}`
        : "N/A";
      const emissionDate = facture?.date_emission
        ? new Date(facture.date_emission).toLocaleString()
        : new Date().toLocaleString();
      const amount = Number(
        facture?.total_price ?? location?.montant_total ?? 0,
      ).toFixed(2);
      const blob = new Blob(
        [
          [
            "LOCOMOTE — RENTAL INVOICE",
            "===========================",
            `Invoice:    ${invoiceNumber}`,
            `Rental ID:  ${location.id}`,
            `Client:     ${session?.user?.user_metadata?.name ?? "Unknown"}`,
            `Email:      ${session?.user?.email ?? "Unknown"}`,
            `From:       ${new Date(location.date_debut).toLocaleString()}`,
            `To:         ${new Date(location.date_fin).toLocaleString()}`,
            `Issued:     ${emissionDate}`,
            "---------------------------",
            `TOTAL:      $${amount}`,
          ].join("\n"),
        ],
        { type: "text/plain;charset=utf-8" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceNumber}-${location.id.slice(0, 8)}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      window.alert("Unable to generate invoice. Please try again.");
    } finally {
      setGeneratingInvoiceFor(null);
    }
  }

  const user = session?.user;
  const name = user?.user_metadata?.name;
  const email = user?.email ?? user?.user_metadata?.email;
  const avatar = user?.user_metadata?.avatar_url;

  // ─── Loading skeleton ────────────────────────────────────────────────────────
  const isLoading = !session || locations.loading;

  return (
    <div
      className="min-h-screen bg-[#0a0a0b] px-5 py-10 text-[#e8e6e1]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* ── Profile card ── */}
        {isLoading ? (
          <div className="bg-[#111113] border border-[#1f1e1c] rounded-sm p-7 flex items-center gap-6">
            <Skeleton className="w-[68px] h-[68px] rounded-full bg-[#1a1916] shrink-0" />
            <div className="flex flex-col gap-3 flex-1">
              <Skeleton className="h-5 w-2/5 bg-[#1a1916] rounded-none" />
              <Skeleton className="h-3 w-3/5 bg-[#1a1916] rounded-none" />
            </div>
          </div>
        ) : (
          <div className="bg-[#111113] border border-[#1f1e1c] rounded-sm p-7 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="shrink-0 w-[68px] h-[68px] rounded-full border-2 border-amber-600 overflow-hidden bg-[#1a1916] flex items-center justify-center">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={name ?? "avatar"}
                  width={68}
                  height={68}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span
                  className="text-2xl font-bold text-amber-500 uppercase"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {name
                    ?.split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <h1
                className="text-3xl font-bold uppercase tracking-wide text-[#f0ece4] leading-none"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {name}
              </h1>
              <p className="text-xs text-[#4a4845] tracking-wide">{email}</p>
              <div className="flex gap-2 mt-2 justify-center sm:justify-start flex-wrap">
                <span className="text-[10px] tracking-[.14em] uppercase text-amber-700 bg-[#1a1510] border border-[#2a2010] px-2.5 py-1 rounded-sm">
                  {locations.data.length} Rental
                  {locations.data.length !== 1 ? "s" : ""}
                </span>
                <span className="text-[10px] tracking-[.14em] uppercase text-[#4a4845] bg-[#111113] border border-[#1f1e1c] px-2.5 py-1 rounded-sm">
                  Member since {new Date(user?.created_at).getFullYear()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Rental history card ── */}
        <div className="bg-[#111113] border border-[#1f1e1c] rounded-sm p-6">
          <div className="flex items-center justify-between border-b border-[#1f1e1c] pb-3 mb-5">
            <h2
              className="text-sm font-bold uppercase tracking-[.14em] text-[#f0ece4]"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Rental History
            </h2>
            {!isLoading && (
              <span className="text-[10px] tracking-[.12em] uppercase text-[#4a4845]">
                {locations.data.length} record
                {locations.data.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Skeleton rows */}
          {isLoading && (
            <div className="flex flex-col gap-5">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 items-center py-1">
                  <Skeleton className="w-[88px] h-[58px] bg-[#1a1916] rounded-sm shrink-0" />
                  <div className="flex-1 flex flex-col gap-2.5">
                    <Skeleton className="h-3 w-3/5 bg-[#1a1916] rounded-none" />
                    <Skeleton className="h-3 w-2/5 bg-[#1a1916] rounded-none" />
                  </div>
                  <Skeleton className="w-20 h-8 bg-[#1a1916] rounded-none shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!isLoading && locations.error && (
            <div className="flex items-center gap-3 bg-[#1a0c0c] border border-[#5c1f1f] rounded-sm px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="8"
                  cy="8"
                  r="6.5"
                  stroke="#f87171"
                  strokeWidth="1"
                />
                <path
                  d="M8 5v4M8 11v.5"
                  stroke="#f87171"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[11px] tracking-wide text-red-400">
                Unable to load rental history.
              </span>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !locations.error && locations.data.length === 0 && (
            <div className="text-center py-10 flex flex-col items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#1a1916] border border-[#2a2820] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect
                    x="2"
                    y="5"
                    width="14"
                    height="11"
                    rx="1"
                    stroke="#4a4845"
                    strokeWidth="1"
                  />
                  <path
                    d="M6 5V4a3 3 0 016 0v1"
                    stroke="#4a4845"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <p className="text-[11px] tracking-[.1em] uppercase text-[#4a4845]">
                No rentals yet
              </p>
            </div>
          )}

          {/* Rental rows */}
          {!isLoading &&
            !locations.error &&
            locations.data.map((location) => {
              const isActive = new Date(location.date_fin) > new Date();
              const days = Math.ceil(
                (new Date(location.date_fin) - new Date(location.date_debut)) /
                  86400000,
              );
              const facture = facturesByLocation[location.id];
              const invoiceLabel = facture?.numero_facture
                ? `F-${String(facture.numero_facture).padStart(6, "0")}`
                : null;

              return (
                <div
                  key={location.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b border-[#161513] last:border-0 last:pb-0 first:pt-0"
                >
                  {/* Thumb */}
                  <div className="w-[88px] h-[58px] rounded-sm overflow-hidden bg-[#161513] border border-[#1f1e1c] shrink-0 flex items-center justify-center">
                    {location.vehicle_image ? (
                      <Image
                        src={location.vehicle_image}
                        alt="Vehicle"
                        width={88}
                        height={58}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <svg viewBox="0 0 120 50" width="72" fill="none">
                        <path
                          d="M8 33C8 33 14 18 34 16L62 13C62 13 80 13 90 17L112 33"
                          stroke="#3a3830"
                          strokeWidth="1.2"
                        />
                        <path d="M5 34L115 34L112 40L8 40Z" fill="#252420" />
                        <path d="M34 16L44 13L78 13L90 17Z" fill="#1e1d1b" />
                        <circle
                          cx="30"
                          cy="40"
                          r="7"
                          fill="#1a1916"
                          stroke="#d4933a"
                          strokeWidth="1.2"
                        />
                        <circle cx="30" cy="40" r="3" fill="#2a2920" />
                        <circle
                          cx="90"
                          cy="40"
                          r="7"
                          fill="#1a1916"
                          stroke="#d4933a"
                          strokeWidth="1.2"
                        />
                        <circle cx="90" cy="40" r="3" fill="#2a2920" />
                        <rect
                          x="14"
                          y="25"
                          width="14"
                          height="7"
                          rx="1"
                          fill="#1a2836"
                          opacity=".8"
                        />
                        <rect
                          x="92"
                          y="25"
                          width="14"
                          height="7"
                          rx="1"
                          fill="#d4933a"
                          opacity=".3"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Details grid */}
                  <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-1.5">
                    <div className="flex flex-col gap-0.5 col-span-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-base font-bold uppercase tracking-wide text-[#f0ece4]"
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                          }}
                        >
                          {location.nom_vehicule ?? "Vehicle"}
                        </span>
                        <span
                          className={`text-[9px] font-bold tracking-[.14em] uppercase px-2 py-0.5 rounded-sm border ${
                            isActive
                              ? "bg-[#0d2115] text-[#4ade80] border-[#166534]"
                              : "bg-[#161513] text-[#6b6862] border-[#2a2820]"
                          }`}
                        >
                          {isActive ? "Active" : "Completed"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] tracking-[.14em] uppercase text-[#4a4845]">
                        From
                      </span>
                      <span className="text-xs text-[#c8c4bc]">
                        {new Date(location.date_debut).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] tracking-[.14em] uppercase text-[#4a4845]">
                        To
                      </span>
                      <span className="text-xs text-[#c8c4bc]">
                        {new Date(location.date_fin).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] tracking-[.14em] uppercase text-[#4a4845]">
                        Total
                      </span>
                      <span
                        className="text-lg font-bold text-amber-500 leading-none"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                      >
                        {location.montant_total}$
                        <span className="text-[10px] text-[#6b6862] font-normal ml-1">
                          {days}d
                        </span>
                      </span>
                    </div>
                    {invoiceLabel && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] tracking-[.14em] uppercase text-[#4a4845]">
                          Invoice
                        </span>
                        <span className="text-[11px] text-[#6b6862] tracking-wide">
                          {invoiceLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Invoice button */}
                  <button
                    type="button"
                    onClick={() => handleGenerateInvoice(location)}
                    disabled={generatingInvoiceFor === location.id}
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-[.14em] px-4 py-2 rounded-sm border transition-all ${
                      invoiceLabel
                        ? "bg-[#0d2115] text-[#4ade80] border-[#166534] cursor-default"
                        : generatingInvoiceFor === location.id
                          ? "bg-[#161513] text-[#4a4845] border-[#2a2820] cursor-not-allowed"
                          : "bg-[#161513] text-[#c8c4bc] border-[#2a2820] hover:border-amber-600 hover:text-amber-500"
                    }`}
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {generatingInvoiceFor === location.id
                      ? "Generating..."
                      : invoiceLabel
                        ? "Downloaded"
                        : "Get Invoice"}
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
