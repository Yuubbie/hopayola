"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { submitMilestone } from "@/app/actions/milestone-flow";

export default function MilestoneSubmitForm({
  milestoneId,
  projectId,
}: {
  milestoneId: string;
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

    const fd = new FormData();
    fd.set("milestoneId", milestoneId);
    fd.set("projectId", projectId);

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
      const path = `${user.id}/milestones/${milestoneId}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("project-fabrics")
        .upload(path, file, { upsert: true });
      if (upErr) {
        setBusy(false);
        setError(`Could not upload photo: ${upErr.message}`);
        return;
      }
      fd.set("proofUrl", path);
    }

    try {
      await submitMilestone(fd);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-2 space-y-2">
      <p className="text-[11px] text-ink/50">
        Take a photo of this stage on your phone, then upload it here — no
        link needed.
      </p>
      <input
        name="proof"
        type="file"
        accept="image/*"
        className="w-full text-xs"
      />
      {error && <p className="text-[11px] text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="text-xs bg-royal text-paper rounded-full px-3 py-1.5 hover:bg-royal-deep disabled:opacity-50"
      >
        {busy ? "Sending…" : "Send for client review"}
      </button>
    </form>
  );
}
