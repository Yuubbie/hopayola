"use client";

import { useState } from "react";
import { initiateProjectPayment } from "@/app/actions/paystack-checkout";

export default function PayProjectButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setError(null);
    setLoading(true);
    try {
      const { authorizationUrl } = await initiateProjectPayment(projectId);
      window.location.href = authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-stone">
      <button
        onClick={handlePay}
        disabled={loading}
        className="text-xs bg-royal text-paper rounded-full px-4 py-1.5 hover:bg-royal-deep transition-colors disabled:opacity-50"
      >
        {loading ? "Starting payment..." : "Pay for this project"}
      </button>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}