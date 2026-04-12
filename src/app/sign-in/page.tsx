import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in | Bump & Bundle",
  robots: { index: false, follow: false },
};

// Redirect /sign-in to homepage sign-in card
export default function SignInPage() {
  redirect("/#sign-in");
}
