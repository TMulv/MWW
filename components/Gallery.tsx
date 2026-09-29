"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Rotate3d, Images } from "lucide-react";
import type { Photo } from "@/lib/catalog";

type View = "photos" | "3d";

export default function Gallery({ name, photos, model }: { name: string; photos: Photo[]; model?: string }) {
  const [idx, setIdx] = useState(0);
  const [view, setView] = useState<View>("photos");
  const n = photos.length;
  const go = (d: number) => setIdx((i) => (i + d + n) % n);

  useEffect(() => {
    if (view === "3d") import("@google/model-viewer");
  }, [view]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (view !== "photos" || n < 2) return;
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % n);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, n]);

  const photo = photos[idx];

  return (
    <div className="min-w-0">
      {model && (
        <div role="tablist" aria-label="View" className="mb-3 inline-flex border border-line p-0.5 text-[14px]">
          {([["photos", "Photos", Images], ["3d", "Spin in 3D", Rotate3d]] as const).map(([v, label, Icon]) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`inline-flex h-9 items-center gap-2 px-3 ${view === v ? "bg-ink text-white" : "hover:bg-frame"}`}
            >
              <Icon size={16} strokeWidth={1.75} aria-hidden /> {label}
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-[4/5] overflow-hidden bg-frame sm:aspect-[5/4] lg:aspect-[4/3.4]">
        {view === "3d" && model ? (
          <model-viewer
            src={model}
            alt={`${name}, 3D model`}
            camera-controls=""
            auto-rotate=""
            auto-rotate-delay="0"
            rotation-per-second="18deg"
            shadow-intensity="0.6"
            exposure="1.05"
            interaction-prompt="none"
            style={{ width: "100%", height: "100%", background: "transparent", ["--progress-bar-height" as string]: "0px" }}
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={photo.src}
              src={photo.src}
              alt={`${name}, photo ${idx + 1} of ${n}`}
              className="absolute inset-0 h-full w-full object-contain"
            />
            {n > 1 && (
              <>
                <button onClick={() => go(-1)} aria-label="Previous photo"
                  className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-white/90 transition-colors hover:bg-white">
                  <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
                </button>
                <button onClick={() => go(1)} aria-label="Next photo"
                  className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-white/90 transition-colors hover:bg-white">
                  <ChevronRight size={20} strokeWidth={1.75} aria-hidden />
                </button>
                <p className="tabular absolute bottom-3 right-3 bg-white/90 px-2 py-1 text-[13px]">
                  {idx + 1} / {n}
                </p>
              </>
            )}
          </>
        )}
      </div>

      {view === "photos" && n > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((p, i) => (
            <button
              key={p.src}
              onClick={() => setIdx(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === idx}
              className={`h-20 w-16 shrink-0 overflow-hidden bg-frame transition-opacity sm:h-24 sm:w-20 ${
                i === idx ? "outline outline-2 outline-offset-2 outline-ink" : "opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumb} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
