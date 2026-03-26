import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}

export function SectionCard({ title, eyebrow, children }: SectionCardProps) {
  return (
    <section className="rounded-[24px] border border-black/5 bg-white/85 p-5 shadow-card backdrop-blur sm:rounded-[28px] sm:p-6">
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.24em] text-rust/80">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 font-serif text-[1.9rem] leading-tight text-ink sm:text-3xl">{title}</h2>
      <div className="mt-5 text-sm text-walnut/80">{children}</div>
    </section>
  );
}
