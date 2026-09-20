import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import type { TravelCategory } from "@/data/categories";

export default function CategoryCard({ category }: { category: TravelCategory }) {
  return (
    <Link
      href={`/packages?type=${category.slug}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-2xl"
    >
      {/* Decorativa: el nombre de la categoría está en el texto del enlace. */}
      <SafeImage
        src={category.image}
        alt=""
        label={category.name}
        showLabel={false}
        sizes="(min-width: 1024px) 25vw, 50vw"
        className="transition-transform duration-300 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 p-4 text-base font-semibold text-white sm:text-lg">
        {category.name}
      </span>
    </Link>
  );
}
