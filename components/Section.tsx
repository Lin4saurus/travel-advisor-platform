import Link from "next/link";
import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  tone?: "default" | "surface" | "sand";
  children: ReactNode;
};

const tones = {
  default: "bg-travel-background",
  surface: "bg-travel-surface",
  sand: "bg-travel-sand",
};

export default function Section({
  id,
  title,
  description,
  action,
  tone = "default",
  children,
}: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={tones[tone]}>
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id={`${id}-title`}
              className="text-2xl font-semibold tracking-tight text-travel-primary-dark sm:text-3xl"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-2 max-w-2xl text-travel-muted">{description}</p>
            )}
          </div>
          {action && (
            <Link
              href={action.href}
              className="rounded-sm text-sm font-semibold text-travel-primary underline-offset-4 hover:underline"
            >
              {action.label} <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
