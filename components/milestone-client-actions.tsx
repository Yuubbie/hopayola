import { confirmMilestoneReview, disputeMilestone } from "@/app/actions/milestone-flow";

export default function MilestoneClientActions({
  milestoneId,
  projectId,
  status,
  confirmedAt,
  submittedAt,
}: {
  milestoneId: string;
  projectId: string;
  status: string;
  confirmedAt?: string | null;
  submittedAt?: string | null;
}) {
  if (status === "paid" || status === "paid_out") return null;
  if (confirmedAt) {
    return <p className="text-xs text-ink/50 mt-1">Milestone reviewed.</p>;
  }
  if (!submittedAt) return null;

  return (
    <div className="mt-2 flex gap-2">
      <form action={confirmMilestoneReview}>
        <input type="hidden" name="milestoneId" value={milestoneId} />
        <input type="hidden" name="projectId" value={projectId} />
        <button
          type="submit"
          className="text-xs bg-royal text-paper rounded-full px-3 py-1.5"
        >
          Confirm reviewed
        </button>
      </form>
      <form action={disputeMilestone}>
        <input type="hidden" name="milestoneId" value={milestoneId} />
        <input type="hidden" name="projectId" value={projectId} />
        <button type="submit" className="text-xs text-red-700">
          Not satisfied
        </button>
      </form>
    </div>
  );
}
