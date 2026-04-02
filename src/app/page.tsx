"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const category = localStorage.getItem("pilot-category");
    if (category) {
      router.replace("/dashboard");
    } else {
      router.replace("/start");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1a14]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c9a67a] border-t-transparent" />
    </div>
  );
}
