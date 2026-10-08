"use client";

import {
  artisanConfirmFabric,
  artisanShipProject,
  clientMarkReceived,
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
};

function CourierForms({
  action,
  projectId,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  projectId: string;
  label: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {(["gig", "bolt"] as const).map((c) => (
        <form
          key={c}
          action={action}
          onSubmit={() => {
            window.open(COURIER_LINKS[c], "_blank", "noopener,noreferrer");
          }}
        >
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="courier" value={c} />
          <button
            type="submit"
            className="text-xs bg-royal text-paper rounded-full px-3 py-1.5"
          >
            {label} via {c.toUpperCase()}
          </button>
        </form>
      ))}
    </div>
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

  return (
    <div className="mt-3 pt-3 border-t border-stone">
      <p className="text-xs font-medium mb-2">Project sequence</p>
      <ol className="text-xs text-ink/70 space-y-1 mb-3">
        <li>{true ? "✓" : "○"} Start / claim</li>
        <li>
          {project.fabric_sent_at ? "✓" : "○"} Fabric sent
        </li>
        <li>
          {project.fabric_received_at ? "✓" : "○"} Fabric received
        </li>
        <li>{project.funded_at ? "✓" : "○"} Payment held</li>
        {ordered.map((m, i) => (
          <li key={m.id}>
            {m.confirmed_at ? "✓" : m.submitted_at ? "◐" : "○"} Milestone {i + 1}
            {m.milestone_name ? ` · ${m.milestone_name}` : ""}
            {m.confirmed_at
              ? " · reviewed"
              : m.submitted_at
                ? " · awaiting client"
                : ""}
          </li>
        ))}
        <li>{project.shipped_at ? "✓" : "○"} Outfit sent (after all reviews)</li>
        <li>
          {project.client_received_at ? "✓" : "○"} Received · artisan paid
        </li>
      </ol>

      {ordered.length > 0 && (role === "client" || role === "artisan") && (
        <ul className="space-y-3 mb-3">
          {ordered.map((m, i) => {
            const mine =
              !m.artisan_id || !viewerId || m.artisan_id === viewerId;
            return (
              <li key={m.id} className="border border-stone rounded-lg p-3">
                <p className="text-xs font-medium">
                  Milestone {i + 1}
                  {m.milestone_name ? ` — ${m.milestone_name}` : ""}
                </p>
                {role === "artisan" &&
                  project.funded_at &&
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

      {role === "client" && !project.fabric_sent_at && (
        <CourierForms
          action={clientSendFabric}
          projectId={project.id}
          label="I sent fabric"
        />
      )}

      {role === "client" &&
        project.fabric_received_at &&
        !project.funded_at && <PayProjectButton projectId={project.id} />}

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

      {role === "artisan" &&
        project.fabric_sent_at &&
        !project.fabric_received_at && (
          <form action={artisanConfirmFabric}>
            <input type="hidden" name="projectId" value={project.id} />
            <button
              type="submit"
              className="text-xs bg-royal text-paper rounded-full px-3 py-1.5"
            >
              Confirm fabric received
            </button>
          </form>
        )}

      {role === "artisan" && allReviewed && !project.shipped_at && (
        <CourierForms
          action={artisanShipProject}
          projectId={project.id}
          label="I sent the outfit"
        />
      )}

      {role === "admin" && (
        <p className="text-[11px] text-ink/45">
          Assign a different artisan per milestone if needed (premium / extra
          hands). Client reviews each milestone before shipping. Payout when
          received.
        </p>
      )}
    </div>
  );
}
