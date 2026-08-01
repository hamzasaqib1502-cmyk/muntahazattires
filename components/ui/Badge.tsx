import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
};

export function Badge({ children }: BadgeProps) {
  return (
    <span className="inline-flex items-center border border-white/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white/90">
      {children}
    </span>
  );
}
