import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type InboxRow = {
  projectId: string;
  label: string;
  status: string;
  href: string;
  lastBody: string | null;
  lastAt: string | null;
  lastSender: string | null;
  lastFlagged: boolean;
  messageCount: number;
  unread: number;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "New brief",
  concepts_ready: "Designing",
  concept_selected: "Ready to match",
  artisan_assigned: "Team assigned",
  in_production: "In production",
  milestone_review: "Awaiting review",
  completed: "Completed",
  cancelled: "Cancelled",
};

const ACTIVE_STATUSES = [
  "submitted",
  "concepts_ready",
  "concept_selected",
  "artisan_assigned",
  "in_production",
  "milestone_review",
];

function projectHref(role: string, projectId: string) {
  if (role === "admin") return `/admin/projects/${projectId}`;
  if (role === "artisan") return `/artisan/account/jobs/${projectId}`;
  return `/account/projects/${projectId}`;
}

function projectLabel(p: any) {
  return `${p.garment_type || "Project"}${p.occasion ? ` - ${p.occasion}` : ""}`;
}

/**
 * Every thread this person can see, newest activity first, with a per-person
 * unread count. Projects with no messages yet are listed too, so the inbox also
 * works as a directory of who you can talk to.
 */
export async function loadInbox({
  viewerId,
  role,
  email,
}: {
  viewerId: string;
  role: string;
  email?: string | null;
}): Promise<InboxRow[]> {
  const supabase = await createClient();
  const service = createServiceClient();

  let projectQuery;

  if (role === "admin") {
    projectQuery = service
      .from("projects")
      .select("id, garment_type, occasion, status, created_at");
  } else if (role === "artisan") {
    const lower = (email || "").toLowerCase();
    const { data: emailProfiles } = lower
      ? await service.from("profiles").select("id").ilike("email", lower)
      : { data: [] as { id: string }[] };

    const artisanIds = Array.from(
      new Set([viewerId, ...(emailProfiles || []).map((p) => p.id)])
    );

    const { data: teamRows } = await service
      .from("project_team_members")
      .select("project_id")
      .in("artisan_id", artisanIds);

    const projectIds = Array.from(
      new Set((teamRows || []).map((t) => t.project_id).filter(Boolean))
    );

    projectQuery =
      projectIds.length > 0
        ? service
            .from("projects")
            .select("id, garment_type, occasion, status, created_at")
            .in("id", projectIds)
        : null;
  } else {
    projectQuery = supabase
      .from("projects")
      .select("id, garment_type, occasion, status, created_at")
      .eq("client_id", viewerId);
  }

  const { data: projectRows } = projectQuery
    ? await projectQuery.order("created_at", { ascending: false })
    : { data: [] as any[] };

  const projects = (projectRows || []) as any[];
  if (projects.length === 0) return [];

  const projectIds = projects.map((p) => p.id);

  const { data: messageRows } = await service
    .from("project_messages")
    .select("id, project_id, body, flagged, created_at, sender_id, profiles(full_name)")
    .in("project_id", projectIds)
    .order("created_at", { ascending: true });

  // Before the reads table exists this errors; treat unread as unknown rather
  // than marking every message unread forever.
  const { data: readRows, error: readError } = await supabase
    .from("project_message_reads")
    .select("project_id, last_read_at")
    .eq("user_id", viewerId);
  const readsAvailable = !readError;

  const readMap = new Map(
    (readRows || []).map((r: any) => [r.project_id, r.last_read_at as string])
  );

  const byProject = new Map<string, any[]>();
  for (const m of (messageRows || []) as any[]) {
    const list = byProject.get(m.project_id) || [];
    list.push(m);
    byProject.set(m.project_id, list);
  }

  const rows: InboxRow[] = projects.map((p) => {
    const list = byProject.get(p.id) || [];
    const last = list.length > 0 ? list[list.length - 1] : null;
    const lastRead = readMap.get(p.id);

    const unread = readsAvailable
      ? list.filter((m) => {
          if (m.sender_id === viewerId) return false;
          if (!lastRead) return true;
          return new Date(m.created_at).getTime() > new Date(lastRead).getTime();
        }).length
      : 0;

    return {
      projectId: p.id,
      label: projectLabel(p),
      status: STATUS_LABELS[p.status] ?? p.status,
      href: projectHref(role, p.id),
      lastBody: last?.body ?? null,
      lastAt: last?.created_at ?? null,
      lastSender: last?.profiles?.full_name ?? null,
      lastFlagged: Boolean(last?.flagged),
      messageCount: list.length,
      unread,
    };
  });

  return rows.sort((a, b) => {
    if (a.lastAt && b.lastAt) {
      return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime();
    }
    if (a.lastAt) return -1;
    if (b.lastAt) return 1;
    const aActive = ACTIVE_STATUSES.includes(
      projects.find((p) => p.id === a.projectId)?.status
    );
    const bActive = ACTIVE_STATUSES.includes(
      projects.find((p) => p.id === b.projectId)?.status
    );
    if (aActive === bActive) return 0;
    return aActive ? -1 : 1;
  });
}

export function formatInboxTime(value: string | null) {
  if (!value) return "";
  const then = new Date(value);
  const now = new Date();
  const sameDay = then.toDateString() === now.toDateString();
  if (sameDay) {
    return then.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  const days = Math.floor(
    (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days < 7) {
    return then.toLocaleDateString("en-GB", { weekday: "short" });
  }
  return then.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
