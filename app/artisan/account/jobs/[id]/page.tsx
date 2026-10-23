import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import ProjectChat from "@/components/ProjectChat";
import ProjectSequence from "@/components/ProjectSequence";
import { signedProofUrl, withProofUrls } from "@/lib/milestone-proofs";
import { artisanConfirmManualPayout } from "@/app/actions/project-flow";

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

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const dynamic = "force-dynamic";

export default async function ArtisanJobDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const service = createServiceClient();
  const email = (user.email || "").toLowerCase();

  const { data: emailProfiles } = email
    ? await service.from("profiles").select("id").ilike("email", email)
    : { data: [] as { id: string }[] };
  const artisanIds = Array.from(
    new Set([user.id, ...(emailProfiles || []).map((p) => p.id)])
  );

  const { data: assignment } = await service
    .from("project_team_members")
    .select("project_id")
    .eq("project_id", id)
    .in("artisan_id", artisanIds)
    .maybeSingle();

  if (!assignment) {
    notFound();
  }

  const { data: project } = await service
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const { data: milestones } = await service
    .from("project_milestones")
    .select("*")
    .eq("project_id", id)
    .order("milestone_order", { ascending: true });

  const milestoneList = await withProofUrls((milestones || []) as any[]);
  const payoutProofHref = await signedProofUrl(project.payout_proof_path);

  let selectedLook: {
    image_url: string | null;
    persona: string | null;
    concept_number: number | null;
  } | null = null;
  if (project.selected_concept_id) {
    const { data: concept } = await service
      .from("ai_design_concepts")
      .select("image_url, persona, concept_number")
      .eq("id", project.selected_concept_id)
      .maybeSingle();
    selectedLook = concept;
  } else {
    const { data: concept } = await service
      .from("ai_design_concepts")
      .select("image_url, persona, concept_number")
      .eq("project_id", id)
      .eq("is_selected", true)
      .maybeSingle();
    selectedLook = concept;
  }

  const fabricPaths: string[] = Array.isArray(project.fabric_image_urls)
    ? project.fabric_image_urls
    : [];
  const fabricHrefs: string[] = [];
  for (const path of fabricPaths.slice(0, 4)) {
    const { data } = await service.storage
      .from("project-fabrics")
      .createSignedUrl(String(path), 3600);
    if (data?.signedUrl) fabricHrefs.push(data.signedUrl);
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/artisan/account#jobs"
        className="text-xs text-ink/50 hover:text-royal"
      >
        &larr; Back to my jobs
      </Link>

      <header className="mt-4 mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="font-display text-2xl md:text-3xl">
            {project.garment_type || "Project"}
            {project.occasion ? ` - ${project.occasion}` : ""}
          </h1>
          <span className="text-xs border border-stone rounded-full px-3 py-1 text-ink/60">
            {STATUS_LABELS[project.status] ?? project.status}
          </span>
        </div>
        <p className="text-sm text-ink/55 capitalize">
          {project.tier} package
          {project.delivery_deadline
            ? ` | Due ${formatDate(project.delivery_deadline)}`
            : ""}
        </p>
        {project.status === "cancelled" && (
          <p className="text-sm text-red-800 mt-3 border border-red-200 bg-red-50 rounded-xl px-4 py-3">
            Hopayola cancelled this job
            {project.cancelled_note ? `: ${project.cancelled_note}` : "."} Stop
            work. You will not be paid for a cancelled project.
          </p>
        )}
      </header>

      <p className="text-xs text-ink/55 border border-stone rounded-xl px-4 py-3 mb-6 leading-relaxed">
        Packaging: Hopayola will send you branded shipping boxes. You may use
        your own branded wrap inside, but the finished outfit must go out in
        the Hopayola box. The outer box is ours, so the client knows it came
        through the studio.
      </p>

      <section className="border border-stone rounded-2xl p-6 mb-6">
        <h2 className="font-display text-lg mb-3">Look to make</h2>
        {selectedLook?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selectedLook.image_url}
            alt="Selected concept"
            className="w-full max-w-sm rounded-xl border border-stone mb-3"
          />
        ) : (
          <p className="text-sm text-ink/50 mb-3">
            No selected drawing yet. The client still needs to pick a concept.
          </p>
        )}
        {selectedLook?.persona && (
          <p className="text-sm text-ink/70 mb-2">
            Concept {selectedLook.concept_number}: {selectedLook.persona}
          </p>
        )}
        {project.style_direction && (
          <p className="text-sm text-ink/70 leading-relaxed">
            {project.style_direction}
          </p>
        )}
        {fabricHrefs.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-ink/50 mb-2">Client photos</p>
            <div className="flex flex-wrap gap-2">
              {fabricHrefs.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt="Client fabric or reference"
                  className="w-24 h-24 object-cover rounded-lg border border-stone"
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="border border-stone rounded-2xl p-6 mb-6">
        <h2 className="font-display text-lg mb-4">What to do next</h2>
        <ProjectSequence
          project={project}
          role="artisan"
          viewerId={user.id}
          milestones={milestoneList}
        />
      </section>

      {project.payout_proof_at && !project.payout_confirmed_at && (
        <section className="border border-royal/30 bg-royal/5 rounded-2xl p-6 mb-6">
          <h2 className="font-display text-lg mb-2">Hopayola sent your payout</h2>
          <p className="text-sm text-ink/70 mb-3">
            They paid from OPay because the money had already left Paystack.
            Check your bank, then confirm it here.
          </p>
          {project.payout_proof_note && (
            <p className="text-xs text-ink/55 mb-3">
              Their note: {project.payout_proof_note}
            </p>
          )}
          {payoutProofHref && (
            <a
              href={payoutProofHref}
              target="_blank"
              rel="noreferrer"
              className="block mb-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={payoutProofHref}
                alt="Payout receipt from Hopayola"
                className="w-40 h-40 object-cover rounded-lg border border-stone"
              />
              <span className="block text-[11px] text-royal mt-1">
                Open the receipt
              </span>
            </a>
          )}
          <form action={artisanConfirmManualPayout}>
            <input type="hidden" name="projectId" value={id} />
            <button
              type="submit"
              className="bg-royal text-paper rounded-full px-5 py-2 text-sm hover:bg-royal-deep transition-colors"
            >
              I have received the money
            </button>
          </form>
        </section>
      )}

      <section className="border border-stone rounded-2xl p-6">
        <h2 className="font-display text-lg mb-4">Messages and updates</h2>
        <ProjectChat projectId={id} viewerRole="artisan" />
      </section>
    </div>
  );
}
