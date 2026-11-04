import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { setArtisanVerified, rejectArtisanId } from "./actions";

export default async function AdminArtisans() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/account");
  }

  const service = createServiceClient();
  const { data: artisans } = await service
    .from("artisan_profiles")
    .select(
      "id, region, specialty, skills, years_experience, bio, verified, shop_address, legal_name, guarantor_phone, id_document_path"
    )
    .order("id", { ascending: false });

  const ids = (artisans || []).map((a) => a.id);
  const { data: people } =
    ids.length > 0
      ? await service
          .from("profiles")
          .select("id, full_name, phone")
          .in("id", ids)
      : { data: [] as { id: string; full_name: string | null; phone: string | null }[] };
  const personById = new Map((people || []).map((p) => [p.id, p]));

  const idHrefs = new Map<string, string>();
  for (const a of artisans || []) {
    if (!a.id_document_path) continue;
    const { data } = await service.storage
      .from("project-fabrics")
      .createSignedUrl(a.id_document_path, 60 * 60);
    if (data?.signedUrl) idHrefs.set(a.id, data.signedUrl);
  }

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl mb-2">Artisans</h1>
      <p className="text-ink/60 mb-12">
        Review and verify artisans before they can claim client projects. Phone,
        shop, guarantor and ID live here.
      </p>

      {!artisans || artisans.length === 0 ? (
        <p className="text-ink/50 text-sm">No artisans have signed up yet.</p>
      ) : (
        <ul className="space-y-4">
          {artisans.map((a) => {
            const person = personById.get(a.id);
            const idHref = idHrefs.get(a.id);
            return (
              <li key={a.id} className="border border-stone rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="font-medium text-sm block">
                      {person?.full_name || a.legal_name || "Unknown"}
                    </span>
                    <span className="text-ink/50 text-xs capitalize">
                      {a.region} - {a.years_experience ?? "?"} yrs experience
                    </span>
                    {person?.phone && (
                      <p className="text-xs text-ink/70 mt-2">Phone: {person.phone}</p>
                    )}
                    {a.legal_name && (
                      <p className="text-xs text-ink/70">Legal name: {a.legal_name}</p>
                    )}
                    {a.shop_address && (
                      <p className="text-xs text-ink/70">Shop: {a.shop_address}</p>
                    )}
                    {a.guarantor_phone && (
                      <p className="text-xs text-ink/70">
                        Guarantor: {a.guarantor_phone}
                      </p>
                    )}
                    {idHref ? (
                      <div className="mt-2">
                        <a href={idHref} target="_blank" rel="noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={idHref}
                            alt="Uploaded ID"
                            className="w-40 h-28 object-cover rounded-lg border border-stone"
                          />
                          <span className="block text-xs text-royal mt-1">
                            Open full file
                          </span>
                        </a>
                        <p className="text-[11px] text-ink/50 mt-1 max-w-xs">
                          Must look like a national ID, passport or licence.
                          Not a selfie or family photo. Do not verify until it
                          is an ID.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-ink/40 mt-1">No ID uploaded yet</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 text-xs rounded-full px-3 py-1 ${
                      a.verified
                        ? "bg-royal text-paper"
                        : "border border-stone text-ink/60"
                    }`}
                  >
                    {a.verified ? "Verified" : "Pending review"}
                  </span>
                </div>

                {a.specialty && a.specialty.length > 0 && (
                  <p className="text-sm text-ink/70 mb-1">
                    <span className="text-ink/40">Specialty: </span>
                    {a.specialty.join(", ")}
                  </p>
                )}
                {a.skills && a.skills.length > 0 && (
                  <p className="text-sm text-ink/70 mb-1">
                    <span className="text-ink/40">Skills: </span>
                    {a.skills.join(", ")}
                  </p>
                )}
                {a.bio && (
                  <p className="text-sm text-ink/70 mb-3">{a.bio}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={setArtisanVerified}>
                    <input type="hidden" name="artisanId" value={a.id} />
                    <input
                      type="hidden"
                      name="verified"
                      value={(!a.verified).toString()}
                    />
                    <button
                      type="submit"
                      className={`text-sm rounded-lg px-4 py-1.5 transition-colors ${
                        a.verified
                          ? "border border-stone hover:border-ink"
                          : "bg-royal text-paper hover:bg-royal-deep"
                      }`}
                    >
                      {a.verified ? "Revoke verification" : "Verify artisan"}
                    </button>
                  </form>
                  {idHref && (
                    <form action={rejectArtisanId}>
                      <input type="hidden" name="artisanId" value={a.id} />
                      <button
                        type="submit"
                        className="text-sm rounded-lg px-4 py-1.5 border border-red-200 text-red-800"
                      >
                        Not an ID · ask them to upload again
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
