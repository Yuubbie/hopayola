"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function isWorkspace(path: string) {
  return (
    path.startsWith("/account") ||
    path.startsWith("/admin") ||
    path.startsWith("/artisan") ||
    path.startsWith("/projects")
  );
}

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const workspace = isWorkspace(path);

  return (
    <>
      {!workspace && <Navbar />}
      {children}
      {!workspace && <Footer />}
    </>
  );
}
