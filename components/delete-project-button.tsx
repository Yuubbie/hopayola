"use client";

import { clientCancelProject } from "@/app/actions/project-flow";

export default function DeleteProjectButton({
  projectId,
  className,
  label = "Delete this project",
}: {
  projectId: string;
  className?: string;
  label?: string;
}) {
  return (
    <form
      action={async (formData) => {
        if (
          !window.confirm(
            "Delete this project? You can only do this before payment. This cannot be undone from here."
          )
        ) {
          return;
        }
        await clientCancelProject(formData);
      }}
    >
      <input type="hidden" name="projectId" value={projectId} />
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
