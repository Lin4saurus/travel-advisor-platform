import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";

// Tarjeta grande del kiosco: toda la tarjeta es el objetivo táctil.
export default function KioskCard({
  href,
  image,
  title,
  subtitle,
  tag,
  footer,
}: {
  href: string;
  image: string;
  title: string;
  subtitle?: string | null;
  tag?: string | null;
  footer?: string | null;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-travel-background shadow-sm ring-1 ring-travel-border transition active:scale-[0.98] active:shadow-none"
    >
      <div className="relative aspect-[4/3]">
        <SafeImage src={image} alt="" label={title} showLabel={false} sizes="(min-width: 1024px) 30vw, 50vw" />
        {tag && (
          <span className="absolute top-3 left-3 rounded-full bg-travel-accent px-3 py-1 text-base font-semibold text-travel-text">
            {tag}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-2xl font-semibold text-travel-primary-dark">{title}</h3>
        {subtitle && <p className="mt-1 text-travel-muted">{subtitle}</p>}
        {footer && <p className="mt-auto pt-4 text-xl font-semibold text-travel-text">{footer}</p>}
      </div>
    </Link>
  );
}
