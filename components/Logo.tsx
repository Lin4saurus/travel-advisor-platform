import { siteConfig } from "@/config/site";

// Logo textual propio + símbolo de brújula (SVG inline, decorativo).
export default function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        viewBox="0 0 32 32"
        className="size-8 shrink-0"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="16"
          cy="16"
          r="14"
          className="fill-none stroke-travel-primary"
          strokeWidth="2"
        />
        <polygon points="16,5 21,16 11,16" className="fill-travel-accent" />
        <polygon points="16,27 11,16 21,16" className="fill-travel-primary" />
        <circle cx="16" cy="16" r="1.8" className="fill-travel-primary-dark" />
      </svg>
      <span className="text-base font-semibold tracking-tight whitespace-nowrap text-travel-primary-dark sm:text-lg">
        {siteConfig.name}
      </span>
    </span>
  );
}
