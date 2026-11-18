import type { Metadata } from "next";

// Todo `/admin/*`: fuera de buscadores (además del `X-Robots-Tag` que pone proxy.ts).
export const metadata: Metadata = {
  title: { default: "Panel | Mundo Viajero", template: "%s | Panel Mundo Viajero" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex flex-1 flex-col bg-travel-surface">{children}</div>;
}
