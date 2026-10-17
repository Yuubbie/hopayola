import Link from "next/link";
import { formatInboxTime, type InboxRow } from "@/lib/inbox";

export default function MessageInbox({
  rows,
  role,
  emptyHint,
}: {
  rows: InboxRow[];
  role: string;
  emptyHint: string;
}) {
  const unreadTotal = rows.reduce((total, row) => total + row.unread, 0);
  const withMessages = rows.filter((row) => row.lastAt);
  const silent = rows.filter((row) => !row.lastAt);

  return (
    <div className="max-w-3xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl mb-1">Messages</h1>
        <p className="text-sm text-ink/55">
          {rows.length === 0
            ? "Nothing to talk about yet."
            : unreadTotal === 0
              ? `${rows.length} conversation${rows.length === 1 ? "" : "s"} · all read`
              : `${unreadTotal} unread across ${rows.length} conversation${rows.length === 1 ? "" : "s"}`}
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="border border-stone rounded-2xl p-8 text-center">
          <p className="text-sm text-ink/55">{emptyHint}</p>
        </div>
      ) : (
        <>
          {withMessages.length > 0 && (
            <ul className="space-y-3 mb-10">
              {withMessages.map((row) => (
                <li key={row.projectId}>
                  <Link
                    href={row.href}
                    className="block border border-stone rounded-2xl p-5 hover:border-royal transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <span className="font-medium text-sm">{row.label}</span>
                      <span className="flex items-center gap-2 shrink-0">
                        {row.unread > 0 && (
                          <span className="bg-royal text-paper text-[11px] rounded-full px-2 py-0.5 font-medium">
                            {row.unread}
                          </span>
                        )}
                        <span className="text-[11px] text-ink/40">
                          {formatInboxTime(row.lastAt)}
                        </span>
                      </span>
                    </div>

                    <p
                      className={`text-sm leading-relaxed line-clamp-2 ${
                        row.unread > 0 ? "text-ink" : "text-ink/60"
                      }`}
                    >
                      {row.lastSender ? `${row.lastSender}: ` : ""}
                      {row.lastBody}
                    </p>

                    <p className="text-[11px] text-ink/40 mt-2">
                      {row.status}
                      {" · "}
                      {row.messageCount} message
                      {row.messageCount === 1 ? "" : "s"}
                      {role === "admin" && row.lastFlagged
                        ? " · last line flagged by the chat guard"
                        : ""}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {silent.length > 0 && (
            <section>
              <h2 className="font-display text-lg mb-1">
                Nothing said yet
              </h2>
              <p className="text-xs text-ink/50 mb-4">
                These projects have no messages. Open one to start the
                conversation.
              </p>
              <ul className="space-y-3">
                {silent.map((row) => (
                  <li key={row.projectId}>
                    <Link
                      href={row.href}
                      className="flex flex-wrap items-center justify-between gap-3 border border-stone rounded-2xl p-4 hover:border-royal transition-colors"
                    >
                      <span className="text-sm">{row.label}</span>
                      <span className="text-[11px] text-ink/45">
                        {row.status} · start the thread
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
