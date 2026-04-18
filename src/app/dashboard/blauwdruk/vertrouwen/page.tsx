import { redirect } from "next/navigation";

// Vertrouwen is verplaatst naar "Beste versie" in de Toolkit (Update 4)
export default function VertrouwenRedirect() {
  redirect("/dashboard/toolkit/beste-versie");
}
