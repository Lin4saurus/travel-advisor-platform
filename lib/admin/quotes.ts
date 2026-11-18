// Lectura y cambio de estado de cotizaciones para el panel admin (M12). Server-only.
//
// Usa el cliente `service_role` (se salta RLS: no hay política de SELECT/UPDATE pública, ver supabase/schema.sql)
// y por eso CADA función exportada vuelve a exigir un admin con `requireAdmin`/`getAdminUser`, aunque la página que
// la llama ya lo haya hecho: así ninguna llamada nueva puede olvidarse la comprobación.
//
// Los errores de Supabase van a `console.error` y nunca al navegador: las funciones devuelven `null`/`false` y la
// página muestra un mensaje propio.
import "server-only";
import { getAdminUser } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  QUOTE_STATUSES,
  isQuoteStatus,
  type QuoteStatus,
  type TravelQuote,
  type TravelQuoteItem,
  type TravelQuoteItemRow,
  type TravelQuoteRow,
} from "@/lib/supabase/types";

export const QUOTES_PAGE_SIZE = 25;

export function toQuote(row: TravelQuoteRow): TravelQuote {
  return {
    id: row.id,
    reference: row.reference,
    requestType: row.request_type,
    itemSlug: row.item_slug,
    destination: row.destination,
    needsSuggestions: row.needs_suggestions,
    departureDate: row.departure_date,
    returnDate: row.return_date,
    flexibleDates: row.flexible_dates,
    duration: row.duration,
    adults: row.adults,
    children: row.children,
    childrenAges: Array.isArray(row.children_ages) ? row.children_ages : [],
    preferences: row.preferences ?? [],
    services: row.services ?? [],
    notes: row.notes,
    budgetProfile: row.budget_profile,
    budgetTier: row.budget_tier,
    budgetAmount: row.budget_amount === null ? null : Number(row.budget_amount),
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    contactMethod: row.contact_method,
    acceptPrivacy: row.accept_privacy,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toItem(row: TravelQuoteItemRow): TravelQuoteItem {
  return {
    id: row.id,
    quoteId: row.quote_id,
    itemType: row.item_type,
    itemSlug: row.item_slug,
    itemName: row.item_name,
    createdAt: row.created_at,
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

// Texto de búsqueda seguro para un filtro `or(...)` de PostgREST: allí la coma, los paréntesis, el punto y el `*`
// tienen significado, así que solo se dejan letras (con acentos), números, espacios, `@`, `-` y `_`.
export function cleanSearch(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}@ _-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export type QuoteListFilters = { status?: QuoteStatus; search?: string; page?: number };

export type QuoteList = { quotes: TravelQuote[]; total: number; page: number; pageCount: number };

export async function listQuotes(filters: QuoteListFilters): Promise<QuoteList | null> {
  if (!(await getAdminUser())) return null;
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const from = (page - 1) * QUOTES_PAGE_SIZE;

  try {
    let query = createAdminClient()
      .from("travel_quotes")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + QUOTES_PAGE_SIZE - 1);

    if (filters.status) query = query.eq("status", filters.status);
    const search = cleanSearch(filters.search);
    if (search) {
      const pattern = `%${search}%`;
      query = query.or(
        `reference.ilike.${pattern},contact_name.ilike.${pattern},contact_email.ilike.${pattern},destination.ilike.${pattern}`,
      );
    }

    const { data, error, count } = await query;
    if (error) {
      // PostgREST responde 416 (código PGRST103) si se pide una página más allá del final: no es un error real.
      if (error.code === "PGRST103") return { quotes: [], total: count ?? 0, page, pageCount: 0 };
      console.error("[admin-quotes] no se pudo listar:", error);
      return null;
    }
    const total = count ?? 0;
    return {
      quotes: (data ?? []).map(toQuote),
      total,
      page,
      pageCount: Math.ceil(total / QUOTES_PAGE_SIZE),
    };
  } catch (error) {
    console.error("[admin-quotes] error inesperado al listar:", error);
    return null;
  }
}

export async function getQuote(id: string): Promise<{ quote: TravelQuote; items: TravelQuoteItem[] } | null> {
  if (!isUuid(id) || !(await getAdminUser())) return null;
  try {
    const admin = createAdminClient();
    const [quoteResult, itemsResult] = await Promise.all([
      admin.from("travel_quotes").select("*").eq("id", id).maybeSingle(),
      admin.from("travel_quote_items").select("*").eq("quote_id", id).order("created_at"),
    ]);
    if (quoteResult.error) console.error("[admin-quotes] no se pudo leer la cotización:", quoteResult.error);
    if (itemsResult.error) console.error("[admin-quotes] no se pudieron leer los ítems:", itemsResult.error);
    if (!quoteResult.data) return null;
    return { quote: toQuote(quoteResult.data), items: (itemsResult.data ?? []).map(toItem) };
  } catch (error) {
    console.error("[admin-quotes] error inesperado al leer:", error);
    return null;
  }
}

export type StatusCounts = Record<QuoteStatus, number> & { total: number };

// Un `count` por estado (consultas `head`, sin traer filas), en paralelo.
export async function countQuotesByStatus(): Promise<StatusCounts | null> {
  if (!(await getAdminUser())) return null;
  try {
    const admin = createAdminClient();
    const results = await Promise.all(
      QUOTE_STATUSES.map((status) =>
        admin.from("travel_quotes").select("id", { count: "exact", head: true }).eq("status", status),
      ),
    );
    const failed = results.find((result) => result.error);
    if (failed) {
      console.error("[admin-quotes] no se pudieron contar:", failed.error);
      return null;
    }
    const counts = { total: 0 } as StatusCounts;
    QUOTE_STATUSES.forEach((status, index) => {
      counts[status] = results[index].count ?? 0;
      counts.total += counts[status];
    });
    return counts;
  } catch (error) {
    console.error("[admin-quotes] error inesperado al contar:", error);
    return null;
  }
}

export async function recentQuotes(limit = 5): Promise<TravelQuote[] | null> {
  const list = await listQuotes({ page: 1 });
  return list ? list.quotes.slice(0, limit) : null;
}

export async function updateQuoteStatus(id: unknown, status: unknown): Promise<boolean> {
  if (!isUuid(id) || !isQuoteStatus(status) || !(await getAdminUser())) return false;
  try {
    const { data, error } = await createAdminClient()
      .from("travel_quotes")
      .update({ status })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      console.error("[admin-quotes] no se pudo cambiar el estado:", error ?? "cotización inexistente");
      return false;
    }
    return true;
  } catch (error) {
    console.error("[admin-quotes] error inesperado al cambiar el estado:", error);
    return false;
  }
}
