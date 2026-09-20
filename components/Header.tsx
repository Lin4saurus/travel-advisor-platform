"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Logo from "@/components/Logo";
import { mainNav, quoteCta, siteConfig } from "@/config/site";

const SCROLL_THRESHOLD = 8;
const DESKTOP_QUERY = "(min-width: 1024px)"; // breakpoint `lg`: desde aquí se muestra el menú horizontal

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}
const getScrolled = () => window.scrollY > SCROLL_THRESHOLD;
const getServerScrolled = () => false;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    getScrolled,
    getServerScrolled,
  );
  // El menú móvil guarda la ruta en la que se abrió: si la ruta cambia (link, atrás/adelante) se cierra solo.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Con el menú abierto: sin scroll de fondo, Escape lo cierra y el foco no sale del header.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenedAt(null);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !headerRef.current) return;

      const focusables = Array.from(
        headerRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ),
      ).filter((element) => element.getClientRects().length > 0);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !focusables.includes(active as HTMLElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !focusables.includes(active as HTMLElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Si la ventana llega al ancho de escritorio, el menú móvil deja de tener sentido: se cierra.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpenedAt(null);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const solid = scrolled || open;

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 transition-[background-color,box-shadow] duration-200 ${
        solid
          ? "bg-travel-background shadow-md"
          : "bg-travel-background/80 shadow-none"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link
          href="/"
          aria-label={`${siteConfig.name}, ir al inicio`}
          className="rounded-md"
        >
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-travel-primary ${
                      active
                        ? "text-travel-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-travel-primary"
                        : "text-travel-text"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={quoteCta.href}
            aria-label={quoteCta.label}
            className="inline-flex h-10 items-center rounded-full bg-travel-accent px-3 text-sm font-semibold text-travel-text transition hover:brightness-95 min-[390px]:px-5"
          >
            <span className="min-[390px]:hidden">{quoteCta.shortLabel}</span>
            <span className="hidden min-[390px]:inline">{quoteCta.label}</span>
          </Link>

          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpenedAt(open ? null : pathname)}
            className="inline-flex size-10 items-center justify-center rounded-md text-travel-text hover:bg-travel-surface lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto overscroll-contain bg-travel-background lg:hidden"
      >
        <nav
          aria-label="Principal (móvil)"
          className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6"
        >
          <ul className="flex flex-col gap-1">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpenedAt(null)}
                    className={`block rounded-md border-l-4 px-3 py-3 text-lg ${
                      active
                        ? "border-travel-primary bg-travel-surface font-semibold text-travel-primary"
                        : "border-transparent font-medium text-travel-text hover:bg-travel-surface"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
