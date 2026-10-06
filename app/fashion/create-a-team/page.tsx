import { redirect } from "next/navigation";

export default function CreateATeam() {
  redirect("/projects/new?tier=premium");
}
