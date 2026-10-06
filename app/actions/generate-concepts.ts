"use server";

import { generateConceptsForProject } from "@/lib/generate-concepts";

export async function generateConceptsAction(projectId: string, tier: string) {
  await generateConceptsForProject(projectId, tier);
}
