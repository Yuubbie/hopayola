import { revalidatePath } from "next/cache";
import { claimAndPayout } from "@/lib/payout-core";

/** Not a server action. Only import from trusted server code. */
export async function runMilestonePayout(milestoneId: string, projectId: string) {
  const result = await claimAndPayout(milestoneId, projectId);

  revalidatePath("/admin/projects/" + projectId);
  revalidatePath("/account");
  revalidatePath("/artisan/account");
  return result;
}