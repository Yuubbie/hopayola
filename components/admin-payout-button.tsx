"use client";

import { useFormState } from "react-dom";
import { payoutMilestoneForm } from "@/app/actions/paystack-payout";

export default function AdminPayoutButton({
  milestoneId,
  projectId,
}: {
  milestoneId: string;
  projectId: string;
}) {
  const [message, action] = useFormState(payoutMilestoneForm, null);

  return (
    <div className="mt-2">
      <form action={action}>
        <input type="hidden" name="milestoneId" value={milestoneId} />
        <input type="hidden" name="projectId" value={projectId} />
        <button type="submit" className="text-xs text-royal hover:text-royal-deep">
          Retry artisan payout
        </button>
      </form>
      {message && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 mt-2">
          {message}
        </p>
      )}
    </div>
  );
}
