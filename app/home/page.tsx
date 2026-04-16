'use client';
import React from "react";
import { getSession } from "@/utils/auth";

export default function HomePage() {
  async function fetchSession() {
    const session = await getSession();
    //console.log("User session:", session);
  }
  fetchSession();
  return <div>page</div>;
}
