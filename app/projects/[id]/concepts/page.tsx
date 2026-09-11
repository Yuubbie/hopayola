import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ConceptSelectionForm from "@/components/concept-selection-form";

export default async function ProjectConcepts({
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
    redirect("/sign-in");
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("client_id", user.id)
    .single();

  if (!project) {
    notFound();
  }

  const { data: concepts } = await supabase
    .from("ai_design_concepts")
    .select("*")
    .eq("project_id", id)
    .order("concept_number", { ascending: true });

  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="font-display text-3xl mb-2">Your design concepts</h1>
      <p className="text-ink/60 mb-12">
        {project.garment_type || "Project"}
        {project.occasion ? ` - ${project.occasion}` : ""}. Pick the one you
        would like to move forward with.
      </p>

      {!concepts || concepts.length === 0 ? (
        <p className="text-ink/50 text-sm">
          Your concepts aren&apos;t ready yet. Check back soon.
        </p>
      ) : (
        <ConceptSelectionForm projectId={id} concepts={concepts} />
      )}
    </main>
  );
}