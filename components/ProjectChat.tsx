"use client";

import { useEffect, useState } from "react";
import {
  listProjectMessages,
  sendProjectMessage,
} from "@/app/actions/project-chat";
import {
  HOPAYOLA_SUPPORT_EMAIL,
  HOPAYOLA_WHATSAPP,
  HOPAYOLA_WHATSAPP_LINK,
} from "@/lib/chat-guard";

type Msg = {
  id: string;
  body: string;
  flagged: boolean;
  created_at: string;
  sender_id: string;
  profiles?: { full_name?: string | null; role?: string | null } | null;
};

export default function ProjectChat({
  projectId,
  viewerRole,
}: {
  projectId: string;
  viewerRole: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const res = await listProjectMessages(projectId);
    if (res.error && !res.messages.length) setError(res.error);
    setMessages((res.messages || []) as Msg[]);
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 8000);
    return () => clearInterval(t);
  }, [projectId]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await sendProjectMessage(projectId, text);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setText("");
    await refresh();
  }

  return (
    <div className="mt-4 pt-4 border-t border-stone">
      <p className="text-sm font-medium mb-1">Project chat</p>
      <p className="text-xs text-ink/50 mb-3">
        Text only. No voice notes, numbers, or socials. Off-platform:{" "}
        <a className="text-royal" href={`mailto:${HOPAYOLA_SUPPORT_EMAIL}`}>
          {HOPAYOLA_SUPPORT_EMAIL}
        </a>{" "}
        or{" "}
        <a className="text-royal" href={HOPAYOLA_WHATSAPP_LINK}>
          WhatsApp {HOPAYOLA_WHATSAPP}
        </a>
        . Admin can read this thread.
      </p>
      <div className="max-h-56 overflow-y-auto space-y-2 mb-3 bg-stone/30 rounded-xl p-3">
        {messages.length === 0 && (
          <p className="text-xs text-ink/40">No messages yet.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="text-xs">
            <span className="text-ink/45">
              {m.profiles?.full_name || "Member"}
              {m.profiles?.role === "admin" ? " · Hopayola" : ""}
            </span>
            <p
              className={
                m.flagged ? "text-amber-800" : "text-ink leading-relaxed"
              }
            >
              {m.body}
            </p>
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <form onSubmit={onSend} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          placeholder="Message about this project…"
          className="flex-1 border border-stone rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-royal text-paper rounded-lg px-3 py-2 text-sm disabled:opacity-50"
        >
          Send
        </button>
      </form>
      {viewerRole === "admin" && (
        <p className="text-[11px] text-ink/40 mt-2">
          You are in as admin. Flagged lines stay visible here.
        </p>
      )}
    </div>
  );
}
