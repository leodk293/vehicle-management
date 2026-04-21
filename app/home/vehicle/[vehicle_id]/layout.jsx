import React from "react";
import { createClient } from "@/utils/supabase/client";
import { cookies } from "next/headers";

export async function generateMetadata({ params }) {
  const { vehicle_id: vehicle_id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicules")
    .select()
    .eq("id", vehicle_id)
    .single();
  if (data) {
    return {
      title: data.marque || "Vehicle",
    };
  }
}

export default function layout({ children }) {
  return <>{children}</>;
}
