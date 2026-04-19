import React from "react";
import { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Home",
};

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className=" mt-20 min-h-screen flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
