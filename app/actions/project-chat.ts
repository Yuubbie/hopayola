"use server";

import { createClient } from "@/lib/supabase/server";
import { scanChatMessage } from "@/lib/chat-guard";

async function canAccessProject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  projectId: string,
  role: string | null
) {
  if (role === "admin") return true;
  const { data: project } = await supabase
    .from("projects")
    .select("client_id")
    .eq("id", projectId)
    .single();
  if (project?.client_id === userId) return true;
  const { data: team } = await supabase
    .from("project_team_members")
    .select("artisan_id")
    .eq("project_id", projectId)
    .eq("artisan_id", userId)
    .maybeSingle();
  return Boolean(team);
}

export async function listProjectMessages(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first.", messages: [] };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const ok = await canAccessProject(
    supabase,
    user.id,
    projectId,
    profile?.role ?? null
  );
  if (!ok) return { error: "Not on this project.", messages: [] };

  const { data, error } = await supabase
    .from("project_messages")
    .select("id, body, flagged, created_at, sender_id, profiles(full_name, role)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) return { error: error.message, messages: [] };
  return { error: null, messages: data || [] };
}

export async function sendProjectMessage(projectId: string, body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first." };

  const text = (body || "").trim();
  if (!text) return { error: "Type a message." };
  if (text.length > 2000) return { error: "Message too long." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const ok = await canAccessProject(
    supabase,
    user.id,
    projectId,
    profile?.role ?? null
  );
  if (!ok) return { error: "Not on this project." };

  const scan = scanChatMessage(text);
  const stored = scan.blocked
    ? "[Blocked] Contact details are not allowed in chat."
    : text;

  const { error } = await supabase.from("project_messages").insert({
    project_id: projectId,
    sender_id: user.id,
    body: stored,
    flagged: scan.blocked,
  });

  if (error) return { error: error.message };
  if (scan.blocked) return { error: scan.officialHint };
  return { error: null };
}
