"use client";

import {
  artisanConfirmFabric,
  artisanShipProject,
  clientMarkReceived,
  clientMarkPaid,
  clientSendFabric,
} from "@/app/actions/project-flow";
import { COURIER_LINKS } from "@/lib/couriers";
import PayProjectButton from "@/components/pay-project-button";
import MilestoneSubmitForm from "@/components/milestone-submit-form";
import MilestoneClientActions from "@/components/milestone-client-actions";

type Project = {
  id: string;
  funded_at?: string | null;
  fabric_sent_at?: string | null;
  fabric_received_at?: string | null;
  shipped_at?: string | null;
  client_received_at?: string | null;
  client_marked_paid_at?: string | null;
  status?: string | null;
};

type Milestone = {
  id: string;
  milestone_name?: string | null;
  milestone_order?: number | null;
  status?: string | null;
  submitted_at?: string | null;
  confirmed_at?: string | null;
  artisan_id?: string | null;
  proof_url?: string | null;
  proof_href?: string | null;
};

function CourierOpen({ prompt }: { prompt: string }) {
  return (
    <div className="mt-2">
      <p className="text-xs text-ink/60 mb-2">{prompt}</p>
      <div className="flex flex-wrap gap-2">
        {(["gig", "bolt"] as const).map((c) => (
          <a
            key={c}
            href={COURIER_LINKS[c]}
            target="_blank"
            rel="noreferrer"
            className="text-xs border border-royal text-royal rounded-full px-3 py-1.5"
          >
            {c === "gig" ? "GIG" : "Bolt"}
          </a>
        ))}
      </div>
    </div>
  );
}

function ConfirmCourier({
  action,
  projectId,
  prompt,
}: {
  action: (formData: FormData) => Promise<void>;
  projectId: string;
  prompt: string;
}) {
  return (
    <form action={action} className="mt-3 space-y-2">
      <p className="text-xs text-ink/70">{prompt}</p>
      <div className="flex flex-wrap gap-2 items-center">
        <label className="text-xs text-ink/50">
          <input type="radio" name="courier" value="gig" required className="mr-1" />
          GIG
        </label>
        <label className="text-xs text-ink/50">
          <input type="radio" name="courier" value="bolt" required className="mr-1" />
          Bolt
        </label>
        <input type="hidden" name="projectId" value={projectId} />
        <button
          type="submit"
          className="text-xs bg-royal text-paper rounded-full px-3 py-1.5"
        >
          Confirm
        </button>
      </div>
    </form>
  );
}

export default function ProjectSequence({
  project,
  role,
  milestones = [],
  viewerId,
}: {
  project: Project;
  role: "client" | "artisan" | "admin";
  milestones?: Milestone[];
  viewerId?: string;
}) {
  const ordered = [...milestones].sort(
    (a, b) => (a.milestone_order || 0) - (b.milestone_order || 0)
  );
  const allReviewed =
    ordered.length > 0 && ordered.every((m) => Boolean(m.confirmed_at));
  const workStarted = Boolean(project.fabric_received_at && project.funded_at);

  return (
    <div className="mt-3 pt-3 border-t border-stone">
      <p className="text-xs font-medium mb-2">Project sequence</p>
      <ol className="text-xs text-ink/70 space-y-1 mb-3">
        <li>✓ Start / claim</li>
        <li>{project.fabric_sent_at ? "✓" : "○"} Fabric sent</li>
        <li>{project.fabric_received_at ? "✓" : "○"} Fabric received</li>
        <li>
          {project.funded_at ? "✓" : project.client_marked_paid_at ? "◐" : "○"}{" "}
          Payment held
        </li>
        {ordered.map((m, i) => (
          <li key={m.id}>
            {m.confirmed_at ? "✓" : m.submitted_at ? "◐" : "○"} Milestone {i + 1}
            {m.milestone_name ? ` · ${m.milestone_name}` : ""}
            {m.confirmed_at
              ? " · client reviewed"
              : m.submitted_at
                ? " · waiting for client review"
                : workStarted
                  ? " · send photo when this stage is done"
                  : ""}
          </li>
        ))}
        <li>{project.shipped_at ? "✓" : "○"} Outfit sent (after all reviews)</li>
        <li>
          {project.client_received_at ? "✓" : "○"} Received · artisan paid
        </li>
      </ol>

      {role === "client" && !project.fabric_sent_at && (
        <>
          <CourierOpen prompt="Send fabric through (opens GIG or Bolt — nothing is marked until you confirm)" />
          <ConfirmCourier
            action={clientSendFabric}
            projectId={project.id}
            prompt="Only after the rider has the fabric: I sent it through"
          />
        </>
      )}

      {role === "artisan" &&
        project.fabric_sent_at &&
        !project.fabric_received_at && (
          <form action={artisanConfirmFabric} className="mt-2">
            <input type="hidden" name="projectId" value={project.id} />
            <p className="text-xs text-ink/60 mb-2">
              Confirm only when the fabric is in your hands.
            </p>
            <button
              type="submit"
              className="text-xs bg-royal text-paper rounded-full px-3 py-1.5"
            >
              I received the fabric
            </button>
          </form>
        )}

      {role === "client" &&
        project.fabric_received_at &&
        !project.funded_at && (
          <div>
            <PayProjectButton projectId={project.id} />
            {project.client_marked_paid_at ? (
              <p className="text-xs text-royal-deep mt-3">
                You marked this as paid. Hopayola is checking it, then your
                artisan can start.
              </p>
            ) : (
              <form
                action={clientMarkPaid}
                className="mt-3 pt-3 border-t border-stone"
              >
                <input type="hidden" name="projectId" value={project.id} />
                <p className="text-xs text-ink/55 mb-2">
                  Paid another way, like bank transfer or cash? Tell us here and
                  Hopayola will confirm it.
                </p>
                <div className="flex flex-wrap gap-2">
                  <input
                    name="note"
                    type="text"
                    placeholder="How you paid"
                    className="flex-1 min-w-[150px] border border-stone rounded-lg px-3 py-1.5 text-xs"
                  />
                  <button
                    type="submit"
                    className="text-xs border border-royal text-royal rounded-full px-3 py-1.5 hover:bg-royal hover:text-paper transition-colors"
                  >
                    I have paid
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      {workStarted && (role === "client" || role === "artisan") && (
        <ul className="space-y-3 mb-3 mt-3">
          {ordered.map((m, i) => {
            const mine =
              !m.artisan_id || !viewerId || m.artisan_id === viewerId;
            return (
              <li key={m.id} className="border border-stone rounded-lg p-3">
                <p className="text-xs font-medium">
                  Milestone {i + 1}
                  {m.milestone_name ? ` — ${m.milestone_name}` : ""}
                </p>
                {m.proof_href && (
                  <a
                    href={m.proof_href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.proof_href}
                      alt={`Stage ${i + 1} photo from the artisan`}
                      className="w-40 h-40 object-cover rounded-lg border border-stone"
                    />
                    <span className="block text-[11px] text-royal mt-1">
                      Open the full photo
                    </span>
                  </a>
                )}
                {role === "client" && m.submitted_at && !m.proof_href && (
                  <p className="text-[11px] text-ink/50 mt-1">
                    The artisan sent this stage, but no photo came through. Ask
                    them to send it again before you approve.
                  </p>
                )}
                {role === "artisan" &&
                  mine &&
                  !m.submitted_at &&
                  m.status !== "paid" && (
                    <MilestoneSubmitForm
                      milestoneId={m.id}
                      projectId={project.id}
                    />
                  )}
                {role === "artisan" && !mine && (
                  <p className="text-[11px] text-ink/40 mt-1">
                    Assigned to another artisan
                  </p>
                )}
                {role === "artisan" && m.submitted_at && !m.confirmed_at && (
                  <p className="text-[11px] text-ink/50 mt-1">
                    Waiting for the client to review this stage.
                  </p>
                )}
                {role === "client" && (
                  <MilestoneClientActions
                    milestoneId={m.id}
                    projectId={project.id}
                    status={m.status || ""}
                    confirmedAt={m.confirmed_at}
                    submittedAt={m.submitted_at}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {role === "artisan" &&
        project.fabric_received_at &&
        !project.funded_at && (
          <p className="text-xs text-ink/50 mt-2">
            {project.client_marked_paid_at
              ? "The client says they have paid. Hopayola is confirming it - photos unlock once it is in."
              : "Waiting for the client to pay. Then you can send milestone photos."}
          </p>
        )}

      {role === "client" &&
        project.shipped_at &&
        !project.client_received_at && (
          <form action={clientMarkReceived}>
            <input type="hidden" name="projectId" value={project.id} />
            <button
              type="submit"
              className="text-xs bg-royal text-paper rounded-full px-3 py-1.5 mt-2"
            >
              I received the outfit · complete
            </button>
          </form>
        )}

      {role === "artisan" && allReviewed && !project.shipped_at && (
        <>
          <CourierOpen prompt="Send outfit through (opens GIG or Bolt — mark sent only after it has gone)" />
          <ConfirmCourier
            action={artisanShipProject}
            projectId={project.id}
            prompt="I have sent the outfit through"
          />
        </>
      )}

      {role === "admin" && (
        <p className="text-[11px] text-ink/45">
          Client reviews each milestone before shipping. Payout when received.
        </p>
      )}
    </div>
  );
}
