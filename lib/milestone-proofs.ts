import { createServiceClient } from "@/lib/supabase/service";

/**
 * Proof photos are stored as bucket paths, not URLs, in a bucket that is not
 * public. Anything showing them has to sign each path for the viewer, otherwise
 * the client sees a stage with no photo at all.
 */
export async function withProofUrls<
  T extends { proof_url?: string | null; proof_href?: string | null },
>(milestones: T[]): Promise<T[]> {
  const service = createServiceClient();

  return Promise.all(
    milestones.map(async (m) => {
      const raw = m.proof_url;
      if (!raw) return { ...m, proof_href: null };
      if (raw.startsWith("http")) return { ...m, proof_href: raw };

      const { data } = await service.storage
        .from("project-fabrics")
        .createSignedUrl(raw, 60 * 60);

      return { ...m, proof_href: data?.signedUrl ?? null };
    })
  );
}

export async function signedProofUrl(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const service = createServiceClient();
  const { data } = await service.storage
    .from("project-fabrics")
    .createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}
