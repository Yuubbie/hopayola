"use client";

import { useEffect, useState } from "react";
import DemoOnboarding from "@/components/DemoOnboarding";

export default function DemoOnboardingButton({
  className = "",
  label = "See how it works",
}: {
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("demo") === "1") {
      setOpen(true);
    }
  }, []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      <DemoOnboarding open={open} onClose={() => setOpen(false)} />
    </>
  );
}
