"use client";

import { useFormState } from "react-dom";
import { confirmMilestone, disputeMilestone } from "@/app/actions/milestone-flow";

export default function MilestoneClientActions({
  milestoneId,
  projectId,
  status,
  confirmedAt,
}: {
  milestoneId: string;
  projectId: string;
  status: string;
  confirmedAt?: string | null;
}) {
  const [payoutMessage, confirmAction] = useFormState(confirmMilestone, null);

  if (status === "paid" || status === "paid_out") return null;
  if (confirmedAt && !payoutMessage) {
    return (
      <p className="text-xs text-ink/50 mt-1">
        Confirmed. Artisan payout is pending.
      </p>
    );
  }

  const canReview =
    status === "submitted" || status === "in_progress" || status === "completed";
  if (!canReview) return null;

  return (
    <div className="mt-2 space-y-1">
      {payoutMessage && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
          {payoutMessage}
        </p>
      )}
      {!confirmedAt && (
        <div className="flex gap-2">
          <form action={confirmAction}>
            <input type="hidden" name="milestoneId" value={milestoneId} />
            <input type="hidden" name="projectId" value={projectId} />
            <button
              type="submit"
              className="text-xs bg-royal text-paper rounded-full px-3 py-1.5 hover:bg-royal-deep"
            >
              Confirm &amp; pay artisan
            </button>
          </form>
          <form action={disputeMilestone}>
            <input type="hidden" name="milestoneId" value={milestoneId} />
            <input type="hidden" name="projectId" value={projectId} />
            <button type="submit" className="text-xs text-red-700 hover:underline">
              Dispute
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
