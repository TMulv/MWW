"use client";

import { useCart, type Mode } from "@/lib/cart";

export default function RequestButton({ mode = { kind: "custom" }, className, children }: {
  mode?: Mode; className?: string; children: React.ReactNode;
}) {
  const { open } = useCart();
  return <button type="button" onClick={() => open(mode)} className={className}>{children}</button>;
}
