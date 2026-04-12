"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("t");
    if (!token) {
      router.replace("/");
      return;
    }

    // Set the session cookie via API then redirect
    fetch("/api/auth/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      credentials: "include",
    }).then(res => {
      if (res.ok) {
        router.replace("/app");
      } else {
        router.replace("/");
      }
    }).catch(() => router.replace("/"));
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
}
