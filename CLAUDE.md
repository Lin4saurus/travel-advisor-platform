@AGENTS.md

# CLAUDE.md — Plataforma de Viajes (Mundo Viajero)

Contexto general y persistente del proyecto. El **avance** vive en [TASK.md](TASK.md), no aquí: este archivo describe el quién/qué/cómo; TASK.md dice en qué punto estamos.

## Descripción y objetivo

Plataforma B2C de asesoría, cotización y venta de viajes: destinos, paquetes, experiencias, eventos y cotización personalizada, con panel administrativo. Marca propia **Mundo Viajero** (inspirada en la amplitud funcional de Universal Tours, sin copiar su identidad). Interfaz en español; destinos internacionales y nacionales (Bolivia).

El detalle de alcance (rutas, componentes, criterios de aceptación) está en los milestones de TASK.md.

## Stack y arquitectura

- **Next.js 16.3.5** (App Router, Turbopack por defecto) + **React 19.2.8** + **TypeScript** (`strict`).
- **Tailwind CSS v4** vía `@tailwindcss/postcss`; `app/globals.css` usa `@import "tailwindcss"` y `@theme inline`.
- **ESLint 9** con flat config (`eslint.config.mjs`: `eslint-config-next` core-web-vitals + typescript).
- Fuentes: Geist / Geist Mono con `next/font/google` (definidas en `app/layout.tsx`).
- Estructura: todo en la raíz (no hay `src/`): `app/` (rutas), `components/` (componentes compartidos: `Header` es cliente, `Footer` servidor; `components/ui/` = `SafeImage` y estilos de botón; `components/home/` = secciones propias de la Home; `components/destinations/` = `NationalOverview`, la página de `/destinations/bolivia`), `config/` (`site.ts`: marca, navegación, contacto y redes; `search.ts`: opciones del buscador; `packages.ts`: textos de orden, disponibilidad e "incluye"; todos editables), `lib/` (lógica pura sin React, p. ej. `packages.ts`; se prueba aislada transpilando con el TypeScript del proyecto), `data/` (datos de demostración editables por entidad: `destinations.ts`, `packages.ts`, `experiences.ts`, `events.ts`), `public/images/` (ver M-IMG). Alias de imports: `@/*` → `./*`.
- Tema visual: solo claro (`color-scheme: light`); se eliminó el modo oscuro de la plantilla porque la paleta `--travel-*` es clara. Los tokens y sus reglas de contraste están comentados en `app/globals.css`.
- **Backend: Supabase** (`@supabase/supabase-js` + `@supabase/ssr`). Esquema en `supabase/schema.sql` (+ migraciones en `supabase/migrations/`), clientes en `lib/supabase/`; `/quote` guarda de verdad desde M10. **Auth del panel (M12):** Supabase Auth con correo + contraseña; solo entra quien tenga sesión **y** su correo en `ADMIN_EMAILS` (`.env.local`, separada por comas; vacía = nadie). `proxy.ts` solo refresca la sesión y redirige al login (optimista); la autorización real es `requireAdmin`/`getAdminUser` (`lib/admin/auth.ts`) y se repite en cada página, en cada función de `lib/admin/*` y en cada Server Action. El sitio público no tiene login de visitantes. Las páginas del panel están en `app/admin/(panel)/` (el grupo no sale en la URL; el login queda fuera para no heredar el marco) y ocultan el Header/Footer públicos con `components/HideOnAdmin.tsx`. En `lib/admin/auth.ts`, `createClient()` (que llama a `cookies()`) va **fuera** del `try`: si se atrapa, el build registra un falso `DYNAMIC_SERVER_USAGE`.

## Comandos clave

Verificados el 2026-09-18 (lint y build terminan con exit 0 sobre el boilerplate).

| Acción | Comando |
|---|---|
| Desarrollo | `npm run dev` (http://localhost:3000) |
| Build de producción | `npm run build` (también ejecuta el chequeo de TypeScript) |
| Servir el build | `npm run start` |
| Lint | `npm run lint` (ESLint directo) |
| Tests | **No hay** framework ni script de tests configurado todavía |

`next build` **no** ejecuta lint en Next 16 y `next lint` fue eliminado: correr `npm run lint` y `npm run build` por separado.

**Entorno (Windows):** la herramienta Bash de esta sesión no tiene `git`, `cat`, `grep`, etc. en el PATH; usar PowerShell para git y comandos de terminal. En PowerShell, `node` resuelve a un shim de nvm que no imprime nada: para scripts sueltos usar `C:\nvm4w\nodejs\node.exe`. `Get-Content`/`Set-Content` (PowerShell 5.1) corrompen los acentos de archivos UTF-8: editar con las herramientas Edit/Write, no con reemplazos de texto en PowerShell.

**Probar en un celular:** abrir `npm run dev` por la IP de la red (`http://<IP-de-la-PC>:3000`) exige que el host esté en `allowedDevOrigins` de `next.config.ts` (hoy `192.168.*.*`); si no, Next 16 bloquea los recursos de desarrollo, la página no se hidrata y todo lo interactivo (menú móvil, formularios) parece "muerto" aunque los links funcionen. Es solo de desarrollo; en producción no aplica.

**Bloqueos falsos de PowerShell:** el chequeo de seguridad de la herramienta a veces rechaza comandos largos con el error "Remove-Item on system path …" aunque no borren nada (le pasó a comandos con `-RedirectStandardError`, funciones que envuelven `Start-Process`, o patrones con `|` entre comillas). No se ejecuta nada al bloquearse: dividir en comandos más simples. El Bash de la sesión no tiene `ls`/`grep`: sus `||` de respaldo pueden dar falsos "no existe"; usar Glob/Grep/PowerShell.

**Pruebas en navegador:** no hay framework de tests en el repo; para verificar comportamiento real se usó Edge headless con `puppeteer-core` instalado fuera del proyecto (scratchpad), contra `npm run start`.

## Next.js 16: leer las guías antes de escribir código

Esta versión tiene cambios incompatibles con lo que suele conocerse (ver [AGENTS.md](AGENTS.md)). Las guías están en `node_modules/next/dist/docs/` (p. ej. `01-app/02-guides/upgrading/version-16.md`). Puntos ya confirmados en esa guía:

- `params` y `searchParams` son **asíncronos** (`await props.params`); el acceso síncrono fue eliminado. Existen helpers de tipos globales `PageProps<'/ruta'>`, `LayoutProps<'/ruta'>` y `RouteContext<'/ruta'>` (se generan con `npx next typegen`; `app/layout.tsx` ya usa `LayoutProps<"/">`). Esto aplica a las rutas dinámicas `[slug]` del proyecto.
- `cookies()`, `headers()` y `draftMode()` también son asíncronos.
- `middleware` fue renombrado a **`proxy`** (`proxy.ts`, export `proxy`; runtime Node.js). Relevante para proteger `/admin/*`.
- `next/image` cambió varios defaults (imágenes locales con query string, `minimumCacheTTL`, `imageSizes`, `qualities`, `images.domains` deprecado). Revisar la guía antes de configurar imágenes. La prop `priority` está **deprecada**: para imágenes sobre el pliegue usar `loading="eager"` + `fetchPriority="high"` (así lo hace `SafeImage` con `eager`).
- El optimizador de imágenes guarda versiones en `.next/cache/images` (TTL 4 h) y sigue sirviéndolas aunque se borre el archivo original de `public/`.
- **Rutas `[slug]` del catálogo (desde M12 fase 2):** `export const dynamic = "force-dynamic"` (sin `generateStaticParams`), datos de `getCatalog()` y búsqueda con `slug.toLowerCase()`. Se dejó de prerenderizar porque el panel crea slugs nuevos que deben funcionar sin recompilar; al no haber HTML en disco desaparecen los dos problemas de abajo (verificado: `/destinations/Bolivia`, `/packages/CARTAGENA-CARIBE` y slugs inventados no escriben nada y `bolivia.html` queda en 72 KB). **No volver a `generateStaticParams` + `dynamicParams = false`** sin releer esto. Historia (patrón anterior, sigue valiendo para cualquier ruta prerenderizada): En producción Next resuelve las rutas prerenderizadas sin distinguir mayúsculas; si la página llama a `notFound()` por una variante en mayúsculas (`/destinations/CARTAGENA`), Next **sobrescribe en disco el HTML prerenderizado con la 404** y la página válida queda rota hasta el siguiente build (reproducido). Y sin `dynamicParams = false`, cada slug inventado escribe archivos en `.next/server/app/...`. Con `false` el servidor registra `Error: Internal: NoFallbackError` por slug inexistente: es solo ruido, el estado HTTP es 404. **Rutas estáticas hermanas de un `[slug]` (hoy `/destinations/bolivia`) sufren lo mismo:** `/destinations/Bolivia` llega al `[slug]`, y su `notFound()` sobrescribía `bolivia.html` con el 404 (medido 70 685 → 12 188 bytes). Por eso `app/destinations/[slug]/page.tsx` renderiza la misma página (`NationalOverview`) cuando `slug.toLowerCase()` es `NATIONAL_OVERVIEW_SLUG`. Si se añade otra ruta estática junto a un `[slug]`, hacer lo mismo y probar sus variantes en mayúsculas midiendo el `.html` en `.next/server/app/`.
- `app/not-found.tsx` (404 en español, dentro del layout) atiende tanto `notFound()` como las rutas inexistentes.

Ante cualquier API de Next dudosa, consultar `node_modules/next/dist/docs/` y respetar los avisos de deprecación.

## Convenciones de código y decisiones ya tomadas

Convenciones (derivadas de la configuración actual del repo):

- TypeScript estricto; sin `any` salvo justificación. ESLint debe pasar sin errores.
- Imports con el alias `@/…`.
- Estilos con Tailwind v4; los tokens de diseño van como variables CSS en `:root` con prefijo `--travel-*` (`--travel-primary`, `--travel-accent`, `--travel-teal`…) expuestos vía `@theme`.
- Componentes reutilizables por props (`PackageCard`, `DestinationCard`, `ExperienceCard`, `EventCard`…): no duplicar tarjetas.
- Imágenes con `next/image`, `alt` descriptivo y **fallback visual** (fondo degradado + ícono + nombre); nunca una imagen rota. Se usa siempre `components/ui/SafeImage` (rellena un contenedor `relative` con tamaño). Las 44 fotos de la tabla de M-IMG ya existen en `public/images/`; solo faltan las galerías opcionales (`<slug>/1.jpg …`), y por cada una el servidor registra un error y el navegador un 404: es esperado. **Nunca crear fotos temporales dentro de `public/images/` para probar**: pisarían (y luego borrarían) las fotos reales del usuario; probar la ruta "con foto" con las reales.
- Catálogo de paquetes (`/packages`, `lib/packages.ts`): el estado vive en la URL y se filtra en el servidor (`searchParams`, página dinámica). Parámetros: `destination, region, type, duration, season, board, availability, tag, price_min, price_max, flights, transfers, excursions, date, travelers, budget, sort`; los vacíos se ignoran y los inválidos se descartan al leerlos (`parseQuery`).
- **`null` = dato desconocido: no se afirma ni se niega.** Un filtro u orden solo se ofrece y se aplica si algún paquete tiene ese dato; si no, el criterio queda como "preferencia" (chip punteado) y viaja a la cotización. Las tarjetas solo listan lo confirmado (`includes.x === true`).
- Categorías de listas (experiencias, eventos): componente `components/CategoryNav.tsx` (enlaces con `?category=`, las vacías deshabilitadas); la lógica de cada catálogo vive en `lib/<catálogo>.ts`. Los estados de un evento salen de un catálogo cerrado (`config/events.ts`); los eventos de demostración llevan `isExample: true` ("Ejemplo ilustrativo"). Los botones de consulta llevan a `/quote?package=|experience=|event=<slug>`.
- Listas con tarjetas (`h3`) bajo el `h1`: poner un `<h2 className="sr-only">Resultados</h2>` en medio para no saltar niveles de encabezado (como en `/packages` y `/experiences`). Las categorías de experiencias van en la URL (`/experiences?category=<slug>`) y las que no tienen experiencias se muestran deshabilitadas.
- Cotización (`/quote`): lógica pura en `lib/quote.ts` (estado, `validateStep`/`validateAll`, `buildSummary`; sin importar `data/`, el catálogo llega por parámetro), entrada por URL en `lib/quote-entry.ts` (solo servidor) y opciones editables en `config/quote.ts`. El estado del formulario vive solo en memoria en el navegador (no `localStorage`, no URL: son datos personales); al finalizar el paso 8 **sí se guarda de verdad** en Supabase desde M10 (ver más abajo). Los montos de presupuesto por moneda (`budgetProfiles[].amounts`) están vacíos a propósito: los define el negocio. Los campos se identifican por nombre y su `id` es `quote-<nombre>` (el error con esa clave sale junto al campo). No escribir textos que prometan plazos de respuesta (ninguno está definido).
- **Envío de `/quote` a Supabase (M10):** patrón de dos archivos — `app/quote/actions.ts` (`"use server"`, delgada) delega en `lib/quote-submit.ts` (`server-only`, la capa de datos real), siguiendo la guía de Next ("Using a Data Access Layer for mutations", `node_modules/next/dist/docs/.../data-security.md`). **Nunca confiar en la validación de M9 del lado del cliente:** una Server Action es alcanzable con un POST directo aunque no se use en la UI, así que `lib/quote-submit.ts` reconstruye el `QuoteState` campo por campo desde `unknown` (whitelist de tipos/valores/longitudes) y vuelve a correr `validateAll` antes de insertar; el elemento de catálogo asociado sale siempre de `data/` (nunca de un nombre que mande el cliente). `QuoteStepper` llama a la Server Action con `useTransition` (no `useActionState`: el mismo `<form>` sirve para "Siguiente" en los pasos 1–7 y para el envío real solo en el 8) más un `useRef` como cerrojo síncrono anti-doble-envío. Los errores de Supabase se registran con `console.error` en el servidor y nunca llegan al navegador; el mensaje que ve la persona es siempre uno propio y genérico.
- Objetivos táctiles: botones independientes de al menos 36 px de alto (WCAG 2.2 pide 24); un botón de texto de 20 px ya falló una prueba. Casillas y radios: `size-6` (24 px; con `size-5` la auditoría de M13 los marcó).
- **Enlaces dentro de un párrafo: siempre subrayados** (`underline underline-offset-4 hover:decoration-2`), no solo al pasar el ratón: axe lo marca como "serious" (WCAG 1.4.1, el color solo no basta). El subrayado solo en hover queda para enlaces sueltos (navegación, "Ver todos", migas).
- **SEO (M13):** toda página nueva exporta `metadata = pageMetadata({ title, description, path })` (o `generateMetadata` si depende de datos o de `searchParams`) desde `lib/seo.ts`: pone canónica, Open Graph y Twitter. `path` siempre en minúsculas y sin parámetros; con parámetros (`hasQuery`) → `noindex: true`. La URL absoluta sale de `NEXT_PUBLIC_SITE_URL` (configurarla en producción). Una ruta pública nueva también va en `STATIC_PATHS` de `app/sitemap.ts`.
- Estados especiales: `app/error.tsx` / `app/global-error.tsx` (Next 16.3: la prop es `retry`, no `reset`); una sección de lista sin elementos no se pinta o muestra un aviso con enlace a `/quote`, nunca un título sobre una grilla vacía.
- **Animaciones (ejemplos de UI del usuario):** estilos en `app/globals.css` (`@layer components`: `.timeline*`, `.like-button*`). Siempre mejora progresiva (sin JS o con `prefers-reduced-motion: reduce` todo se ve, sin ocultar nada) y efectos de hover dentro de `@media (hover: hover)`. **Este Windows tiene las animaciones desactivadas: Edge sin ventana informa `reduce`**; para probar una animación con puppeteer, `page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }])`.
- **"Me gusta" (`lib/likes.ts`, `components/LikeButton.tsx`, tabla `catalog_likes`):** el número es siempre el conteo real; si no se puede leer (base caída, tabla sin crear) la página no pinta el botón. Un voto por navegador (cookie httpOnly `mv_visitor`, aleatoria; no es dato personal). La acción recibe el estado deseado (`want`), no un "alternar" ciego, y solo acepta elementos publicados.
- Auditoría de M13 (para repetirla): script `m13-audit.mjs` con puppeteer-core + axe-core instalados en el scratchpad (no en el repo) contra `next start`. Usar `waitUntil: "load"` + pausa corta: con `networkidle0` cada página agotaba el tiempo de espera. Ruido esperado: 304 (caché del navegador) y 400 del optimizador por fotos de galería opcionales inexistentes.
- Cajones/modales: usar `<dialog>` nativo con `showModal()` (foco contenido, Escape, inertiza el fondo); el `<body>` como foco activo mientras se tabula es la interfaz del navegador, no una fuga.
- Sobre fondos oscuros (visor de fotos) el contorno de foco global es el azul primario y casi no se ve: usar `focus-visible:outline-white` en esos botones.
- Contenido de detalle (paquetes): lo específico de cada elemento va en `data/` y, si está vacío, la página dice "se confirma en tu cotización" (no se inventa); lo general y neutro va en `config/packages.ts`. `lib/format.ts` concentra el formato de precio, duración y fecha.
- Los formularios de filtros son GET a la propia página y se pintan dos veces (barra y cajón) con `idPrefix` distinto para no duplicar `id`.
- **Supabase (`lib/supabase/`):** tres clientes, cada uno con un uso distinto.
  - `client.ts` (`"use client"`): clave anónima, para componentes cliente. Instancia nueva por llamada (`createClient()`), no un singleton de módulo.
  - `server.ts`: clave anónima + cookies de sesión, para Server Actions y route handlers (patrón `@supabase/ssr`, respeta RLS). `cookies()` es asíncrono en Next 16, por eso `createClient()` también lo es.
  - `admin.ts`: clave `service_role` (se salta RLS). Importa `"server-only"`, así que el build **falla** si algún componente cliente lo importa, aunque sea indirectamente (verificado: una página `"use client"` que lo importaba rompió `next build` con "'server-only' cannot be imported from a Client Component module"; con el import quitado, build limpio). En uso desde M10 (`lib/quote-submit.ts`, guardar y leer de vuelta la cotización); en M12 lo usará también el panel admin para leer.
  - Las tres claves salen de `process.env`, nunca hardcodeadas; están en `.env.local` (ignorado por git) con los nombres `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Si `SUPABASE_SERVICE_ROLE_KEY` no decodifica como JWT (probarlo: partirla por "." y hacer `atob()` de la primera parte, debe dar `{"alg":"HS256","typ":"JWT"}`), Supabase responde 401 "Invalid API key" a cualquier operación con el cliente admin — pasó una vez con una clave mal copiada del dashboard; se ve como un fallo de guardado, no como un error de configuración obvio.
  - Esquema en `supabase/schema.sql` (pegar en el SQL Editor de Supabase; instrucciones dentro del archivo): tablas `travel_quotes`/`travel_quote_items`, RLS activado en ambas con solo política de INSERT pública (nadie puede leer cotizaciones ajenas hasta que M12 tenga su propia política para personas administradoras). **Trampa de Postgres, ya resuelta:** `INSERT ... RETURNING` obedece las políticas de SELECT, no las de INSERT; como no hay SELECT público, insertar con la clave anónima no deja leer de vuelta el `reference` generado. Por eso `lib/quote-submit.ts` inserta (y lee el resultado) con `lib/supabase/admin.ts`, no con la clave anónima.
  - Tipos en `lib/supabase/types.ts`: `TravelQuote`/`TravelQuoteItem` (camelCase, para el código de la app) y `TravelQuoteRow`/`TravelQuoteItemRow` (snake_case, como las devuelve Supabase) + `Database` (para tipar `.from(...)`). No existía un tipado previo del prompt original de M10 en el repo; se derivaron de `QuoteState` (`lib/quote.ts`, sin modificar) más los campos que pedía el milestone. **El tipo `Database` necesita `Relationships: []` en cada tabla y `Views`/`Functions` (aunque estén vacíos) o TypeScript infiere `never[]` en `.insert(...)` con un error confuso** (`@supabase/postgrest-js` 2.x exige la forma completa de `GenericTable`/`GenericSchema`; reproducido y corregido).
- Carpetas de `app/` que empiezan con `_` son privadas para el enrutador (Next las excluye por completo, ni siquiera compilan): no usarlas para una ruta real ni para una página de prueba que se quiera verificar con `next build`.
- **`/booking-info`, `/terms`, `/privacy` (M11):** contenido real, no placeholders. `importantInfo`/`conditions` (`config/packages.ts`, ya redactados sin cifras ni penalidades desde M5) se reutilizan tal cual en `/terms` vía `components/ui/BulletList.tsx` (compartido con el detalle de paquete: no duplicar ese texto en dos redacciones). El pie de página (`components/Footer.tsx`) tiene una franja condensada de lo mismo en **todo el sitio**, con enlace a `/terms`. `config/payments.ts` (`paymentMethods`) está vacío a propósito — nadie confirmó formas de pago reales — y `components/PaymentMethods.tsx` lo dice en vez de inventar una lista; nunca poner logos de bancos sin autorización. `siteConfig.contact.reservationsEmail` es el "email de reservas" (distinto del `contact.email` general); `components/ContactChannel.tsx` resuelve el canal (reservas → general → `/contact`) y hoy cae siempre a `/contact` porque ninguno de los dos correos está configurado.

Decisiones de producto (fijadas en TASK.md):

- **Marca propia.** No copiar literalmente identidad visual, textos, logos ni fotos de Universal Tours.
- **Precios, fechas y disponibilidad son editables.** Si no están confirmados, mostrar `Consultar precio` / `Consultar fechas` (o `null` en los datos de demostración). Nunca presentar datos inventados como verificables ni eventos/artistas/entradas como confirmados.
- **Sin persistencia simulada.** Si no hay backend, formularios (cotización, newsletter) no fingen guardar datos.
- Sin promesas de tiempos de respuesta si no están definidos; sin logos de bancos hasta tener autorización.
- Textos de contacto, email de reservas, redes, formas de pago y rangos de presupuesto (por país/moneda) son **configurables**, no valores rígidos en el frontend.
- Datos de demostración (paquetes, destinos, experiencias, eventos) en una estructura editable, separada de los componentes.
- **Catálogo en Supabase (M12 fase 2).** Tabla `catalog_items` (`supabase/migrations/m12-catalog.sql`: tabla + RLS de lectura pública solo de lo publicado + semilla generada desde `data/*.ts`): columnas `kind`, `slug` (único por tipo, inmutable tras crear), `status` (`draft`/`published`/`archived`), `sort_order` y `data` JSONB con la forma de los tipos de `data/*.ts`. Los tipos y las categorías siguen en `data/`; los arrays de `data/*.ts` son ahora **semilla y respaldo**, ya no la fuente.
  - Lectura pública: **siempre** `getCatalog()` (`lib/catalog/read.ts`), nunca importar los arrays de `data/` en una página. Usa la clave anónima sin cookies + `unstable_cache` (etiqueta `catalog`, 5 min) + `cache` de React. Si Supabase falla: usa la semilla de `data/` (no cacheada), con tope de 3 s, `.retry(false)` (postgrest-js reintenta los GET 1+2+4 s: medido ~7 s por página con la base caída) y 30 s de pausa antes de reintentar. Las páginas estáticas que lo usan llevan `export const revalidate = 300`.
  - Escritura: `lib/admin/catalog.ts` (service_role, `getAdminUser` en cada función) + `app/admin/catalog-actions.ts`, que tras guardar llaman `updateTag("catalog")` + `revalidatePath("/", "layout")`.
  - Validación: `lib/catalog/normalize.ts` (al leer y al guardar; `null` = desconocido) y `lib/catalog/forms.ts` (definición de campos por tipo, compartida navegador/servidor, `toFormValues`/`parseFormValues`). Fotos solo `/images/...`; sin foto se guarda `PLACEHOLDER_IMAGE` (`/images/sin-foto.jpg`, que **no debe existir**: así `SafeImage` muestra el respaldo). Slugs reservados: `new` (todos) y `bolivia` (destinos).
  - `lib/quote-entry.ts` y `lib/quote-submit.ts` contienen caracteres de control literales en sus regex: Edit/Write los rechazan. Editarlos con un script byte a byte (`latin1`) y escribir lo nuevo como UTF-8 (`Buffer.from(texto, "utf8").toString("latin1")`); si no, el build falla con "invalid utf-8 sequence".
- Las imágenes las descarga el usuario (milestone M-IMG); el código debe funcionar mientras no estén.

Árbol de rutas objetivo: `/`, `/destinations[/slug]` (+ `/destinations/bolivia`, viajes nacionales), `/packages[/slug]`, `/experiences[/slug]`, `/events`, `/about`, `/contact`, `/quote`, `/booking-info`, `/terms`, `/privacy`, más `/admin/*` protegido.

## Reglas de trabajo

1. **Al iniciar cualquier sesión, lee primero [TASK.md](TASK.md) y ubícate en "Foco actual".**
2. **Después de cada avance real** (no de cada mensaje), actualiza TASK.md: cambia el estado del criterio/milestone, actualiza "Última actualización" (fecha y hora) y "Foco actual", y agrega una línea al Changelog. Así siempre se puede abrir TASK.md y leer lo último hecho.
3. **No marques un criterio como `[x]` hasta haberlo verificado** (corriendo el código, `npm run lint` / `npm run build`, tests o comprobación manual). Si está a medias, usa `[>]` y anota qué falta exactamente. Compilar no equivale a "se ve bien": la revisión visual final la confirma el usuario.
4. **La corrección se juzga sobre el último estado del código**, no sobre pasos intermedios.
5. **TASK.md es la fuente de verdad**: si algo se contradice con otra parte (incluido este archivo), gana TASK.md.
6. **Antes de declarar un milestone terminado, haz una auto-revisión rápida** contra fallas comunes:
   - código incompleto o que no corre;
   - afirmar éxito sin verificar;
   - verificación débil (solo el happy path);
   - sobre-implementar cosas no pedidas;
   - romper algo que antes funcionaba (regresiones);
   - desviarse de las instrucciones.
