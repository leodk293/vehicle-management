"use client";
import React, { useState, useEffect, useCallback, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { getSession } from "@/utils/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function VehiclePage({ params }) {
  const resolvedParams = use(params);
  const supabase = createClient();
  const router = useRouter();
  const vehicle_id = resolvedParams.vehicle_id;

  const [vehicle, setVehicle] = useState({
    error: false,
    loading: false,
    data: "",
  });
  const [session, setSession] = useState(null);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [rentingState, setRentingState] = useState({
    loading: false,
    error: "",
    success: "",
  });
  const [reviewEligibility, setReviewEligibility] = useState({
    loading: false,
    canReview: false,
    locationId: null,
    alreadyReviewed: false,
  });
  const [reviewForm, setReviewForm] = useState({
    note: 5,
    commentaire: "",
  });
  const [reviewState, setReviewState] = useState({
    loading: false,
    error: "",
    success: "",
  });
  const [vehicleReviews, setVehicleReviews] = useState({
    loading: false,
    error: false,
    data: [],
  });

  const totalDays =
    pickupDate && returnDate
      ? Math.max(
          0,
          Math.ceil((new Date(returnDate) - new Date(pickupDate)) / 86400000),
        )
      : 0;
  const totalPrice =
    totalDays > 0
      ? (totalDays * Number(vehicle.data?.prix_journalier || 0)).toFixed(2)
      : null;
  const totalPriceNumber = totalPrice ? Number(totalPrice) : 0;

  const success = () =>
    toast.success("Vehicle successfully rented", {
      position: "top-right",
      autoClose: 2500,
    });
  const errorMsg = () =>
    toast.error("Something went wrong.", {
      position: "top-right",
      autoClose: 2000,
    });

  async function fetchSession() {
    setSession(await getSession());
  }

  const getVehicleDetails = useCallback(async () => {
    setVehicle({ error: false, loading: true, data: "" });
    try {
      const { data, error } = await supabase
        .from("vehicules")
        .select()
        .eq("id", vehicle_id)
        .single();
      if (error) throw new Error(error.message);
      setVehicle({ error: false, loading: false, data });
    } catch {
      setVehicle({ error: true, loading: false, data: "" });
    }
  }, [supabase, vehicle_id]);

  async function handleVehicleRenting(event) {
    event.preventDefault();
    setRentingState({ loading: true, error: "", success: "" });
    try {
      if (!session?.user?.id)
        throw new Error("Please sign in before renting a vehicle.");
      if (!pickupDate || !returnDate)
        throw new Error("Please select a pickup and return date.");
      const startDate = new Date(pickupDate);
      const endDate = new Date(returnDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (startDate < now)
        throw new Error("Pickup date cannot be in the past.");
      if (endDate <= startDate)
        throw new Error("Return date must be after pickup date.");
      if (!vehicle.data?.disponible)
        throw new Error("This vehicle is no longer available.");
      if (!totalPriceNumber || totalDays <= 0) {
        throw new Error("Invalid rental duration.");
      }
      const { data: createdLocation, error: locationError } = await supabase
        .from("locations")
        .insert({
          client_id: session.user.id,
          vehicule_id: vehicle_id,
          client_avatar: session.user.user_metadata.avatar_url,
          nom_client: session.user.user_metadata.name,
          vehicle_image: vehicle.data.image_url,
          date_debut: startDate.toISOString(),
          date_fin: endDate.toISOString(),
          montant_total: totalPriceNumber,
        })
        .select("id, montant_total")
        .single();
      if (locationError) {
        errorMsg();
        throw new Error(locationError.message);
      }
      const { error: factureError } = await supabase.from("factures").insert({
        location_id: createdLocation.id,
        total_price: Number(createdLocation.montant_total ?? totalPriceNumber),
      });
      if (factureError) {
        errorMsg();
        throw new Error(
          `Rental created but invoice generation failed: ${factureError.message}`,
        );
      }
      await supabase
        .from("vehicules")
        .update({ disponible: false })
        .eq("id", vehicle_id);
      success();
      router.push("/");
    } catch (err) {
      setRentingState({
        loading: false,
        error: err?.message || "Unable to process.",
        success: "",
      });
    }
  }

  const checkReviewEligibility = useCallback(async () => {
    const clientId = session?.user?.id;
    if (!clientId || !vehicle_id) {
      setReviewEligibility({
        loading: false,
        canReview: false,
        locationId: null,
        alreadyReviewed: false,
      });
      return;
    }

    setReviewEligibility((prev) => ({ ...prev, loading: true }));
    try {
      const { data: latestLocation, error: locationError } = await supabase
        .from("locations")
        .select("id")
        .eq("client_id", clientId)
        .eq("vehicule_id", vehicle_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (locationError) {
        throw new Error(locationError.message);
      }
      if (!latestLocation?.id) {
        setReviewEligibility({
          loading: false,
          canReview: false,
          locationId: null,
          alreadyReviewed: false,
        });
        return;
      }

      const { data: existingReview, error: reviewError } = await supabase
        .from("avis")
        .select("id")
        .eq("client_id", clientId)
        .eq("vehicule_id", vehicle_id)
        .eq("location_id", latestLocation.id)
        .limit(1)
        .maybeSingle();

      if (reviewError) {
        throw new Error(reviewError.message);
      }

      setReviewEligibility({
        loading: false,
        canReview: true,
        locationId: latestLocation.id,
        alreadyReviewed: Boolean(existingReview?.id),
      });
    } catch (err) {
      setReviewEligibility({
        loading: false,
        canReview: false,
        locationId: null,
        alreadyReviewed: false,
      });
      console.error("Unable to check review eligibility", err);
    }
  }, [session?.user?.id, supabase, vehicle_id]);

  const getVehicleReviews = useCallback(async () => {
    if (!vehicle_id) return;
    setVehicleReviews({
      loading: true,
      error: false,
      data: [],
    });
    try {
      const { data, error } = await supabase
        .from("avis")
        .select("id, nom_client_affiche, note, commentaire, date_publication")
        .eq("vehicule_id", vehicle_id)
        .order("date_publication", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setVehicleReviews({
        loading: false,
        error: false,
        data: data ?? [],
      });
    } catch (err) {
      console.error("Unable to fetch vehicle reviews", err);
      setVehicleReviews({
        loading: false,
        error: true,
        data: [],
      });
    }
  }, [supabase, vehicle_id]);

  async function handleReviewSubmit(event) {
    event.preventDefault();
    setReviewState({ loading: true, error: "", success: "" });
    try {
      if (!session?.user?.id) {
        throw new Error("Please sign in to leave feedback.");
      }
      if (!reviewEligibility.locationId || !reviewEligibility.canReview) {
        throw new Error("You can only review a vehicle you have rented.");
      }
      if (reviewEligibility.alreadyReviewed) {
        throw new Error("You already reviewed this rental.");
      }

      const noteValue = Number(reviewForm.note);
      if (!Number.isInteger(noteValue) || noteValue < 1 || noteValue > 5) {
        throw new Error("Rating must be between 1 and 5.");
      }

      const { error } = await supabase.from("avis").insert({
        client_id: session.user.id,
        vehicule_id: vehicle_id,
        location_id: reviewEligibility.locationId,
        nom_client_affiche:
          session.user.user_metadata?.name ||
          session.user.email ||
          "Anonymous client",
        note: noteValue,
        commentaire: reviewForm.commentaire.trim() || null,
      });

      if (error) {
        throw new Error(error.message);
      }

      setReviewState({
        loading: false,
        error: "",
        success: "Thanks for your feedback.",
      });
      setReviewEligibility((prev) => ({ ...prev, alreadyReviewed: true }));
      setReviewForm((prev) => ({ ...prev, commentaire: "" }));
      await getVehicleReviews();
    } catch (err) {
      setReviewState({
        loading: false,
        error: err?.message || "Unable to submit review.",
        success: "",
      });
    }
  }

  useEffect(() => {
    getVehicleDetails();
  }, [getVehicleDetails]);
  useEffect(() => {
    fetchSession();
  }, []);
  useEffect(() => {
    checkReviewEligibility();
  }, [checkReviewEligibility]);
  useEffect(() => {
    getVehicleReviews();
  }, [getVehicleReviews]);

  const totalReviews = vehicleReviews.data.length;
  const averageRating =
    totalReviews > 0
      ? (
          vehicleReviews.data.reduce(
            (sum, review) => sum + Number(review.note || 0),
            0,
          ) / totalReviews
        ).toFixed(1)
      : null;

  // ─── Loading Skeleton ───────────────────────────────────────────────────────
  if (vehicle.loading) {
    return (
      <div
        className="min-h-screen bg-[#0a0a0b] px-5 py-8"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-3 w-40 bg-[#1a1916] rounded-none mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="w-full aspect-[16/10] bg-[#1a1916] rounded-sm" />
            <div className="bg-[#111113] border border-[#1f1e1c] rounded-sm p-6 flex flex-col gap-4">
              <Skeleton className="h-8 w-3/5 bg-[#1a1916] rounded-none" />
              <Skeleton className="h-3 w-1/3 bg-[#1a1916] rounded-none" />
              <div className="flex flex-col gap-3 mt-2">
                {[100, 80, 90, 70].map((w, i) => (
                  <Skeleton
                    key={i}
                    className={`h-3 bg-[#1a1916] rounded-none`}
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="bg-[#111113] border border-[#1f1e1c] rounded-sm p-6 mt-6">
            <Skeleton className="h-3 w-1/4 bg-[#1a1916] rounded-none mb-5" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 bg-[#1a1916] rounded-none" />
              <Skeleton className="h-10 bg-[#1a1916] rounded-none" />
            </div>
            <Skeleton className="h-12 w-full bg-[#1a1916] rounded-none mt-4" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────────────────────────
  if (vehicle.error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#4a4845]">
          — Unable to load vehicle —
        </p>
      </div>
    );
  }

  // ─── Content ─────────────────────────────────────────────────────────────────
  return vehicle.data ? (
    <div
      className="min-h-screen bg-[#0a0a0b] px-5 py-8 text-[#e8e6e1]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase text-[#4a4845] mb-8">
          <Link href="/home" className="hover:text-amber-600 transition-colors">
            Fleet
          </Link>
          <span className="text-[#2a2926]">›</span>
          <span className="text-amber-600">{vehicle.data.marque}</span>
        </div>

        {/* Top: image + specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="relative rounded-sm overflow-hidden aspect-[16/10] bg-[#111113] border border-[#1f1e1c]">
            <Image
              src={vehicle.data.image_url}
              alt={vehicle.data.marque}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Availability badge */}
            <div
              className={`absolute top-3 left-3 text-[10px] tracking-[0.16em] uppercase font-bold px-2.5 py-1 rounded-sm border`}
              style={
                vehicle.data.disponible
                  ? {
                      background: "#14401e",
                      color: "#4ade80",
                      borderColor: "#166534",
                    }
                  : {
                      background: "#3b0f0f",
                      color: "#f87171",
                      borderColor: "#7f1d1d",
                    }
              }
            >
              {vehicle.data.disponible ? "Available" : "Unavailable"}
            </div>
          </div>

          {/* Specs */}
          <div className="bg-[#111113] border border-[#1f1e1c] rounded-sm p-6">
            <h2
              className="text-3xl font-bold uppercase tracking-wide text-[#f0ece4] leading-none mb-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {vehicle.data.marque}
            </h2>
            <p className="text-[11px] tracking-[0.18em] uppercase text-amber-700 mb-5">
              {vehicle.data.categorie}
            </p>
            <div className="flex flex-col">
              {[
                {
                  key: "Daily Rate",
                  val: `${vehicle.data.prix_journalier}$`,
                  accent: true,
                },
                { key: "Fuel", val: vehicle.data.carburant },
                {
                  key: "Registration",
                  val: vehicle.data.immatriculation,
                  mono: true,
                },
                {
                  key: "Status",
                  val: vehicle.data.disponible ? "Available" : "Unavailable",
                  color: vehicle.data.disponible ? "#4ade80" : "#f87171",
                },
              ].map(({ key, val, accent, mono, color }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2.5 border-b border-[#1a1916] last:border-0"
                >
                  <span className="text-[10px] tracking-[0.1em] uppercase text-[#4a4845]">
                    {key}
                  </span>
                  <span
                    className={
                      mono
                        ? "text-xs bg-[#1a1916] border border-[#2a2820] px-2 py-0.5 tracking-widest text-[#c8c4bc]"
                        : "text-sm font-medium text-[#c8c4bc]"
                    }
                    style={
                      accent
                        ? {
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "1.2rem",
                            color: "#d4933a",
                          }
                        : color
                          ? {
                              fontSize: "10px",
                              letterSpacing: ".12em",
                              textTransform: "uppercase",
                              color,
                            }
                          : {}
                    }
                  >
                    {accent ? `${val} ` : val}
                    {accent && (
                      <span className="text-[10px] text-[#6b6862] font-normal">
                        /day
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking form or unavailable */}
        {vehicle.data.disponible ? (
          <form
            onSubmit={handleVehicleRenting}
            className="bg-[#111113] border border-[#1f1e1c] rounded-sm p-6 mt-6"
          >
            <h3
              className="text-sm font-bold uppercase tracking-[.14em] text-[#f0ece4] mb-5 pb-4 border-b border-[#1f1e1c]"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Reserve this vehicle
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pickup */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[.16em] uppercase text-[#4a4845]">
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  required
                  className="bg-[#0d0d0e] border border-[#2a2926] focus:border-amber-600 rounded-sm text-[#e8e6e1] text-sm px-3 py-2.5 outline-none transition-colors"
                  style={{ colorScheme: "dark" }}
                />
              </div>
              {/* Return */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[.16em] uppercase text-[#4a4845]">
                  Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                  className="bg-[#0d0d0e] border border-[#2a2926] focus:border-amber-600 rounded-sm text-[#e8e6e1] text-sm px-3 py-2.5 outline-none transition-colors"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>

            {/* Live total */}
            {totalPrice && (
              <div className="flex items-center justify-between bg-[#0d0d0e] border border-[#1f1e1c] rounded-sm px-4 py-3 mt-4">
                <span className="text-[10px] tracking-[.12em] uppercase text-[#4a4845]">
                  Total — {totalDays} day{totalDays > 1 ? "s" : ""}
                </span>
                <span
                  className="text-xl font-bold text-amber-500"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {totalPrice}$
                </span>
              </div>
            )}

            {/* Error / success feedback */}
            {rentingState.error && (
              <p className="text-[11px] tracking-wide text-red-400 mt-3 bg-[#1a0c0c] border border-[#5c1f1f] rounded-sm px-3 py-2">
                {rentingState.error}
              </p>
            )}

            <button
              type="submit"
              disabled={rentingState.loading}
              className="w-full mt-4 py-3.5 bg-amber-600 hover:bg-amber-500 disabled:bg-[#2a2416] disabled:text-[#5c4a28] transition-colors text-[#0a0a0b] font-bold uppercase tracking-[.14em] text-sm rounded-sm"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {rentingState.loading ? "Processing..." : "Confirm Reservation"}
            </button>
          </form>
        ) : (
          <div className="bg-[#1a0c0c] border border-[#5c1f1f] rounded-sm p-6 mt-6 text-center">
            <div className="w-9 h-9 rounded-full bg-[#3b0f0f] border border-[#7f1d1d] flex items-center justify-center mx-auto mb-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 5v4M8 11v.5"
                  stroke="#f87171"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle
                  cx="8"
                  cy="8"
                  r="6.5"
                  stroke="#f87171"
                  strokeWidth="1"
                />
              </svg>
            </div>
            <p
              className="text-sm font-bold uppercase tracking-[.1em] text-red-400 mb-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Currently Unavailable
            </p>
            <p className="text-[11px] text-[#6b3a3a] tracking-wide">
              This vehicle is already rented. Check back later.
            </p>
          </div>
        )}

        <div className="bg-[#111113] border border-[#1f1e1c] rounded-sm p-6 mt-6">
          <h3
            className="text-sm font-bold uppercase tracking-[.14em] text-[#f0ece4] mb-4 pb-4 border-b border-[#1f1e1c]"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Leave Your Feedback
          </h3>

          {!session?.user?.id ? (
            <p className="text-[11px] tracking-wide text-[#8f8b83]">
              Sign in to leave a review after your rental.
            </p>
          ) : reviewEligibility.loading ? (
            <p className="text-[11px] tracking-wide text-[#8f8b83]">
              Checking your rental eligibility...
            </p>
          ) : !reviewEligibility.canReview ? (
            <p className="text-[11px] tracking-wide text-[#8f8b83]">
              You can leave feedback only after renting this vehicle.
            </p>
          ) : reviewEligibility.alreadyReviewed ? (
            <p className="text-[11px] tracking-wide text-green-400">
              You already submitted a review for this rental.
            </p>
          ) : (
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[.16em] uppercase text-[#4a4845]">
                  Rating
                </label>
                <select
                  value={reviewForm.note}
                  onChange={(event) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      note: Number(event.target.value),
                    }))
                  }
                  className="bg-[#0d0d0e] border border-[#2a2926] focus:border-amber-600 rounded-sm text-[#e8e6e1] text-sm px-3 py-2.5 outline-none transition-colors"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[.16em] uppercase text-[#4a4845]">
                  Comment
                </label>
                <textarea
                  value={reviewForm.commentaire}
                  onChange={(event) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      commentaire: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Share your experience with this vehicle..."
                  className="bg-[#0d0d0e] border border-[#2a2926] focus:border-amber-600 rounded-sm text-[#e8e6e1] text-sm px-3 py-2.5 outline-none transition-colors resize-none"
                />
              </div>

              {reviewState.error && (
                <p className="text-[11px] tracking-wide text-red-400">
                  {reviewState.error}
                </p>
              )}
              {reviewState.success && (
                <p className="text-[11px] tracking-wide text-green-400">
                  {reviewState.success}
                </p>
              )}

              <button
                type="submit"
                disabled={reviewState.loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-[#1e2233] disabled:text-[#6e7696] transition-colors text-white font-bold uppercase tracking-[.14em] text-sm rounded-sm"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {reviewState.loading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>

        <div className="bg-[#111113] border border-[#1f1e1c] rounded-sm p-6 mt-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#1f1e1c]">
            <h3
              className="text-sm font-bold uppercase tracking-[.14em] text-[#f0ece4]"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Customer Reviews
            </h3>
            <div className="text-right">
              <p className="text-amber-500 text-lg font-bold leading-none">
                {averageRating ? `${averageRating}/5` : "N/A"}
              </p>
              <p className="text-[10px] uppercase tracking-[.12em] text-[#6b6862]">
                {totalReviews} review{totalReviews > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {vehicleReviews.loading ? (
            <p className="text-[11px] tracking-wide text-[#8f8b83]">
              Loading reviews...
            </p>
          ) : vehicleReviews.error ? (
            <p className="text-[11px] tracking-wide text-red-400">
              Unable to load reviews.
            </p>
          ) : totalReviews === 0 ? (
            <p className="text-[11px] tracking-wide text-[#8f8b83]">
              No reviews yet for this vehicle.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {vehicleReviews.data.map((review) => (
                <article
                  key={review.id}
                  className="bg-[#0d0d0e] border border-[#1f1e1c] rounded-sm p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#e8e6e1]">
                      {review.nom_client_affiche}
                    </p>
                    <p className="text-xs text-amber-500 font-semibold">
                      {"★".repeat(Number(review.note || 0))}
                      {"☆".repeat(5 - Number(review.note || 0))}
                    </p>
                  </div>
                  <p className="text-[10px] tracking-[.12em] uppercase text-[#6b6862] mt-1">
                    {new Date(review.date_publication).toLocaleString()}
                  </p>
                  <p className="text-sm text-[#c8c4bc] mt-3">
                    {review.commentaire || "No comment provided."}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;
}
