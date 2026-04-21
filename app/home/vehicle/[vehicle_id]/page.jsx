"use client";
import React, { useState, useEffect, useCallback, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { getSession } from "@/utils/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

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
  const success = () => {
    toast.success("Vehicle successfully rented", {
      position: "top-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const errorMsg = () => {
    toast.error("Something went wrong.", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const [session, setSession] = useState(null);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [rentingState, setRentingState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  async function fetchSession() {
    const session = await getSession();
    console.log;
    setSession(session);
  }

  const getVehicleDetails = useCallback(async () => {
    setVehicle({
      error: false,
      loading: true,
      data: "",
    });
    try {
      const { data, error } = await supabase
        .from("vehicules")
        .select()
        .eq("id", vehicle_id)
        .single();

      if (error) {
        throw new Error(error.message || "Failed to load vehicles");
      }
      setVehicle({
        error: false,
        loading: false,
        data: data,
      });
    } catch (error) {
      console.error(error?.message ?? error);
      setVehicle({
        error: true,
        loading: false,
        data: "",
      });
    }
  }, [supabase, vehicle_id]);

  async function handleVehicleRenting(event) {
    event.preventDefault();

    setRentingState({
      loading: true,
      error: "",
      success: "",
    });

    try {
      if (!session?.user?.id) {
        throw new Error("Please sign in before renting a vehicle.");
      }
      if (!pickupDate || !returnDate) {
        throw new Error("Please select a pickup and return date.");
      }

      const startDate = new Date(pickupDate);
      const endDate = new Date(returnDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (startDate < now) {
        throw new Error("Pickup date cannot be in the past.");
      }
      if (endDate <= startDate) {
        throw new Error("Return date must be after pickup date.");
      }
      if (!vehicle.data?.disponible) {
        throw new Error("This vehicle is no longer available.");
      }

      const msPerDay = 1000 * 60 * 60 * 24;
      const diffDays = Math.ceil((endDate - startDate) / msPerDay);
      const dailyPrice = Number(vehicle.data.prix_journalier) || 0;
      const montantTotal = Number((diffDays * dailyPrice).toFixed(2));

      const { error } = await supabase.from("locations").insert({
        client_id: session?.user.id,
        vehicule_id: vehicle_id,
        client_avatar: session?.user.user_metadata.avatar_url,
        nom_client: session?.user.user_metadata.name,
        vehicle_image: vehicle.data.image_url,
        date_debut: startDate.toISOString(),
        date_fin: endDate.toISOString(),
        montant_total: montantTotal,
      });

      if (!error) {
        await supabase
          .from("vehicules")
          .update({ disponible: false })
          .eq("id", vehicle_id);

        router.push("/");
        success();
      }

      if (error) {
        errorMsg();
        throw new Error(error.message || "Unable to create rental.");
      }

      setRentingState({
        loading: false,
        error: "",
        success: `Rental request created. Total: ${montantTotal}$`,
      });
      setPickupDate("");
      setReturnDate("");
    } catch (error) {
      const message = error?.message || "Unable to process vehicle renting.";
      console.error(message);
      setRentingState({
        loading: false,
        error: message,
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
  return (
    <div>
      {vehicle.loading ? (
        <p className=" text-white text-center">Loading</p>
      ) : vehicle.error ? (
        <p className=" text-white text-center">Error loading vehicle</p>
      ) : (
        vehicle.data && (
          <div className="flex flex-col items-center gap-8 w-full max-w-3xl mx-auto bg-black/5 border border-white/20 rounded-2xl p-8 shadow-xl mt-10">
            {/* Vehicle details section */}
            <div className="flex flex-col md:flex-row flex-wrap gap-6 w-full">
              <div className="flex-1 flex justify-center items-center">
                <Image
                  src={vehicle.data.image_url}
                  alt={vehicle.data.marque}
                  width={420}
                  height={280}
                  style={{ objectFit: "cover" }}
                  className="object-cover rounded-xl shadow-lg border border-white/10"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center bg-[#202344]/40 rounded-xl p-6 gap-3 text-left text-white shadow">
                <h2 className="text-2xl font-bold mb-2 text-indigo-400">
                  {vehicle.data.marque}
                </h2>
                <p>
                  <span className="font-medium text-indigo-200">Category:</span>{" "}
                  {vehicle.data.category}
                </p>
                <p>
                  <span className="font-medium text-indigo-200">
                    Daily Price:
                  </span>{" "}
                  <span className="font-bold text-indigo-300">
                    {vehicle.data.prix_journalier}$
                  </span>
                </p>
                <p>
                  <span className="font-medium text-indigo-200">Fuel:</span>{" "}
                  {vehicle.data.carburant}
                </p>
                <p>
                  <span className="font-medium text-indigo-200">
                    Registration:
                  </span>{" "}
                  {vehicle.data.immatriculation}
                </p>
                <p>
                  <span className="font-medium text-indigo-200">
                    Availability:
                  </span>{" "}
                  {vehicle.data.disponible ? (
                    <span className="px-2 py-1 rounded bg-green-600/30 text-green-300 font-semibold">
                      Available
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-red-700/40 text-red-300 font-semibold">
                      Not Available
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Form or Availability message */}
            <div className="w-full mt-4">
              {vehicle.data.disponible ? (
                <form
                  onSubmit={handleVehicleRenting}
                  className="flex flex-col gap-4 bg-[#252b43]/70 border border-white/10 rounded-xl p-6 shadow-lg max-w-md mx-auto"
                >
                  <h3 className="text-xl font-semibold text-indigo-400 mb-2 text-center">
                    Rent this Vehicle
                  </h3>
                  <label className="flex flex-col gap-1 text-white font-medium">
                    Pickup Date
                    <input
                      type="date"
                      name="pickup_date"
                      value={pickupDate}
                      onChange={(event) => setPickupDate(event.target.value)}
                      className="rounded px-3 py-2 mt-1 bg-white/90 text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-white font-medium">
                    Return Date
                    <input
                      type="date"
                      name="return_date"
                      value={returnDate}
                      onChange={(event) => setReturnDate(event.target.value)}
                      className="rounded px-3 py-2 mt-1 bg-white/90 text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      required
                    />
                  </label>

                  {rentingState.error ? (
                    <p className="text-red-300 text-sm">{rentingState.error}</p>
                  ) : null}
                  {rentingState.success ? (
                    <p className="text-green-300 text-sm">
                      {rentingState.success}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={rentingState.loading}
                    className="mt-2 bg-indigo-600 hover:bg-indigo-700 transition-all text-white font-bold rounded py-2 px-6 shadow-lg"
                  >
                    {rentingState.loading ? "Processing..." : "Rent Vehicle"}
                  </button>
                </form>
              ) : (
                <div className="bg-red-800/70 border border-red-700 text-red-200 rounded-xl p-6 text-center font-bold text-lg shadow-lg max-w-md mx-auto">
                  Sorry, this vehicle is currently{" "}
                  <span className="text-red-100 underline">not available</span>{" "}
                  for rent.
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
