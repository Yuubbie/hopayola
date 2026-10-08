"use client";

import { submitMilestone } from "@/app/actions/milestone-flow";

export default function MilestoneSubmitForm({
  milestoneId,
  projectId,
}: {
  milestoneId: string;
  projectId: string;
}) {
  return (
    <form action={submitMilestone} className="mt-2 space-y-2">
      <input type="hidden" name="milestoneId" value={milestoneId} />
      <input type="hidden" name="projectId" value={projectId} />
      <input
        name="proofUrl"
        type="url"
        placeholder="Proof photo URL (optional)"
        className="w-full border border-stone rounded-lg px-3 py-1.5 text-xs"
      />
      <button
        type="submit"
        className="text-xs bg-royal text-paper rounded-full px-3 py-1.5 hover:bg-royal-deep"
      >
        Mark milestone submitted
      </button>
    </form>
  );
}
