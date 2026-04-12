"use client";

import type { Metadata } from "next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";
import { toast } from "sonner";

const CHECKLIST = {
  "For Mum": [
    "Nightgown or pyjamas (front-opening if breastfeeding)",
    "Dressing gown",
    "Comfortable slippers",
    "Maternity bra & nursing pads",
    "Disposable underwear (5–10 pairs)",
    "Maternity pads (2 packs)",
    "Toiletries (travel sized)",
    "Hair ties and headband",
    "Phone charger",
    "Snacks and drinks for labour",
    "TENS machine (optional)",
    "Pillow from home",
    "Glasses/contacts and solution",
    "Insurance & ID documents",
    "Birth plan copies",
  ],
  "For Baby": [
    "Newborn & 0-3 month sleepsuits (3-4)",
    "Bodysuits/vests (3-4)",
    "Scratch mittens",
    "Newborn hat",
    "Cardigan or warm layer",
    "Nappies (newborn size, half a pack)",
    "Cotton wool or baby wipes",
    "Muslin cloths (3-4)",
    "Baby blanket",
    "Snowsuit or warm outfit (if winter)",
    "Car seat (must have before leaving hospital)",
  ],
  "For Partner/Support": [
    "Change of clothes",
    "Snacks and drinks",
    "Camera or phone with space",
    "Charger",
    "Cash for car park",
    "Entertainment (book, tablet)",
    "Pillow",
  ],
  "Going Home": [
    "Comfortable outfit to go home in",
    "Car seat installed and checked",
    "Moses basket or crib set up at home",
    "Muslin cloths and changing mat",
    "Enough nappies and wipes at home",
  ],
};

export default function ChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const allItems = Object.values(CHECKLIST).flat();
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const pct = allItems.length > 0 ? (checkedCount / allItems.length) * 100 : 0;

  function toggle(key: string) {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Hospital bag checklist</h1>
        <p className="text-muted-foreground">Pack from 36 weeks — just in case!</p>
      </div>

      {/* Progress */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">{checkedCount} of {allItems.length} packed</span>
          <span className="text-muted-foreground">{Math.round(pct)}%</span>
        </div>
        <Progress value={pct} className="h-2.5" />
        {pct === 100 && (
          <p className="text-green-600 font-medium text-sm mt-2">✓ All packed — you&apos;re ready!</p>
        )}
      </div>

      {/* Sections */}
      {Object.entries(CHECKLIST).map(([section, sectionItems]) => {
        const sectionChecked = sectionItems.filter(item => checked[`${section}::${item}`]).length;
        return (
          <div key={section}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">{section}</h2>
              <Badge variant="secondary">{sectionChecked}/{sectionItems.length}</Badge>
            </div>
            <div className="space-y-2">
              {sectionItems.map((item) => {
                const key = `${section}::${item}`;
                const isChecked = checked[key] || false;
                return (
                  <button
                    key={item}
                    onClick={() => toggle(key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      isChecked
                        ? "bg-primary/5 border-primary/30 opacity-70"
                        : "bg-card border-border hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    {isChecked ? (
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={`text-sm ${isChecked ? "line-through text-muted-foreground" : ""}`}>
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
