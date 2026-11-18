// Tipos de la base de datos de Supabase. Reflejan `supabase/schema.sql`: si el esquema cambia, actualizar este
// archivo también (no hay generación automática todavía; se podría incorporar `supabase gen types typescript`
// más adelante si el proyecto usa la CLI de Supabase).
//
// `TravelQuote` y `TravelQuoteItem` no existían en el repo (TASK.md los menciona "según el tipado del prompt",
// pero ese prompt no está en el código). Se definieron aquí a partir del estado real del formulario de M9
// (`QuoteState` en `lib/quote.ts`) más los campos que pidió el milestone (referencia, estado, fechas de auditoría).
// `lib/quote.ts` no se modificó: la futura Server Action de M10 es quien traduce `QuoteState` a estas filas.

export type QuoteRequestType = "a-medida" | "paquete" | "experiencia" | "evento";
export type QuoteItemType = "paquete" | "experiencia" | "evento";

// Flujo de una cotización en el panel admin (M12), en orden; toda cotización nace 'Nueva'. Debe coincidir con el
// `check` de `travel_quotes.status` en `supabase/schema.sql` (y `supabase/migrations/m12-quote-statuses.sql`).
export const QUOTE_STATUSES = [
  "Nueva",
  "En revisión",
  "Contactado",
  "Propuesta enviada",
  "Confirmada",
  "Cerrada",
  "Cancelada",
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export function isQuoteStatus(value: unknown): value is QuoteStatus {
  return typeof value === "string" && (QUOTE_STATUSES as readonly string[]).includes(value);
}

export type TravelQuote = {
  id: string;
  // Número de solicitud visible para la persona (p. ej. "TV-2026-0001"), lo genera la base de datos.
  reference: string;
  requestType: QuoteRequestType;
  // Slug del paquete/experiencia/evento elegido (null = viaje a medida o sin elegir todavía).
  itemSlug: string | null;
  destination: string | null;
  needsSuggestions: boolean;
  departureDate: string | null; // AAAA-MM-DD
  returnDate: string | null; // AAAA-MM-DD
  flexibleDates: boolean;
  duration: string | null;
  adults: number;
  children: number;
  childrenAges: number[];
  // Slugs de `data/categories.ts` elegidos en el paso "Preferencias" (`QuoteState.types`).
  preferences: string[];
  // Valores de `config/quote.ts` (`serviceOptions`): "flights" | "transfers" | "excursions".
  services: string[];
  notes: string | null;
  // Id de `config/quote.ts` (`budgetProfiles`), p. ej. "bolivia" | "internacional".
  budgetProfile: string | null;
  // Rango de `config/search.ts` (`budgetOptions`); es el "budgetLevel" del pedido original.
  budgetTier: string | null;
  budgetAmount: number | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactMethod: string;
  acceptPrivacy: boolean;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
};

// Un elemento del catálogo asociado a la cotización. Hoy el formulario de M9 permite elegir uno (`itemSlug` en
// `TravelQuote`); esta tabla queda lista para cuando una cotización pueda pedir varios (p. ej. un paquete +
// una experiencia adicional). Guarda una copia del nombre porque el catálogo vive en código (`data/`), no en la
// base de datos, y podría cambiar o desaparecer después de creada la cotización.
export type TravelQuoteItem = {
  id: string;
  quoteId: string;
  itemType: QuoteItemType;
  itemSlug: string;
  itemName: string;
  createdAt: string;
};

// Filas tal como las entrega Supabase (snake_case), antes de convertirlas a los tipos de arriba.
export type TravelQuoteRow = {
  id: string;
  reference: string;
  request_type: QuoteRequestType;
  item_slug: string | null;
  destination: string | null;
  needs_suggestions: boolean;
  departure_date: string | null;
  return_date: string | null;
  flexible_dates: boolean;
  duration: string | null;
  adults: number;
  children: number;
  children_ages: number[];
  preferences: string[];
  services: string[];
  notes: string | null;
  budget_profile: string | null;
  budget_tier: string | null;
  budget_amount: number | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_method: string;
  accept_privacy: boolean;
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
};

export type TravelQuoteItemRow = {
  id: string;
  quote_id: string;
  item_type: QuoteItemType;
  item_slug: string;
  item_name: string;
  created_at: string;
};

type TravelQuoteInsert = Omit<
  TravelQuoteRow,
  "id" | "reference" | "status" | "created_at" | "updated_at"
> &
  Partial<Pick<TravelQuoteRow, "status">>;

type TravelQuoteItemInsert = Omit<TravelQuoteItemRow, "id" | "created_at">;

// Catálogo editable (M12 fase 2, `supabase/migrations/m12-catalog.sql`). `data` es JSONB con la forma de los
// tipos de `data/*.ts`; se valida con `lib/catalog/normalize.ts` al leer y al guardar.
export type CatalogStatus = "draft" | "published" | "archived";

export type CatalogItemRow = {
  id: string;
  kind: "packages" | "destinations" | "experiences" | "events";
  slug: string;
  status: CatalogStatus;
  sort_order: number;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type CatalogItemInsert = Omit<CatalogItemRow, "id" | "created_at" | "updated_at">;

// Forma mínima que espera `@supabase/supabase-js`/`@supabase/ssr` para tipar `.from(...)`. `Relationships` (y
// `Views`/`Functions` del esquema) son obligatorios para el tipo `GenericTable`/`GenericSchema` interno del
// paquete aunque acá no se use ningún `.select()` con relaciones embebidas; se dejan vacíos porque no hay ninguna
// definida todavía (`travel_quote_items.quote_id` es una FK real en `supabase/schema.sql`, pero modelarla acá
// solo hace falta si en algún momento se usa `.select("*, travel_quotes(...)")`).
export type CatalogLikeRow = {
  kind: "packages" | "experiences";
  slug: string;
  visitor_id: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      travel_quotes: {
        Row: TravelQuoteRow;
        Insert: TravelQuoteInsert;
        Update: Partial<TravelQuoteRow>;
        Relationships: [];
      };
      travel_quote_items: {
        Row: TravelQuoteItemRow;
        Insert: TravelQuoteItemInsert;
        Update: Partial<TravelQuoteItemRow>;
        Relationships: [];
      };
      catalog_items: {
        Row: CatalogItemRow;
        Insert: CatalogItemInsert;
        Update: Partial<CatalogItemInsert>;
        Relationships: [];
      };
      // "Me gusta" (supabase/migrations/m14-likes.sql).
      catalog_likes: {
        Row: CatalogLikeRow;
        Insert: Omit<CatalogLikeRow, "created_at">;
        Update: Partial<CatalogLikeRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
