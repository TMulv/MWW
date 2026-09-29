"use client";

import { Minus, Plus } from "lucide-react";

export default function QtyStepper({ value, onChange, label, size = "sm" }: {
  value: number; onChange: (n: number) => void; label: string; size?: "sm" | "lg";
}) {
  const box = size === "lg" ? "h-13 w-12" : "h-9 w-9";
  return (
    <div className="inline-flex items-center border border-[#cfcbc4]">
      <button type="button" aria-label={`Fewer ${label}`} disabled={value <= 1} onClick={() => onChange(value - 1)}
        className={`grid ${box} place-items-center hover:bg-frame disabled:opacity-30`}>
        <Minus size={15} strokeWidth={1.75} aria-hidden />
      </button>
      <span className="tabular w-8 text-center text-[15px]" aria-live="polite">{value}</span>
      <button type="button" aria-label={`More ${label}`} onClick={() => onChange(value + 1)}
        className={`grid ${box} place-items-center hover:bg-frame`}>
        <Plus size={15} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}
