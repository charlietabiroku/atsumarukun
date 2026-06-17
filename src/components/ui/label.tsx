import { ReactNode } from "react";

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-2 block text-sm font-semibold text-foreground">{children}</label>;
}
