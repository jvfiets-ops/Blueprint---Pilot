import { redirect } from "next/navigation";

export default function Home() {
  // Middleware handles auth — if user reaches here, they're authenticated
  redirect("/dashboard/reflectie");
}
