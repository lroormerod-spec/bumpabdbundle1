import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sleep Guide",
  robots: { index: false, follow: false },
};

const POSITIONS = [
  {
    title: "Left side (recommended)",
    emoji: "⬅️",
    desc: "The safest position for later pregnancy. Improves circulation to your baby and reduces pressure on major blood vessels.",
    recommended: true,
  },
  {
    title: "Right side",
    emoji: "➡️",
    desc: "Also safe, though left is preferred. If you wake on your right side, simply roll back to the left.",
    recommended: false,
  },
  {
    title: "Sleeping on your back",
    emoji: "⬆️",
    desc: "Best avoided after 28 weeks as the weight of your uterus can put pressure on major blood vessels. Short periods are fine.",
    recommended: false,
  },
];

const TIPS = [
  { emoji: "🛏️", tip: "Use a pregnancy pillow between your knees and under your bump for support." },
  { emoji: "🌡️", tip: "Keep your bedroom cool — your body temperature rises during pregnancy." },
  { emoji: "🧘", tip: "Try relaxation techniques or gentle stretching before bed." },
  { emoji: "💧", tip: "Stay hydrated but reduce fluids in the evening to minimise night-time trips." },
  { emoji: "⏰", tip: "Stick to a regular sleep schedule, even on weekends." },
  { emoji: "📱", tip: "Avoid screens for 30–60 minutes before bed to help your body wind down." },
];

export default function SleepGuidePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-1">Sleep guide during pregnancy</h1>
        <p className="text-muted-foreground">Safe sleeping positions and tips for a better night&apos;s rest</p>
      </div>

      {/* Positions */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Sleep positions</h2>
        <div className="space-y-4">
          {POSITIONS.map((pos) => (
            <div
              key={pos.title}
              className={`p-5 rounded-xl border ${
                pos.recommended
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{pos.emoji}</span>
                <h3 className="font-semibold">{pos.title}</h3>
                {pos.recommended && (
                  <span className="ml-auto text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{pos.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Better sleep tips</h2>
        <div className="grid gap-3">
          {TIPS.map((tip) => (
            <div key={tip.tip} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
              <span className="text-xl flex-shrink-0">{tip.emoji}</span>
              <p className="text-sm text-muted-foreground leading-relaxed">{tip.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground border border-border rounded-lg p-4 bg-muted/30">
        <strong>Note:</strong> This information is for general guidance only. Always consult your midwife or doctor if you have concerns about sleep during pregnancy.
      </div>
    </div>
  );
}
