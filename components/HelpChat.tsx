"use client";

import { useState } from "react";
import { sendHelpEnquiry } from "@/app/actions/help-chat";
import {
  HOPAYOLA_SUPPORT_EMAIL,
  HOPAYOLA_WHATSAPP,
  HOPAYOLA_WHATSAPP_LINK,
} from "@/lib/chat-guard";

export default function HelpChat() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const res = await sendHelpEnquiry({ name, email, message });
    setLoading(false);
    if (res.error) {
      setStatus(res.error);
      return;
    }
    setMessage("");
    setStatus("Sent to Hopayola. We will reply by email.");
  }

  return (
    <div className="fixed bottom-4 right-4 z-[55]">
      {open && (
        <div className="mb-3 w-[min(100vw-2rem,22rem)] bg-paper border border-stone rounded-2xl shadow-xl p-4">
          <p className="font-display text-lg mb-1">Ask Hopayola</p>
          <p className="text-xs text-ink/50 mb-3">
            Public help only — not artisan/client project chat. For a live
            job, use Project chat on your account.
          </p>
          <form onSubmit={onSubmit} className="space-y-2">
            <input
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
            />
            <input
              required
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
            />
            <textarea
              required
              rows={3}
              placeholder="How can we help?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-royal text-paper rounded-full py-2 text-sm disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send to Hopayola"}
            </button>
          </form>
          {status && <p className="text-xs mt-2 text-ink/70">{status}</p>}
          <p className="text-[11px] text-ink/40 mt-3">
            Or{" "}
            <a className="text-royal" href={`mailto:${HOPAYOLA_SUPPORT_EMAIL}`}>
              {HOPAYOLA_SUPPORT_EMAIL}
            </a>{" "}
            ·{" "}
            <a className="text-royal" href={HOPAYOLA_WHATSAPP_LINK}>
              WhatsApp {HOPAYOLA_WHATSAPP}
            </a>
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="ml-auto flex bg-royal text-paper rounded-full px-4 py-3 text-sm shadow-lg hover:bg-royal-deep"
      >
        {open ? "Close" : "Ask Hopayola"}
      </button>
    </div>
  );
}
