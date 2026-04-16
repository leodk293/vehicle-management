"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getSession } from "@/utils/auth";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  async function fetchSession() {
    const session = await getSession();
    if (session) {
      router.push("/home");
    } else {
      router.push("/login");
    }
    setIsLoading(false);
  }

  useEffect(() => {
    (async () => {
      await fetchSession();
    })();
  }, []);

  if (isLoading) return <div>Loading...</div>;
}
