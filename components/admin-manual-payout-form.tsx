"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminRecordManualPayout } from "@/app/actions/project-flow";

export default function AdminManualPayoutForm({
  projectId,
}: {
  projectId: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const form = e.currentTarget;
    const file = (form.elements.namedItem("proof") as HTMLInputElement)
      ?.files?.[0];
    const note = (form.elements.namedItem("note") as HTMLInputElement)?.value;

    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("note", note || "");

    if (file) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setBusy(false);
        setError("Sign in again.");
        return;
      }
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/payouts/${projectId}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("project-fabrics")
        .upload(path, file, { upsert: true });
      if (upErr) {
        setBusy(false);
        setError(`Could not upload receipt: ${upErr.message}`);
        return;
      }
      fd.set("proofPath", path);
    }

    try {
      await adminRecordManualPayout(fd);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 pt-4 border-t border-stone space-y-2">
      <p className="text-xs text-ink/60">
        Money already in OPay? Pay the artisan from OPay, then upload the
        receipt here. They confirm it before the job is marked paid.
      </p>
      <input name="proof" type="file" accept="image/*" className="w-full text-xs" />
      <input
        name="note"
        type="text"
        placeholder="OPay reference, or how you paid"
        className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
      />
      {error && <p className="text-[11px] text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="text-xs border border-royal text-royal rounded-full px-4 py-1.5 hover:bg-royal hover:text-paper disabled:opacity-50"
      >
        {busy ? "Saving…" : "Upload OPay receipt"}
      </button>
    </form>
  );
}
