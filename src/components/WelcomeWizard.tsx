"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Search, Share2, Bell, ShoppingBag } from "lucide-react";

interface Props {
  userId: number;
  onComplete: () => void;
}

const STEPS = [
  {
    icon: <Search className="w-10 h-10 text-primary" />,
    title: "Search any product",
    desc: "Search for any baby item and we'll find the best prices across 14 UK retailers — Amazon, John Lewis, Mamas & Papas, and more.",
    emoji: "🔍",
  },
  {
    icon: <ShoppingBag className="w-10 h-10 text-primary" />,
    title: "Build your list",
    desc: "Add items to your registry with one click. Organise by category and see what's most needed.",
    emoji: "🛒",
  },
  {
    icon: <Share2 className="w-10 h-10 text-primary" />,
    title: "Share with loved ones",
    desc: "Get a beautiful shareable link for your registry. Send it via WhatsApp, email, or add it to your invites.",
    emoji: "🔗",
  },
  {
    icon: <Bell className="w-10 h-10 text-primary" />,
    title: "Get price drop alerts",
    desc: "Enable alerts on any item. We'll notify you when the price drops so you can save on the big essentials.",
    emoji: "🔔",
  },
];

export default function WelcomeWizard({ userId, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const currentStep = STEPS[step];

  async function finish() {
    setLoading(true);
    try {
      await fetch(`/api/users/${userId}/onboarded`, { method: "POST" });
    } finally {
      setLoading(false);
      onComplete();
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogTitle className="sr-only">Welcome to Bump & Bundle</DialogTitle>
        <div className="text-center py-4">
          {/* Progress */}
          <div className="mb-6">
            <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-2">Step {step + 1} of {STEPS.length}</p>
          </div>

          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            {currentStep.icon}
          </div>

          {/* Content */}
          <h2 className="text-xl font-bold mb-3">{currentStep.title}</h2>
          <p className="text-muted-foreground leading-relaxed text-sm px-4 mb-8">
            {currentStep.desc}
          </p>

          {/* Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} className="flex-1">
                Next
              </Button>
            ) : (
              <Button onClick={finish} disabled={loading} className="flex-1">
                {loading ? "Getting started..." : "Let's go! 🎉"}
              </Button>
            )}
          </div>
          {step === 0 && (
            <button
              onClick={finish}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground w-full"
            >
              Skip tour
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
