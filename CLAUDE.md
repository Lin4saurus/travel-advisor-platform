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
- **Backend / auth / panel admin: aún no existen en el repo.** TASK.md los menciona como "Supabase u origen de datos" y como "patrón de auth existente"; hasta que se decida y se implemente, no asumir que hay backend (ver decisiones más abajo).

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
- **Rutas `[slug]` (patrón de `app/destinations/[slug]/page.tsx` y `app/packages/[slug]/page.tsx`; repetir en experiencias):** `generateStaticParams` + `export const dynamicParams = false` y buscar con `slug.toLowerCase()`. En producción Next resuelve las rutas prerenderizadas sin distinguir mayúsculas; si la página llama a `notFound()` por una variante en mayúsculas (`/destinations/CARTAGENA`), Next **sobrescribe en disco el HTML prerenderizado con la 404** y la página válida queda rota hasta el siguiente build (reproducido). Y sin `dynamicParams = false`, cada slug inventado escribe archivos en `.next/server/app/...`. Con `false` el servidor registra `Error: Internal: NoFallbackError` por slug inexistente: es solo ruido, el estado HTTP es 404. **Rutas estáticas hermanas de un `[slug]` (hoy `/destinations/bolivia`) sufren lo mismo:** `/destinations/Bolivia` llega al `[slug]`, y su `notFound()` sobrescribía `bolivia.html` con el 404 (medido 70 685 → 12 188 bytes). Por eso `app/destinations/[slug]/page.tsx` renderiza la misma página (`NationalOverview`) cuando `slug.toLowerCase()` es `NATIONAL_OVERVIEW_SLUG`. Si se añade otra ruta estática junto a un `[slug]`, hacer lo mismo y probar sus variantes en mayúsculas midiendo el `.html` en `.next/server/app/`.
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
- Cotización (`/quote`): lógica pura en `lib/quote.ts` (estado, `validateStep`/`validateAll`, `buildSummary`; sin importar `data/`, el catálogo llega por parámetro), entrada por URL en `lib/quote-entry.ts` (solo servidor) y opciones editables en `config/quote.ts`. El estado del formulario vive solo en memoria (no `localStorage`, no URL: son datos personales) y **no hay envío ni guardado** hasta M10; no escribir textos que prometan lo contrario ni plazos. Los montos de presupuesto por moneda (`budgetProfiles[].amounts`) están vacíos a propósito: los define el negocio. Los campos se identifican por nombre y su `id` es `quote-<nombre>` (el error con esa clave sale junto al campo).
- Objetivos táctiles: botones independientes de al menos 36 px de alto (WCAG 2.2 pide 24); un botón de texto de 20 px ya falló una prueba.
- Cajones/modales: usar `<dialog>` nativo con `showModal()` (foco contenido, Escape, inertiza el fondo); el `<body>` como foco activo mientras se tabula es la interfaz del navegador, no una fuga.
- Sobre fondos oscuros (visor de fotos) el contorno de foco global es el azul primario y casi no se ve: usar `focus-visible:outline-white` en esos botones.
- Contenido de detalle (paquetes): lo específico de cada elemento va en `data/` y, si está vacío, la página dice "se confirma en tu cotización" (no se inventa); lo general y neutro va en `config/packages.ts`. `lib/format.ts` concentra el formato de precio, duración y fecha.
- Los formularios de filtros son GET a la propia página y se pintan dos veces (barra y cajón) con `idPrefix` distinto para no duplicar `id`.

Decisiones de producto (fijadas en TASK.md):

- **Marca propia.** No copiar literalmente identidad visual, textos, logos ni fotos de Universal Tours.
- **Precios, fechas y disponibilidad son editables.** Si no están confirmados, mostrar `Consultar precio` / `Consultar fechas` (o `null` en los datos de demostración). Nunca presentar datos inventados como verificables ni eventos/artistas/entradas como confirmados.
- **Sin persistencia simulada.** Si no hay backend, formularios (cotización, newsletter) no fingen guardar datos.
- Sin promesas de tiempos de respuesta si no están definidos; sin logos de bancos hasta tener autorización.
- Textos de contacto, email de reservas, redes, formas de pago y rangos de presupuesto (por país/moneda) son **configurables**, no valores rígidos en el frontend.
- Datos de demostración (paquetes, destinos, experiencias, eventos) en una estructura editable, separada de los componentes.
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
