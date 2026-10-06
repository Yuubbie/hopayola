"use client";

import {
  artisanConfirmFabric,
  artisanRequestReview,
  artisanShipProject,
  clientMarkReceived,
  clientMarkReviewed,
  clientSendFabric,
  COURIER_LINKS,
} from "@/app/actions/project-flow";
import PayProjectButton from "@/components/pay-project-button";

type Project = {
  id: string;
  funded_at?: string | null;
  fabric_sent_at?: string | null;
  fabric_courier?: string | null;
  fabric_received_at?: string | null;
  client_reviewed_at?: string | null;
  shipped_at?: string | null;
  shipped_courier?: string | null;
  client_received_at?: string | null;
  status?: string | null;
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
          onSubmit={() => window.open(COURIER_LINKS[c], "_blank")}
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
}: {
  project: Project;
  role: "client" | "artisan" | "admin";
}) {
  const steps =
    role === "client"
      ? [
          { done: true, label: "Start a project" },
          { done: Boolean(project.fabric_sent_at), label: "Fabric sent (GIG / Bolt)" },
          { done: Boolean(project.fabric_received_at), label: "Artisan has fabric" },
          { done: Boolean(project.funded_at), label: "Payment held by Hopayola" },
          { done: Boolean(project.client_reviewed_at), label: "Project reviewed" },
          { done: Boolean(project.shipped_at), label: "Outfit sent" },
          { done: Boolean(project.client_received_at), label: "Received · completed" },
        ]
      : role === "artisan"
        ? [
            { done: true, label: "Claim project" },
            { done: Boolean(project.fabric_received_at), label: "Fabric received" },
            { done: Boolean(project.funded_at), label: "Client paid (held)" },
            { done: project.status === "milestone_review" || Boolean(project.client_reviewed_at), label: "Put up for review" },
            { done: Boolean(project.client_reviewed_at), label: "Client reviewed" },
            { done: Boolean(project.shipped_at), label: "Sent to client" },
            { done: Boolean(project.client_received_at), label: "Completed · payout" },
          ]
        : [
            { done: Boolean(project.fabric_received_at), label: "Fabric confirmed" },
            { done: Boolean(project.funded_at), label: "Payment received (held)" },
            { done: Boolean(project.client_reviewed_at), label: "Client review" },
            { done: Boolean(project.client_received_at), label: "Completion · artisan paid" },
          ];

  return (
    <div className="mt-3 pt-3 border-t border-stone">
      <p className="text-xs font-medium mb-2">Project sequence</p>
      <ol className="text-xs text-ink/70 space-y-1 mb-3">
        {steps.map((s) => (
          <li key={s.label}>
            {s.done ? "✓" : "○"} {s.label}
          </li>
        ))}
      </ol>

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
        project.status === "milestone_review" &&
        !project.client_reviewed_at && (
          <form action={clientMarkReviewed}>
            <input type="hidden" name="projectId" value={project.id} />
            <button
              type="submit"
              className="text-xs bg-royal text-paper rounded-full px-3 py-1.5 mt-2"
            >
              Mark as reviewed
            </button>
          </form>
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

      {role === "artisan" &&
        project.funded_at &&
        project.status !== "milestone_review" &&
        !project.client_reviewed_at && (
          <form action={artisanRequestReview}>
            <input type="hidden" name="projectId" value={project.id} />
            <button
              type="submit"
              className="text-xs border border-royal text-royal rounded-full px-3 py-1.5 mt-2"
            >
              Send to client for review
            </button>
          </form>
        )}

      {role === "artisan" &&
        project.client_reviewed_at &&
        !project.shipped_at && (
          <CourierForms
            action={artisanShipProject}
            projectId={project.id}
            label="I sent the outfit"
          />
        )}

      {role === "admin" && (
        <p className="text-[11px] text-ink/45">
          Supervise in chat. Client pays after fabric is received. Artisan is
          paid when the client marks received.
        </p>
      )}
    </div>
  );
}
