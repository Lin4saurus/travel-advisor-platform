type PlaceholderPageProps = {
  title: string;
  description?: string;
};

// Página provisional de M0: se reemplaza por la UI real en el milestone de cada sección.
export default function PlaceholderPage({
  title,
  description = "Sección en construcción.",
}: PlaceholderPageProps) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-travel-primary">
        {title}
      </h1>
      <p className="mt-3 text-travel-muted">{description}</p>
    </main>
  );
}
