import React from "react";
import { getSession } from "@/utils/auth";

export async function generateMetadata({ params }) {
  const session = await getSession();
  return {
    title: session?.user?.user_metadata?.name || "Profile",
  };
}

export default function layout({ children }) {
  return <>{children}</>;
}
