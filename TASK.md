# TASK.md — Plataforma de Viajes (Universal Tours)

**Objetivo actual:** Construir una plataforma B2C de asesoría, cotización y venta de viajes (destinos, paquetes, experiencias, eventos y cotización personalizada) con panel administrativo, para Universal Tours (marca autorizada por el usuario el 2026-11-18; antes "Mundo Viajero").

**Última actualización:** 2026-11-18 (UTC-4)

**Foco actual:** M13 implementado: SEO completo, `/about` y `/contact` reales, páginas de error, catálogo vacío, cabeceras de seguridad; auditoría automática 643/643. Todo el código de M0–M13 está escrito. **Bloqueo:** el proyecto de Supabase de `.env.local` ya no existe (su dominio no resuelve): sin él no se puede probar el panel con sesión, `/quote` no guarda y el sitio muestra el catálogo de respaldo de `data/`. Pasos en M12 → "Pasos tuyos". **Pendiente tuyo:** revisión visual de M11 y M13 en los 3 tamaños, y `NEXT_PUBLIC_SITE_URL` al publicar.

---

## Leyenda de estados

- `[ ]` no iniciado
- `[>]` en progreso / parcial (falta algo para llegar al 100%)
- `[x]` completado y verificado

---

> Las reglas de trabajo (cómo se actualiza este archivo, cuándo marcar `[x]`, auto-revisión) están en [CLAUDE.md](CLAUDE.md), sección "Reglas de trabajo".

---

## Milestones

### M0 — Fundaciones del proyecto `[x]`
Base técnica antes de escribir UI de negocio.
- `[x]` Inspeccionar stack existente (framework, Supabase, panel admin, patrón de auth, cómo están hechos los formularios y componentes actuales).
  - Resultado (2026-09-18): boilerplate limpio de `create-next-app` — Next 16.3.5 (App Router, Turbopack), React 19.2.8, TypeScript estricto, Tailwind v4, ESLint 9. Solo existe la ruta `/` (plantilla) y `/_not-found`. **No hay** Supabase, panel admin, auth, formularios, componentes propios ni tests.
- `[x]` Definir tokens de diseño en `:root` con la paleta acordada (`--travel-primary`, `--travel-accent`, `--travel-teal`, etc.).
  - Los 14 tokens `--travel-*` están en `:root` de `app/globals.css` y expuestos vía `@theme inline` (`bg-/text-/border-travel-*`). Verificado en el CSS compilado: los 14 `:root` y las utilidades `bg-travel-*` de los 14 se generan.
  - Ajustes por contraste WCAG AA (4.5:1) sobre background/surface/sand: `muted` #68758A→#647084, `success` #218739→#1F8036, `warning` #C17C00→#9B6400. `accent` y `teal` se dejaron como en la paleta: sobre `accent` usar texto `--travel-text` (blanco da 2.1:1); `teal` (3.3:1) solo para íconos, fondos decorativos y texto grande. Reglas comentadas en `globals.css`.
  - Se eliminó el bloque de modo oscuro de la plantilla (la paleta es solo clara; `color-scheme: light`). Reversible si se decide soportar dark.
- `[x]` Configurar la tipografía global sin romper la existente.
  - Se quitó `font-family: Arial` de `body`. Verificado en el CSS compilado: `body` sin `font-family` y `--default-font-family: var(--font-geist-sans)` (Geist, cargada en `layout.tsx`). "Arial" solo aparece como respaldo interno de Tailwind.
  - Verificado en el CSS, **no visualmente en navegador** (pendiente de tu confirmación).
- `[x]` Crear el árbol de rutas: `/`, `/destinations`, `/destinations/[slug]`, `/packages`, `/packages/[slug]`, `/experiences`, `/experiences/[slug]`, `/events`, `/about`, `/contact`, `/quote`, `/booking-info`, `/terms`, `/privacy`.
  - Las 14 son placeholders con `<h1>` (componente `components/PlaceholderPage.tsx`, se reemplaza en cada milestone). Las 3 `[slug]` usan `PageProps<'/…/[slug]'>` + `await props.params`.
  - Ojo: los `[slug]` de paquetes y experiencias aceptan cualquier slug hasta cargar sus datos. `/destinations/[slug]` ya lo resolvió en M3; en M5 / M6 hay que repetirlo con el mismo cuidado (`generateStaticParams` + `dynamicParams = false` + comparar `slug.toLowerCase()`, ver M3).
- `[x]` Estructura de carpetas para datos de demostración editables (paquetes, destinos, experiencias, eventos).
  - `data/{destinations,packages,experiences,events}.ts`: tipo mínimo (`slug`, `name`) + array vacío exportado, separados de los componentes. Cada milestone extiende su tipo y carga datos.
- `[x]` Estructura de carpetas `/public/images/...` según el milestone M-IMG.
  - Creadas `categories/`, `destinations/`, `destinations/bolivia/`, `packages/`, `experiences/`, `events/` (cada una con `.gitkeep`). Las subcarpetas `packages/<slug>/` y las imágenes sueltas de la raíz (`travel-hero.jpg`, `newsletter-cta.jpg`) quedan para M-IMG.
- `[x]` `app/layout.tsx`: `lang="es"` y `metadata` propios (antes: `lang="en"` y "Create Next App"). Título y descripción provisionales; el SEO completo va en M13.

**Verificación:** el proyecto compila (`npm run build`), todas las rutas resuelven aunque sea con placeholder, los tokens se aplican en un componente de prueba.
- Verificado (2026-09-19): `npm run lint` y `npm run build` con exit 0 sobre el código final; build lista las 14 rutas (11 estáticas + 3 dinámicas).
- Verificado (2026-09-19): con `npm run start` (servidor de producción) las 14 URLs devuelven 200 con `lang="es"` y su `<h1>` (los `[slug]` probados con `cartagena`, `orlando-parques`, `visita-guiada`); una ruta inexistente devuelve 404 (control negativo).
- Verificado (2026-09-19): tokens aplicados en `PlaceholderPage` (`text-travel-primary`, `text-travel-muted`) y las utilidades de los 14 tokens generadas (comprobado con un archivo temporal ya eliminado).
- Confirmación visual en navegador (fuente Geist, colores): **confirmada por el usuario el 2026-09-19** ("si luce bien"). Con eso M0 pasa a `[x]`.

---

### M1 — Header y Footer globales `[x]`
- `[x]` Header sticky con logo textual propio (**Mundo Viajero**) y símbolo propio (brújula / avión / globo).
  - `components/Header.tsx` (cliente) y `components/Logo.tsx` (brújula en SVG inline, decorativa), montados en `app/layout.tsx`. El logo es un link con nombre accesible. Verificado: tras scrollear 600px el header queda en `top=0`.
- `[x]` Menú: Inicio, Destinos, Paquetes, Experiencias, Eventos, Sobre nosotros, Contacto.
  - 7 ítems en ese orden y con sus hrefs, definidos en `config/site.ts` (`mainNav`). Horizontal desde 1024px (`lg`); por debajo, hamburguesa.
- `[x]` CTA destacado **Cotizar mi viaje** → `/quote`, visible también en móvil.
  - Siempre en la barra (no escondido dentro del menú). El nombre accesible es siempre "Cotizar mi viaje"; por debajo de 390px el texto visible se abrevia a "Cotizar" (`quoteCta.shortLabel`) para que quepa. Verificado sin solapamiento ni overflow a 320 / 360 / 375 / 390 / 414px.
- `[x]` Comportamiento scroll (sombra + fondo sólido), estado activo, focus visible.
  - Arriba: fondo translúcido y sin sombra; pasados 8px de scroll: fondo sólido y sombra (verificado midiendo el alfa real de la sombra, en ida y vuelta). Activo con `aria-current="page"` + subrayado, incluye rutas anidadas (`/destinations/cartagena` marca Destinos). Foco visible global (outline 2px en `globals.css`): Tab recorre logo → 7 ítems → CTA con outline en cada parada. `scroll-padding-top` para el header sticky (recomendado por la guía de Next 16).
- `[x]` Menú hamburguesa accesible en móvil, con bloqueo de scroll de fondo y botón claro para cerrar.
  - `aria-expanded` / `aria-controls`; el botón cambia a X y su nombre pasa a "Cerrar menú". Bloqueo de scroll (`overflow:hidden` en body + `overscroll-contain` en el panel): sin scroll de fondo con rueda ni PageDown. Escape cierra y devuelve el foco al botón; el foco queda contenido en el header (20 Tab + 20 Shift+Tab sin salir). Se cierra al navegar, con Atrás, al clicar el link de la página actual y al pasar a escritorio, y en todos los casos restaura el scroll.
  - Verificado en Edge/Chromium (puppeteer), con clic y con toque emulado (abre, cierra con la X y navega desde el panel; en `dev` por localhost y por la IP de la red, y en producción). **No probado:** iOS/Safari real ni lector de pantalla.
  - Bug reportado por el usuario (2026-09-19): "en móvil el menú no abre" al abrir `npm run dev` desde el celular por la IP de la red. Causa reproducida: Next 16 bloquea los recursos de desarrollo de orígenes no locales, la página no se hidrata y el botón queda sin JavaScript. Arreglo: `allowedDevOrigins: ["192.168.*.*"]` en `next.config.ts` (solo desarrollo; no afecta producción). Si se accede por otro rango de red (10.x, 172.16.x) o por un túnel, hay que agregar ese host a la lista.
- `[x]` Footer con 4 columnas: Marca, Explorar, Ayuda, Contacto (datos configurables) + redes sociales configurables + copyright.
  - `components/Footer.tsx` (servidor): 4 columnas en escritorio, apiladas en móvil (sin overflow a 320px), copyright con año. Datos en `config/site.ts`. **Contacto y redes están vacíos (`null` / `[]`) a propósito** (no hay datos confirmados): el footer los omite y ofrece un link a `/contact`. La rama con datos cargados (mailto, tel, `target="_blank"` + `noopener`) se verificó con valores temporales ya revertidos.

**Verificación:** navegar por teclado, abrir/cerrar menú móvil sin scroll bleed, todos los enlaces del footer apuntan a rutas existentes.
- Verificado (2026-09-19): `npm run lint` y `npm run build` con exit 0; 41/41 comprobaciones en Edge headless contra `npm run start` (teclado, scroll, menú móvil, footer, anchos móviles y sin errores ni warnings de consola, incluida hidratación). Los 11 enlaces internos de header + footer devuelven 200.
- Los scripts de prueba viven en el scratchpad de la sesión, **no en el repo**: todavía no hay tests automatizados persistentes.
- Confirmación del usuario (2026-09-19): "ya funciona" en su celular tras el arreglo de `allowedDevOrigins` (modelo/SO no indicados; iOS Safari sigue sin probarse de forma explícita). Con eso M1 pasa a `[x]`.

---

### M2 — Página de inicio (Home) `[x]`
Archivos: `app/page.tsx`, `components/home/{Hero,TripSearchForm}.tsx`, `components/{Section,CategoryCard,DestinationCard,PackageCard,ExperienceCard,EventCard,NewsletterForm}.tsx`, `components/ui/{SafeImage,buttons}`, `data/{categories,destinations,packages,experiences,events}.ts`, `config/search.ts`.
- `[x]` Hero principal (etiqueta, título, subtítulo, CTA primario **Cotizar mi viaje**, secundario **Explorar destinos**, imagen con overlay).
  - Imagen `/images/travel-hero.jpg` con degradado oscuro encima (asegura el contraste del texto blanco con cualquier foto) y `loading="eager"` + `fetchPriority="high"` (en Next 16 `priority` está deprecado). Verificado con una foto real temporal.
- `[x]` Buscador rápido de viajes (destino, tipo, fecha, duración, viajeros, presupuesto) que redirige a `/packages?...` con parámetros.
  - Contrato de parámetros (M4 debe leerlos): `destination`, `type` (slug de categoría), `date` (AAAA-MM-DD), `duration` (`1-3`, `4-7`, `8-14`, `15+`), `travelers`, `budget` (`economico`, `intermedio`, `premium`, `flexible`; sin montos, los rangos por país/moneda son de M9). Opciones editables en `config/search.ts`.
  - Con JavaScript arma una URL limpia (sin parámetros vacíos). **Sin JavaScript** funciona como GET nativo, pero envía los parámetros vacíos (`?destination=Uyuni&type=&date=…`): M4 debe tratar un parámetro vacío como ausente.
- `[x]` Sección de categorías de viaje (8 tarjetas) con enlaces filtrados.
  - `/packages?type=<slug>`; los slugs coinciden con el valor de `type` del buscador (`data/categories.ts`).
- `[x]` Destinos destacados (6–8 tarjetas).
  - 8 internacionales (`featured` en `data/destinations.ts`) → `/destinations/<slug>`.
- `[x]` Paquetes recomendados (usando `PackageCard`).
  - Los 6 paquetes de demostración (M5) con "Consultar precio"; enlaces "Ver paquete" y "Cotizar" (`/quote?package=<slug>`). La rama con precio, duración y badge cargados se verificó con datos temporales ya revertidos ("Desde 1200 US$").
- `[x]` Experiencias y excursiones (muestra).
  - 4 experiencias `featured`, con "Ver experiencia".
- `[x]` Beneficios de reservar con la agencia.
  - 4 beneficios redactados sin promesas verificables (sin "mejor precio", plazos ni garantías).
- `[x]` Eventos y conciertos (muestra).
  - 3 ejemplos ficticios marcados como "Ejemplo ilustrativo" y "Fechas por confirmar"; sin artistas, fechas ni entradas. "Solicitar información" → `/contact` (desde M7 → `/quote?event=<slug>`).
- `[x]` Destinos nacionales (Bolivia).
  - Los 10 destinos con la nota "Consulta fechas recomendadas"; sin fechas ni precios.
- `[x]` Newsletter + CTA final.
  - `NewsletterForm` valida el correo (vacío, formato, espacios) con mensajes en región `role="status"`. **No hay backend:** un correo válido muestra "…no guardamos tu correo" y no simula ninguna suscripción. CTA final "Cotizar mi viaje" → `/quote`.

**Verificación:** el buscador arma bien la URL con parámetros; ningún enlace roto; sin overflow horizontal en móvil.
- Verificado (2026-09-19): `npm run lint` y `npm run build` con exit 0 (15 rutas); 37/37 comprobaciones en Edge headless contra `npm run start`, más otra corrida con 3 fotos reales temporales (ya borradas). Cubre: estructura y orden de las 10 secciones, un solo `<h1>`, buscador (URL completa, vacía, parcial, caracteres especiales, sin JavaScript), newsletter, 48 enlaces internos únicos con 200, accesibilidad básica (labels, alt, encabezados sin saltos), sin overflow horizontal a 320 / 375 / 414 / 768 / 1024 / 1280 / 1920px y sin errores ni warnings de consola.
- Imágenes: aún no existen los archivos (M-IMG). `SafeImage` deja siempre un fondo degradado + ícono + nombre debajo de la foto y retira la `<img>` si falla: **0 imágenes rotas** verificado, y con archivo la foto tapa el fallback. Esperado hasta M-IMG: el servidor registra un error por cada imagen faltante (41 rutas) y el navegador un 404 por cada una.
- Nota de entorno: el optimizador de imágenes de Next 16 guarda las versiones optimizadas en `.next/cache/images` (TTL 4 h) y **sigue sirviendo una imagen ya optimizada aunque borres el archivo original**. Me pasó al probar (aparecían 3 fotos ya borradas). Si al reemplazar o borrar una imagen ves la versión vieja, borra esa carpeta.
- Confirmación visual del usuario (2026-09-19): "si funciona bien" en escritorio y móvil, con el fallback (sin fotos reales). Con eso M2 pasa a `[x]`.
- Contenido: los textos de destinos, paquetes y experiencias son descripciones genéricas editables (no afirman inclusiones, duraciones ni precios); revisa que el tono te sirva.

---

### M3 — Destinos: lista y detalle `[x]`
Archivos: `app/destinations/page.tsx`, `app/destinations/[slug]/page.tsx`, `app/not-found.tsx` (404 propio en español), `components/PageHeader.tsx`, `data/destinations.ts` (ahora con `description`, `experienceTypes` y `gallery`).
- `[x]` `/destinations` con grilla de destinos (internacionales + nacionales).
  - Dos secciones: 8 internacionales y 10 nacionales (estas con "Consulta fechas recomendadas"), con `PageHeader` y un solo `<h1>`.
- `[x]` `/destinations/[slug]` con descripción, galería, tipo de experiencia y CTA de consulta.
  - Banner con nombre, ubicación y resumen; "Sobre {destino}"; "Tipo de experiencia" (chips → `/packages?type=<slug>`); "Galería" de 3 fotos; cuadro lateral (sticky en escritorio) con "Consultar por este destino" → `/quote?destination=<slug>` y "Ver paquetes" → `/packages?destination=<nombre>`. Sin fechas ni precios inventados. Los 18 destinos se generan estáticos.
  - Los textos son descripciones generales escritas con conocimiento general (p. ej. las menciones a Patrimonio de la Humanidad de la UNESCO): **conviene que las revises**.
- `[x]` `DestinationCard` reutilizable por props (sin duplicar tarjetas).
  - La misma tarjeta (variantes `default` y `compact`, prop `note`) se usa en la Home y en `/destinations`.
- `[x]` Estado de imagen faltante (fondo degradado + ícono + nombre, nunca imagen rota).
  - `SafeImage` en el banner y en las 3 fotos de la galería. Verificado sin archivos (0 `<img>` rotas, etiqueta "Ciudad · foto N" visible) y con fotos reales temporales (foto presente tapa el fallback; las ausentes caen al fallback).
- Galería: las fotos son **opcionales** y no figuran en la tabla de M-IMG: `/public/images/destinations/<slug>/1.jpg … 3.jpg` (y `…/bolivia/<slug>/1.jpg … 3.jpg` para los nacionales). Mientras no existan se ve el fallback (ver el criterio opcional que agregué en M-IMG).
- Slugs: `dynamicParams = false` (404 directo para cualquier slug fuera de `data/destinations.ts`), incluidos `/destinations/bolivia` (M8 decidirá si lo agrega) y la ruta inexistente general, que muestra `app/not-found.tsx` (en español, con header y footer).

**Verificación:** entrar a al menos 3 slugs distintos; comprobar fallback de imagen forzando una ruta inexistente.
- Verificado (2026-09-19): `npm run lint` y `npm run build` con exit 0; en Edge headless contra `npm run start`: **55/55** sin fotos y **53/53** con 2 fotos temporales (ya borradas). Los slugs y textos se leen del código fuente (no se duplican a mano). Cubre: lista, **los 18 detalles** (200, h1, descripción, chips, galería de 3, CTAs, `lang="es"`, prerender presente en el HTML de servidor sin JavaScript), 3 destinos en navegador (Cartagena, Uyuni, Santa Cruz de la Sierra), navegación lista ↔ detalle, menú "Destinos" activo, 23 enlaces internos, sin overflow de 320 a 1280px en 3 páginas, sin errores de consola, y 404 real (HTTP 404, no 200) para slug inexistente, `bolivia`, slug con HTML (sin reflejarlo en la página) y ruta general.
- **Bug real encontrado y corregido durante la verificación:** en producción Next resuelve las rutas prerenderizadas sin distinguir mayúsculas. `/destinations/CARTAGENA` llegaba con `slug = "CARTAGENA"`, mi código no lo encontraba y llamaba a `notFound()`, y Next **sobrescribía en disco el HTML prerenderizado de Cartagena con la página 404** (37 KB → 12 KB): tras reiniciar el servidor, `/destinations/cartagena` devolvía 404. Reproducido a propósito, arreglado con `slug.toLowerCase()` y verificado (el archivo queda idéntico, Cartagena sigue en 200 tras un reinicio, y hay un check permanente en la batería).
- Decisión medida: probé quitar `dynamicParams = false`. Con el valor por defecto Next **escribe 3 archivos en disco por cada slug inventado** (`.html/.meta/.rsc`), o sea que peticiones al azar llenarían el disco. Con `false` no escribe nada. Contrapartida: el servidor registra `Error: Internal: NoFallbackError` por cada slug inexistente (solo ruido de log; el código HTTP es 404).
- Diferencia dev/producción: en `npm run dev`, `/destinations/CARTAGENA` da 404; en producción da 200 con el mismo contenido (URL duplicada → ver M13). Ninguno de los dos daña nada.
- Nota de la batería: una falla intermitente se debió a que Edge reutilizaba su caché HTTP entre pestañas y `page.goto` no devolvía un 200 limpio; con la caché del navegador desactivada da 200 (`fromCache=false`). Con `Invoke-WebRequest` siempre había sido 200. Lo atribuyo a eso por descarte (no capturé el 304 directamente).
- Confirmación visual del usuario (2026-09-19): "me gustó" (escritorio y móvil, con el fallback, sin fotos reales). Con eso M3 pasa a `[x]`.

---

### M4 — Paquetes: lista, filtros y orden `[x]`
Archivos: `app/packages/page.tsx`, `lib/packages.ts` (lógica pura: lectura de la URL, filtros, orden, enlaces), `components/packages/{FilterForm,MobileFilterDrawer,ActiveFilters}.tsx`, `components/PackageCard.tsx` (ampliada), `components/PageHeader.tsx` (admite contenido extra), `components/ui/fields.ts`, `config/packages.ts`, `data/packages.ts` (modelo ampliado).
**Cómo funciona:** la página lee `searchParams` y filtra/ordena **en el servidor** (es dinámica, `ƒ`): las URLs son compartibles, la búsqueda de la Home cae directo aquí y los filtros funcionan sin JavaScript. **Regla central:** un filtro u orden solo se ofrece y aplica **si el catálogo tiene datos de ese atributo**; si no, el criterio se conserva como *preferencia* (chip de borde punteado) y viaja a la cotización. Así no se simula información que no existe.
- `[x]` `/packages` con cabecera (título + texto que invita a cotización personalizada si no hay match).
  - `<h1>` "Paquetes", texto de invitación y botón **Cotizar una opción personalizada** → `/quote` llevando lo buscado (`destination`, `type`, `date`, `duration`, `travelers`, `budget`).
- `[x]` Filtros: destino, región, tipo, duración, temporada, precio, régimen, incluye vuelos/traslados/excursiones, disponibilidad, etiqueta.
  - Los 10 grupos están implementados y **verificados con un catálogo de prueba completo** (temporal, ya retirado). Destino busca sin distinguir tildes ni mayúsculas en nombre y ubicación; los filtros se combinan con AND; los paquetes sin dato no aparecen cuando el filtro está activo; el precio solo se ofrece si todos los precios comparten moneda.
  - **Con los datos de demostración actuales solo se ven 5 grupos** (Destino, Región, Tipo de viaje, Régimen y Ordenar), porque los paquetes tienen `null` en duración, precio, temporada, incluye, disponibilidad y etiqueta. Aparecerán solos al cargar esos datos (M5 / M12).
- `[x]` Ordenamiento: relevancia, precio, duración, populares, destacados, salida más próxima.
  - Los 8 órdenes (precio y duración en ambos sentidos) implementados y verificados con el catálogo de prueba; los valores desconocidos quedan siempre al final y los empates conservan el orden original. Hoy solo se ofrecen **Relevancia** y **Destacados** (los demás necesitan datos). "Destacados" usa `featured` (elegí Punta Cana, Uyuni y Dubái de forma editorial: cámbialo en `data/packages.ts`).
- `[x]` `PackageCard` con imagen, badge, nombre, destino, duración, resumen, incluye, precio/`Consultar precio`, botones **Ver paquete** y **Cotizar**.
  - Ahora incluye "Régimen", "Incluye: …" (solo lo confirmado como `true`; `null` y `false` no se listan) y "Disponibilidad". Verificado con datos completos y con los reales (sin datos no se muestra ninguna línea inventada).
- `[x]` Estado "sin resultados" amable con CTA **Cotizar una opción personalizada**.
  - Mensaje "No encontramos paquetes con esos filtros", **Cotizar una opción personalizada** (con lo buscado) y **Quitar filtros**; contador "Mostrando 0 de 6 paquetes". Responde HTTP 200.
- `[x]` `FilterSidebar` (desktop) y `MobileFilterDrawer` (móvil).
  - El formulario (`FilterForm`, un GET a `/packages`) va en la barra lateral desde 1024px; debajo, el cajón móvil sobre `<dialog>` nativo (foco contenido, Escape, clic en el fondo, scroll de fondo bloqueado y se cierra al ensanchar la ventana). Los criterios que el formulario no muestra viajan en campos ocultos para no perderse. Chips de "filtros activos" con enlace para quitar cada uno.

**Verificación:** aplicar combinaciones de filtros y verificar que la lista responde; probar el caso sin resultados.
- Verificado (2026-09-19): `npm run lint` y `npm run build` con exit 0. **Lógica aislada 66/66** (fronteras de duración, precios nulos, empates, monedas mezcladas, parámetros hostiles como `constructor`/`__proto__`, ida y vuelta de URLs). **Navegador con datos reales 79/79** y **con el catálogo de prueba completo 33/33** (los 14 campos, los 8 órdenes, combinaciones por la interfaz, cajón móvil). Sin regresiones: M2 37/37 y M3 55/55 sobre el mismo build.
- Cubre además: la búsqueda de la Home cae en `/packages` con sus 6 criterios (destino y tipo filtran; duración, fecha, viajeros y presupuesto quedan como preferencias y llegan a la cotización), navegación desde categorías y destinos, parámetros inválidos u hostiles (200, sin inyección, texto escapado), funcionamiento **sin JavaScript**, accesibilidad (labels, `id` únicos, encabezados, `aria-live`) y sin overflow de 320 a 1280px.
- Defecto de diseño encontrado al revisar capturas y corregido: en la barra lateral los campos de precio (mín./máx.) cortaban el texto; ahora se apilan en escritorio (medido: el texto cabe en todos los anchos).
- El catálogo de prueba se instaló temporalmente en `data/packages.ts` y se restauró; **verificado por hash** que el archivo real quedó idéntico.
- Límites conocidos: con JavaScript apagado (o al aplicar el formulario) la URL lleva parámetros vacíos (`?destination=&type=…`); se ignoran al leerlos. Si los precios están en monedas distintas, no se ofrece filtro ni orden por precio. No probado en Safari/iOS real ni con lector de pantalla.
- Confirmación del usuario (2026-09-19): "si sale perfecto continúa con el siguiente milestone". Se interpreta como aprobación condicionada a que se vea bien al abrirlo; **si algo no convence, se reabre M4**. Con eso M4 pasa a `[x]`.

---

### M5 — Detalle de paquete `[x]`
Archivos: `app/packages/[slug]/page.tsx`, `components/packages/PackageGallery.tsx` (cliente), `components/Breadcrumb.tsx`, `lib/format.ts` (precio, duración, fecha), `lib/packages.ts` (`relatedPackages`), `config/packages.ts` (textos generales), `data/packages.ts` (modelo ampliado), `components/ui/SafeImage.tsx` (prop `fit`).
**Criterio de contenido:** lo específico de cada paquete (itinerario, qué incluye, opcionales, preguntas) vive en `data/packages.ts` y hoy está **vacío**, porque no está confirmado. En ese caso la página lo dice con un texto honesto ("se confirma en tu cotización") en vez de inventarlo. Lo general (costos que normalmente no se incluyen, recomendaciones, información, condiciones, preguntas frecuentes) sale de `config/packages.ts`, en términos neutros: sin plazos, precios, garantías ni penalidades concretas. "Sobre el destino" y "Paquetes relacionados" se calculan con datos reales.
- `[x]` `/packages/[slug]` con breadcrumb, galería (principal + 3–4 secundarias, zoom, miniaturas).
  - Breadcrumb Inicio › Paquetes › nombre (`aria-current`). Galería: foto principal + 4 secundarias con miniaturas; "Ampliar foto" abre un visor `<dialog>` modal con flechas ← →, botones anterior/siguiente, contador "Foto N de 5", Escape y foco devuelto al cerrar. **Todo por teclado** (Tab recorre breadcrumb → "Ampliar foto" → 5 miniaturas; Enter/Espacio seleccionan) y con toque. Los 6 paquetes se generan estáticos (`dynamicParams = false`, `slug.toLowerCase()`, 404 para slugs inexistentes).
- `[x]` Info principal: nombre, destino, duración, temporada, badge, precio/consulta, disponibilidad, CTA **Cotizar este paquete**.
  - `<h1>`, ubicación, descripción, ficha (Duración, Temporada, Próxima salida, Disponibilidad) con "A consultar" / "Consultar fechas" cuando no hay dato, precio o "Consultar precio", **Cotizar este paquete** → `/quote?package=<slug>` y **Ver destino**.
- `[x]` Secciones: Qué incluye, Qué NO incluye, itinerario sugerido, opcionales, recomendaciones, info importante, condiciones, FAQ, paquetes relacionados.
  - Las 9 pedidas más "Sobre el destino", con un índice de anclas (el encabezado queda bajo el header fijo). **Qué incluye** lista solo lo confirmado (`true`, régimen y textos propios). **Qué NO incluye** muestra primero lo confirmado como no incluido (`false`) y siempre la lista de costos potenciales ("Salvo que tu cotización indique lo contrario, tampoco incluye": gastos personales, propinas, seguro, impuestos y tasas, alimentos no especificados, excursiones opcionales, visas, equipaje adicional y penalidades por cambios). FAQ con `<details>` (teclado). Relacionados: misma región (2 puntos) + tipos en común (1 punto cada uno), solo con algo en común.
- `[x]` Cargar los 6 paquetes de demostración editables (Cartagena, Orlando, Punta Cana, Uyuni, Río, Dubái) con precios/fechas como `null` o texto de consulta.
  - Los 6 abren con su página, enlazan a su destino y siguen con precio, duración, temporada, salida, incluye, itinerario y opcionales sin confirmar. Para cargarlos: editar `data/packages.ts` (M12 lo hará desde el panel).

**Verificación:** los 6 paquetes abren; "qué no incluye" muestra explícitamente costos potenciales; galería navegable por teclado.
- Verificado (2026-09-19): `npm run lint` y `npm run build` con exit 0 (los 6 paquetes se generan estáticos). **Lógica 83/83** (`relatedPackages` con los 6 resultados reales calculados a mano, empates, formatos de fecha/precio). **Navegador con datos reales 51/51** (los 6 paquetes: h1, breadcrumb, ficha, CTAs, índice, relacionados; costos explícitos textuales; nada afirmado sin datos; galería por teclado y toque; zoom con flechas, foco contenido, Escape; FAQ; 404 y variantes en mayúsculas sin tocar el HTML prerenderizado; enlaces desde la lista; anclas; accesibilidad; sin overflow de 320 a 1280px). **Catálogo de prueba completo 12/12** (todas las ramas: precio, fecha en español, incluye true/false/null, itinerario, opcionales, FAQ propia, sin destino) y **con fotos reales temporales 7/7**. Sin regresiones: M4 79/79 (+33/33 con el modelo nuevo), M3 55/55, M2 37/37.
- Defecto encontrado y corregido al revisar capturas: en el visor de fotos (fondo negro) el foco de los botones usaba el azul primario (~2.6:1); ahora es un contorno blanco de 2px (verificado por el color calculado). El catálogo de prueba se instaló temporalmente y se restauró: **hash verificado**.
- Nota: el visor y el cajón usan `<dialog>` nativo; con Tab el foco puede pasar a la interfaz del navegador (`<body>`), nunca a la página de atrás.
- No probado: Safari/iOS real ni lector de pantalla. Las fotos de la galería (`/public/images/packages/<slug>/main.jpg`, `1.jpg` … `4.jpg`) no existen todavía: se ve el fallback (ver el criterio opcional en M-IMG).
- Contenido a revisar: las recomendaciones, la información importante, las condiciones y las preguntas frecuentes de `config/packages.ts` son texto general redactado por mí; revísalo antes de publicar (las políticas reales van en M11).
- Confirmación del usuario (2026-09-20): "adelante, usa las imágenes ya las puse" (aprobación para continuar). Además revisé yo las capturas de `/packages/cartagena-caribe` con la foto real: la principal (397 px) se ve pixelada en su espacio de 650 px (ver M-IMG). Con eso M5 pasa a `[x]`; si algo no convence, se reabre.

---

### M6 — Experiencias y excursiones `[x]`
Archivos: `app/experiences/page.tsx`, `app/experiences/[slug]/page.tsx`, `components/ExperienceCard.tsx` (ampliada), `lib/experiences.ts` (categoría por URL, filtro, conteos, relacionadas), `config/experiences.ts` (recomendaciones generales), `data/experiences.ts` (categorías y modelo ampliado).
- `[x]` `/experiences` con categorías (visitas guiadas, museos, paseos en barco, naturaleza, parques, gastronomía, aventura, familiar, nocturna, religiosa).
  - Barra de categorías con "Todas" + las 10 pedidas, cada una con su cantidad. Filtra en el servidor por `?category=<slug>` (enlaces compartibles). Las 5 categorías que aún no tienen experiencias (Parques, Gastronomía, Aventura, Familiar, Religiosa) se ven **deshabilitadas** (`aria-disabled`, no son enlaces ni reciben foco); si alguien entra a una por URL se muestra un estado vacío amable con "Consultar por experiencias". Una categoría inválida en la URL se ignora.
- `[x]` `ExperienceCard` (imagen, nombre, ciudad, duración, disponibilidad, incluye, **Ver experiencia** / **Consultar**).
  - Muestra "Ciudad a consultar · Duración a consultar" cuando no hay dato, y las líneas "Disponibilidad" e "Incluye" **solo si están confirmadas**. Botones **Ver experiencia** → `/experiences/<slug>` y **Consultar** → `/quote?experience=<slug>` (contrato de entrada para M9). Se usa igual en la Home.
- `[x]` `/experiences/[slug]` con detalle.
  - Breadcrumb, foto real, categorías (enlazan a la lista filtrada), descripción, ficha (Ciudad, Duración, Disponibilidad: "A consultar" sin dato), **Consultar esta experiencia**, "Qué incluye" (se confirma en la cotización si no hay dato), recomendaciones, información importante, condiciones y experiencias relacionadas (misma categoría). Las 7 se generan estáticas con el patrón de M3 (`dynamicParams = false`, `slug.toLowerCase()`, 404 para slugs inexistentes).
- `[x]` Datos de demostración editables.
  - 7 experiencias en `data/experiences.ts` con las 7 fotos de M-IMG; ciudad, duración, disponibilidad e "incluye" en `null` / vacío (no confirmados). Los textos son descripciones generales sin cifras ni promesas.

**Verificación:** entrar a varias experiencias; textos sin datos inventados como verificables.
- Verificado (2026-09-20): `npm run lint` y `npm run build` con exit 0 (7 detalles estáticos). **Lógica 27/27** (10 categorías en orden, conteos, filtro, relacionadas, parámetros hostiles y que las 7 fotos existan en disco). **Navegador con datos y fotos reales 56/56:** lista (11 chips con cantidades, 5 deshabilitados, 7 tarjetas con foto real y sin fallback), filtro por cada categoría, categoría vacía, parámetros inválidos (`constructor`, `__proto__`, `<script>`, 500 caracteres, control), los **7 detalles**, foto real eager, teclado (los chips deshabilitados se saltan), 404 y variantes en mayúsculas sin tocar el HTML prerenderizado, Home con la tarjeta ampliada, 21 enlaces con 200, accesibilidad y sin overflow de 320 a 1280px. **Con datos completos 7/7** (tarjeta y detalle con ciudad, duración, disponibilidad e "incluye"; el dato de una experiencia no se contagia a las demás; datos restaurados y **hash verificado**). Sin regresiones: M5 51/51, M4 79/79, M3 55/55, M2 37/37.
- Defecto de accesibilidad encontrado y corregido: en `/experiences` los títulos de las tarjetas (`h3`) saltaban directo desde el `h1`; ahora hay un `h2` "Resultados" (oculto visualmente) como en `/packages`.
- Textos generales (`config/experiences.ts`) redactados por mí en términos neutros: revísalos. No probado en Safari/iOS real ni con lector de pantalla.
- Confirmación del usuario (2026-09-20): "todo está bien, pasa al siguiente milestone". Con eso M6 pasa a `[x]`.

---

### M7 — Eventos, conciertos y entretenimiento `[x]`
Archivos: `app/events/page.tsx`, `components/EventCard.tsx` (ampliada), `components/CategoryNav.tsx` (nuevo, compartido con `/experiences`), `lib/events.ts`, `config/events.ts` (textos de estado), `data/events.ts` (categorías, estados y modelo ampliado).
- `[x]` `/events` con categorías (conciertos, deportivos, ferias, festivales, parques, especiales).
  - "Todas" + las 6 pedidas, cada una con su cantidad, filtrando en el servidor por `?category=<slug>`. Las 3 sin eventos (Deportivos, Ferias, Especiales) se ven **deshabilitadas** (no son enlaces ni reciben foco); si alguien entra a una por URL ve un estado vacío amable con "Consultar por eventos". Una categoría inválida en la URL se ignora. La barra de categorías es ahora un componente compartido (`CategoryNav`) que también usa `/experiences`.
- `[x]` `EventCard` (imagen, nombre, ciudad, fecha, duración, incluye, estado, **Solicitar información**).
  - Muestra categoría, la marca **"Ejemplo ilustrativo"**, "Ciudad a consultar · Fecha por confirmar" (o la ciudad y la fecha en español, p. ej. "20 de noviembre de 2026", si están confirmadas), "Estado", "Duración" ("A consultar" sin dato) e "Incluye" solo si está confirmado. El **estado sale de un catálogo cerrado** (`por-confirmar`, `consultar`, `confirmado`, `agotado`) en `config/events.ts`, no de texto libre. El botón lleva a **`/quote?event=<slug>`** (mismo contrato de entrada que `?package=` y `?experience=`, que leerá M9; antes iba a `/contact`, que no tiene milestone propio).
- `[x]` Ejemplos ficticios editables (sin artistas/fechas/entradas presentados como confirmados).
  - 3 ejemplos en `data/events.ts` con `isExample: true`, tus 3 fotos de M-IMG, estado "Fechas por confirmar" y ciudad, fecha y duración en `null`. Ni el nombre ni el resumen contienen cifras, artistas, "confirmado", "agotado" ni "entradas disponibles" (comprobado por prueba). No hay página de detalle de evento (el árbol de rutas solo prevé `/events`).

**Verificación:** las tarjetas no afirman disponibilidad real; enlaces de "Solicitar información" funcionan.
- Verificado (2026-09-20): `npm run lint` y `npm run build` con exit 0. **Lógica 17/17** (6 categorías en orden, conteos, filtro, parámetros hostiles, las 3 fotos existen en disco, ningún texto afirma nada). **Navegador con datos y fotos reales 42/42:** las 3 tarjetas con foto real y sin fallback, las tarjetas **no contienen** cifras, fechas ni palabras de disponibilidad real, filtro por categoría y las 3 categorías vacías por URL, parámetros inválidos u hostiles (200, sin inyección), teclado (los deshabilitados se saltan), los **3 enlaces "Solicitar información" responden 200** y al hacer clic llegan a `/quote?event=<slug>`, Home con la tarjeta ampliada, accesibilidad y sin overflow de 320 a 1280px. **Con datos completos 5/5:** evento confirmado ("Bogotá · 20 de noviembre de 2026", "Confirmado", "4 horas", "Incluye: Traslados", sin marca de ejemplo), agotado, "consultar" y sin fecha (datos restaurados y **hash verificado**).
- Regresión del refactor de `CategoryNav`: `/experiences` conserva sus 11 categorías (6 enlaces, 5 deshabilitadas) y las baterías de M2–M6 pasan sin cambios funcionales (M2 solo se ajustó a la nueva URL del botón): M6 56/56, M5 51/51, M4 79/79, M3 55/55, M2 37/37.
- Capturas revisadas en escritorio y móvil (etiquetas legibles sobre las fotos, categorías vacías atenuadas). No probado en Safari/iOS real ni con lector de pantalla.
- Confirmación del usuario (2026-09-20): "todo está bien, continúa el siguiente milestone". Con eso M7 pasa a `[x]`.

---

### M8 — Viajes nacionales (Bolivia) `[x]`
- `[x]` Sección en home y/o `/destinations/bolivia`.
  - Se hicieron **ambas** (decisión mía: el "y/o" lo permitía y la Home sola dejaba sin página propia los viajes nacionales). Home: sección `#nacionales` (M2) con el enlace "Ver viajes por Bolivia" → `/destinations/bolivia`. `/destinations` (sección nacional) también lo enlaza.
  - `/destinations/bolivia` (`components/destinations/NationalOverview.tsx`, renderizado desde `app/destinations/bolivia/page.tsx`): migas Inicio › Destinos › Bolivia, `<h1>` "Viajes nacionales: Bolivia", CTA `/quote?type=escapadas-nacionales` (arriba y al pie), los 10 destinos, y "Paquetes en Bolivia" (los de `region: "Bolivia"`; hoy solo `salar-de-uyuni`, con enlace a `/packages?region=Bolivia`).
- `[x]` Tarjetas de destinos nacionales (Uyuni, Chiquitania, Titicaca, Rurrenabaque, Samaipata, Madidi, Tarija, Sucre, Potosí, Santa Cruz).
  - Son las mismas 10 de `data/destinations.ts` (`scope: "national"`), con `DestinationCard`; se verificó que el conjunto, el orden, los nombres y los enlaces coinciden con el código y que las 10 fotos cargan (con `alt`).
- `[x]` Sin temporadas exactas inventadas → usar `Consulta fechas recomendadas`.
  - Las 10 tarjetas (Home, `/destinations` y `/destinations/bolivia`) dicen "Consulta fechas recomendadas". Se rastreó `/destinations/bolivia` y las 10 fichas: ningún mes, año, "temporada/verano/invierno/estación" ni precio (`$`, USD, Bs, "desde N"). Se excluyó "época" del rastreo a propósito: "época colonial" (Potosí) es historia, no una temporada. El paquete de Uyuni muestra "Consultar precio".

**Verificación:** todas las tarjetas cargan; ninguna afirma fechas/precios como definitivos.
- `npm run lint` y `npm run build` con exit 0; `/destinations/bolivia` sale como ruta estática (`○`).
- Navegador (Edge headless contra `next start -p 3100`, script `m8-test.js` fuera del repo): **34/34**. Cubre h1/h2 y jerarquía sin saltos, migas (con la actual sin enlace), las 10 tarjetas, fotos, ausencia de fechas/precios en la página y en las 10 fichas, CTAs, enlaces desde Home y `/destinations` (y que el clic llega), móvil 375 px (2 columnas, sin desbordamiento), la 404 de un slug inexistente, y las variantes de mayúsculas.
- **Defecto real encontrado y corregido (mismo patrón que CARTAGENA):** `/destinations/Bolivia` no llega a la ruta estática sino a `[slug]`, que llamaba a `notFound()`, y Next guardaba ese 404 encima de `bolivia.html` (medido: 70 685 → 12 188 bytes; la página quedaba rota hasta el siguiente build). `[slug]` ahora renderiza la misma página cuando `slug.toLowerCase() === "bolivia"` (constante `NATIONAL_OVERVIEW_SLUG`). Con el arreglo, `BOLIVIA`, `Bolivia`, `bOlIvIa`, `BOLIVIA/` y `Bolivia?x=1` dan 200 con la página completa y el HTML en disco sigue siendo la página válida (70 685 → 70 716 bytes: Next lo regenera con +31 bytes de payload; no es el 404). Lo comprobé con el test antes del arreglo (falló) y después (pasa).
- Regresión sobre el último código: lógica 83/27/17; M7 42; M6 56; M5 51; M4 79; M3 54 (era 55: se quitó el caso "`/destinations/bolivia` → 404", que ahora es una página válida); M2 37. En la primera pasada conjunta M6 se cortó a mitad ("Navigating frame was detached", 39 PASS/0 FAIL) y M7 agotó la primera navegación; repetidos por separado con el mismo build terminan completos (56/56 y 42/42). No lo atribuyo al producto, pero no pude reproducir el corte.
- Fotos: las únicas que fallan en el optimizador son las galerías opcionales `1/2/3.jpg` de las fichas nacionales (no existen en disco; fallback esperado, ver M-IMG). La portada y las tarjetas cargan todas.
- Confirmación del usuario (2026-09-21): "todo está bien, continúa el siguiente milestone". Con eso M8 pasa a `[x]`.

---

### M9 — Formulario de cotización multi-step (núcleo) `[x]`
- `[x]` `/quote` con hero.
  - `app/quote/page.tsx` (dinámica, `ƒ`): `PageHeader` "Cotiza tu viaje" + el formulario. Lee `searchParams` con `lib/quote-entry.ts` y precarga según el contrato de entrada: `?package=|experience=|event=<slug>` (gana el paquete si vienen varios), `?destination=<slug o nombre>`, `?type=<categoría>` (p. ej. el CTA de `/destinations/bolivia`), `?date=`, `?duration=`, `?travelers=`, `?budget=` (lo que emite `quoteHref` de `/packages`). Lo inválido se descarta en silencio; solo se avisa si un enlace apuntaba a un paquete/experiencia/evento que no existe. Un aviso "Precargamos algunos datos…" aparece solo si se aplicó algo válido.
- `[x]` `QuoteStepper` de 8 pasos: tipo de solicitud, destino, fechas, viajeros, preferencias, presupuesto, contacto, confirmación.
  - `components/quote/QuoteStepper.tsx` (estado, navegación, foco) + `QuoteSteps.tsx` (los 8 cuerpos) + `Field.tsx` (etiqueta/pista/error accesibles). Para avanzar hay que dejar bien el paso actual; retroceder es libre; el indicador solo ofrece los pasos ya alcanzados. Foco al título del paso al cambiar y al resumen de errores (`role="alert"`, con enlaces a cada campo) al fallar; el error de un campo desaparece al editarlo. Enter envía el formulario. En móvil el indicador es el texto "Paso n de 8".
- `[x]` `QuoteSummary` que muestra todo lo seleccionado antes de enviar.
  - Paso 8: 7 secciones (una por paso) con botón "Editar" que vuelve a ese paso conservando lo escrito; lo no indicado dice "No indicado"/"Sin preferencia" (nunca vacío ni `undefined`); el HTML escrito en los campos se muestra como texto.
- `[x]` Validaciones con mensajes claros (`lib/quote.ts`, pura y probada aislada).
  - Nombre (≥ 2), email (formato), teléfono (7–15 dígitos, `+` opcional; admite espacios, paréntesis, puntos y guiones), destino **o** "Necesito sugerencias", fechas (salida ≥ hoy **o** "fechas flexibles"; regreso **posterior** a la salida y solo con salida), adultos 1–50, niños 0–20 con edad 0–17 cada uno, tipo de solicitud, rango de presupuesto, monto opcional (solo dígitos), límites de longitud y aceptación de privacidad.
- `[x]` Rangos de presupuesto configurables por país/moneda (no rígidos en el frontend).
  - `config/quote.ts` → `budgetProfiles` (hoy Bolivianos/BOB y Dólares/USD): cada perfil puede definir `amounts` por rango (`min`/`max`) y un texto `basis` ("por persona"…). Los nombres de los rangos salen de `budgetOptions` (`config/search.ts`, los mismos del buscador). **No inventé montos:** todos los perfiles traen `amounts` vacío, así que el formulario muestra solo "Económico / Intermedio / Premium / Aún no lo sé" hasta que el negocio defina cifras (el ejemplo está comentado en el archivo). Además hay un monto aproximado opcional en la moneda elegida.

**Verificación:** completar el flujo con datos válidos e inválidos; comprobar que cada mensaje de error aparece cuando corresponde.
- `npm run lint` y `npm run build` con exit 0; `/quote` sale como ruta dinámica (`ƒ`).
- Lógica (`logic-quote-test.js`, módulos reales transpilados): **118/118**. Validación de cada paso con válidos e inválidos (fechas inexistentes/pasadas/de regreso, `1e3`, `-1`, `2.5`, teléfonos y correos límite…), `validateAll`, resumen, configuración, `parseQuoteEntry` (mayúsculas, `__proto__`/`constructor`, precedencia, saneado) y **todos los enlaces `/quote?…` que emite hoy el sitio** (6 paquetes, 7 experiencias, 3 eventos, 18 destinos, Bolivia, y `/packages` → `quoteHref` → `/quote`).
- Navegador (Edge headless contra `next start -p 3100`, `m9-test.js` fuera del repo): **134/134**. Flujo completo válido y, en cada uno de los 7 pasos con reglas, el caso inválido con su mensaje exacto, el foco y `aria-invalid`/`aria-describedby`; salto entre pasos (no se puede avanzar con el actual roto; sí retroceder); Editar desde el resumen; selector de paquete/experiencia/evento (autorrelleno del destino sin pisar lo escrito; se reinicia al cambiar de tipo); precarga desde la URL (paquete, experiencia, evento, destino, `/packages`, Bolivia, valores inválidos, fecha pasada, XSS); móvil 375 px sin desbordamiento en los 8 pasos; etiquetas, ids únicos, `<legend>` y jerarquía de encabezados en cada paso; teclado (Espacio, flechas, Enter).
- **Nada se guarda ni se envía:** tras rellenar todo el formulario, `localStorage`/`sessionStorage`/cookies vacíos, ninguna petición no-GET, ningún dato personal ni del formulario en URLs o cuerpos, la URL sigue siendo `/quote`, y al recargar el formulario vuelve vacío.
- **Defectos reales hallados por los tests y corregidos:** (1) `syncChildAges` con más niños del máximo generaba 20 campos de edad en vez de ninguno mientras "Niños" era inválido; (2) los botones "Editar" del resumen medían 20 px de alto (WCAG 2.2 pide 24 mínimo): ahora 36 px, y los mensajes del resumen de errores también crecieron.
- Regresión sobre el último código: lógica 83/27/17 (+118 nueva); M1 41; M2 37; M3 54; M4 79; M5 51; M6 56; M7 42; M8 34. Tests viejos actualizados: M7 esperaba el `<h1>` del placeholder de `/quote`; M1 (que no estaba en mi batería habitual) contaba como error los 400 de las galerías opcionales de `/destinations/cartagena`, ruido ya filtrado en los demás tests.
- **Decisiones mías (dime si prefieres otra):**
  1. **Sin backend, "Finalizar" no envía nada.** Es coherente con "sin persistencia simulada": el paso 8 lo avisa antes de finalizar y el panel final dice claramente "no se guardó ni se envió" (sin frases de "recibimos tu solicitud" ni plazos). Ese panel es **provisional**: M10 lo reemplaza por `QuoteSuccess` cuando haya dónde guardar.
  2. **Todo en memoria**: no hay borrador en el navegador (evita guardar datos personales sin que se pida); recargar borra lo escrito.
  3. Defaults: 2 adultos, 0 niños, moneda = la primera del perfil (Bolivianos), contacto preferido = correo. Sin tipo de solicitud elegido salvo que venga de un enlace (así existe el error del paso 1).
  4. Canales de contacto: solo correo y llamada (WhatsApp no está en `siteConfig`); se agregan en `contactMethods`.
  5. El enlace a `/privacy` abre en otra pestaña para no perder lo escrito (esa página sigue siendo placeholder hasta M11).
- No probado: Safari/iOS reales, lector de pantalla real, ni el aspecto con montos definidos en `amounts` (la lógica sí está probada).
- Confirmación del usuario (2026-09-23): "si funciona lo de quote y excelente, continua el siguiente milestone". Con eso M9 pasa a `[x]`.

---

### M10 — Confirmación + modelo de datos de cotización `[x]`
- `[x]` **Prerequisito: integración de Supabase** (backend elegido por el usuario; antes decía "aún no existe").
  - `@supabase/supabase-js` + `@supabase/ssr` instalados. Tres clientes en `lib/supabase/`: `client.ts` (navegador, clave anónima), `server.ts` (Server Actions/route handlers, clave anónima + cookies de sesión, patrón `@supabase/ssr` con `cookies()` asíncrono de Next 16) y `admin.ts` (clave `service_role`, `server-only`, para lo que necesite saltarse RLS). Las tres claves salen de `process.env` (`.env.local`, ignorado por git): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
  - Esquema en `supabase/schema.sql`: `travel_quotes` (todos los campos de `QuoteState` + `id`, `reference` autogenerada `TV-<año>-####`, `status` con default `'Nueva'`, `created_at`/`updated_at`) y `travel_quote_items` (relación por `quote_id`, para cuando una cotización pueda llevar más de un elemento). RLS activado en ambas: INSERT público permitido, SELECT/UPDATE/DELETE públicos denegados (ninguna política los habilita). La lectura queda para el panel admin de M12.
  - Tipos en `lib/supabase/types.ts`: `TravelQuote`/`TravelQuoteItem` (camelCase) + `TravelQuoteRow`/`TravelQuoteItemRow` (snake_case, como los entrega Supabase) + `Database`. No había tipado previo en el repo (el "prompt" que menciona este criterio no está en el código): se derivaron de `QuoteState` (`lib/quote.ts`, **sin modificar**) más lo que pedía el milestone.
  - **Todavía no se conecta nada:** el panel final de `/quote` sigue como en M9 (no guarda ni envía). Eso es el resto de M10.
  - **Verificación:** `npm run lint` y `npm run build` con exit 0 (46 rutas, sin cambios en el árbol de rutas). Confirmado que la `service_role` key no llega al navegador: (1) no aparece en ningún archivo de `.next/static` tras un build; (2) prueba directa — una página temporal `"use client"` que importaba `admin.ts` hizo **fallar** `next build` con `'server-only' cannot be imported from a Client Component module` (el error esperado); quitado el import, build limpio de nuevo. La página de prueba no quedó en el repo (`git status` limpio: solo `lib/supabase/`, `supabase/`, `package.json`/`package-lock.json`).
  - **SQL que hay que ejecutar en Supabase:** un solo archivo, `supabase/schema.sql`, completo, una sola vez, en SQL Editor → New query → Run (las instrucciones están además al principio del archivo). No hay otro script todavía.
  - **Nota para cuando se conecte el submit (resto de M10):** en Postgres, `INSERT ... RETURNING` obedece las políticas de SELECT, no las de INSERT; como no hay SELECT público, un insert con la clave anónima no deja leer de vuelta el `reference` generado. Para mostrarlo en `QuoteSuccess` conviene insertar (y leer el resultado) desde una Server Action usando `lib/supabase/admin.ts`, nunca desde el navegador.
- `[x]` Guardado real de la solicitud (Server Action del paso 8 de `/quote` → `travel_quotes`/`travel_quote_items`), con revalidación completa en el servidor.
  - `app/quote/actions.ts` (`"use server"`, delgada) delega en `lib/quote-submit.ts` (server-only, es la capa de datos): reconstruye el `QuoteState` desde cero saneando cada campo (tipos, longitudes, arreglos con `allowlist`; nada de lo que mande el cliente se guarda tal cual), vuelve a correr `validateAll`/`validateStep` — la misma lógica de M9, no una copia — y solo entonces inserta. El elemento de catálogo (si hay) sale siempre de `data/` vía el catálogo del servidor, nunca de un dato que mande el cliente (no hay ni un campo para el nombre en `QuoteState`). Un slug de ítem que ya no exista se descarta en silencio en vez de rechazar la solicitud. `services` se valida contra la lista cerrada de `config/quote.ts` a mano, porque `validateStep` no lo hacía (vacío en M9, sin explotar).
  - Se lee de vuelta con `lib/supabase/admin.ts` (`service_role`) a propósito: con la clave anónima, `INSERT ... RETURNING` no deja leer el `reference` porque no hay SELECT público (la nota de `supabase/schema.sql`).
  - **Verificación — dos cotizaciones reales, confirmadas por fuera de la app:** con Puppeteer se completaron los 8 pasos y se envió; luego, con un script aparte (API REST de Supabase, `service_role`, sin pasar por el código del proyecto) se confirmó que las filas existen con los datos correctos: (1) una "a medida" (destino, 1 niño con su edad, preferencias, servicio, notas, presupuesto, contacto) con **`travel_quote_items` vacío** (no había elemento de catálogo); (2) una con `?package=salar-de-uyuni` precargado, con **una fila en `travel_quote_items`** (`item_type: "paquete"`, `item_name: "Salar de Uyuni"` — el nombre real del catálogo, no uno inventado). Referencias `TV-2026-0001` y `TV-2026-0002`, correlativas. Las filas de prueba se borraron después (API REST, `service_role`); la tabla quedó vacía otra vez.
  - **Doble envío probado en los dos sentidos:** un triple clic simultáneo en "Finalizar" (a) contra una inserción que iba a fallar (ver más abajo) dejó exactamente 2 intentos en el log del servidor (1 del triple clic + 1 de un reintento explícito, nunca 3); (b) contra una inserción que sí tuvo éxito, Supabase terminó con **exactamente 1** fila (verificado por correo de contacto único, no 3).
  - **Defecto real encontrado y corregido:** el aviso "Antes de finalizar" del paso 8 (`components/quote/QuoteSteps.tsx`) seguía diciendo, literalmente, "no se guarda ni se envía ninguna información" — texto de M9 que ya no era cierto. Se corrigió para que diga que sí se guarda y que se entrega un número de referencia, sin prometer plazos.
- `[x]` `QuoteSuccess` con título, texto, número de solicitud dinámico y CTAs.
  - Reemplaza el panel provisional de M9. Título "Tu solicitud fue enviada"; texto: guardamos tu solicitud con el número **TV-2026-####**, nuestro equipo la revisará y contactará por el medio elegido — sin comprometer un plazo. Muestra el mismo resumen de solo lectura de antes (sin botones "Editar": la solicitud ya quedó guardada, no tiene sentido "deshacerla" desde ahí). CTAs tal como se pidieron: "Volver al inicio" (`/`) y "Explorar destinos" (`/destinations`); ya no está "Volver a editar" del panel provisional. Refuerzo de accesibilidad: además de mover el foco al `<h2>` (como en el resto del asistente), un `role="status"` oculto anuncia "Solicitud enviada. Número de referencia …".
- `[x]` Estados de la UI al enviar.
  - El botón "Finalizar solicitud" usa `useTransition`: mientras envía dice "Enviando…" y queda `disabled` (también los botones "Anterior" y los del indicador de pasos, para que no se pueda navegar a mitad de un envío). Un cerrojo síncrono (`useRef`) evita que un triple clic dispare más de un envío real aunque `isSubmitting` tarde un render en actualizarse (confirmado arriba: nunca más intentos de los esperados). Si falla, aparece un mensaje amable en una caja `role="alert"` (con foco) y el botón pasa a decir "Reintentar" — nunca el detalle técnico de Postgres/Supabase, que solo se registra con `console.error` en el servidor. Un `role="status"` oculto anuncia "Enviando tu solicitud…" para quien usa lector de pantalla.
  - **Probado con un fallo real, no simulado:** la `SUPABASE_SERVICE_ROLE_KEY` de `.env.local` resultó estar mal pegada (no decodificaba como JWT) al llegar a este punto; con esa clave rota, un envío real chocó contra un 401 de Supabase de verdad. La UI mostró el mensaje genérico ("No pudimos enviar tu solicitud. Inténtalo de nuevo en unos minutos."), sin ningún rastro de "Invalid API key"/Postgrest/JWT en el DOM, la consola ni las respuestas visibles para el navegador; "Reintentar" volvió a funcionar. El usuario corrigió la clave (Supabase → Project Settings → API) y, ya con la clave válida, se repitió todo el flujo de éxito (ver el punto anterior).
- `[x]` Sin promesas de tiempos de respuesta si no están definidas.
  - Ni el panel de éxito ni el aviso "Antes de finalizar" mencionan plazos ("en 24 horas", "pronto", etc.); se verificó con una expresión regular sobre el texto real de la página, no solo por lectura.

**Verificación:** enviar una cotización de prueba y confirmar que se persiste (o que la demo no finge persistencia); revisar el registro creado.
- `npm run lint` y `npm run build` con exit 0 (46 rutas, sin cambios en el árbol).
- Regresión sobre el código final: lógica 83/27/17/118; M1 41, M2 37, M3 54, M4 79, M5 51, M6 56, M7 42, M8 34, **M9 138/138** (se actualizó su batería: el paso 8 ahora guarda de verdad — antes probaba que "no se guarda nada" — y "Volver a editar" ya no existe en el panel final).
- Se confirmó, con la `service_role` key, que la `SUPABASE_SERVICE_ROLE_KEY` nunca llega a `.next/static` (además de la prueba de `server-only` del prerequisito) ni aparece el nombre de ninguna tabla en el bundle de cliente; sí aparece (como se espera) el `createServerReference` opaco que React genera para invocar la Server Action desde el navegador.
- **Decisión mía:** no fabriqué un ataque de POST directo a la Server Action con un payload manual (el protocolo de invocación de React no es un JSON simple; reproducirlo a mano no valía el esfuerzo frente a que `validateAll` — ya con 118+138 pruebas — es la misma lógica que corre en el servidor). El saneado nuevo (`sanitize()`/`resolveItem()` en `lib/quote-submit.ts`) es código de tipado/whitelist simple, revisado a mano y ejercitado por los envíos reales de arriba.
- No probado: el panel admin (M12) todavía no existe para leer estas cotizaciones "a mano" desde la UI del sitio; por ahora solo se leen por fuera, con la API REST de Supabase.
- Confirmación del usuario (2026-09-23): "si funciona lo de quote y excelente, continua el siguiente milestone". Con eso M9 y M10 pasan a `[x]`.

---

### M11 — Booking info, condiciones, formas de pago y newsletter `[>]`
- `[x]` `/booking-info` (cambios y modificaciones, email configurable, advertencia de condiciones, datos solicitados, CTA).
  - `app/booking-info/page.tsx`: aclara que `/quote` envía una **solicitud** (no una reserva confirmada) y menciona el número de referencia real de M10 (`TV-2026-####`); "Cambios y modificaciones" con el canal de contacto configurable (`ContactChannel`) y la lista de datos que conviene tener a mano (incluida la referencia); "Formas de pago" (`PaymentMethods`); "Antes de confirmar" enlaza a `/terms#cambios`; CTA a `/quote`.
- `[x]` Sección de **Condiciones importantes** (precios/imágenes ilustrativas/penalidades) editable, visible en detalle y footer.
  - Reutiliza `importantInfo`/`conditions` de `config/packages.ts` (M5, sin cifras ni penalidades exactas — nadie las definió) en vez de redactarlos dos veces: ahora también en `/terms` (con `BulletList`, extraído a `components/ui/BulletList.tsx` para no duplicarlo) y, condensados en una frase, en el pie de página de **todo el sitio** (franja nueva en `components/Footer.tsx`, con enlace a `/terms`). Las "penalidades" siguen sin monto ni porcentaje: se dice que existen y dependen de cada proveedor, nunca un número inventado.
- `[x]` `/terms` y `/privacy`.
  - `/terms`: alcance (cotización ≠ reserva), precios/fechas/disponibilidad (`importantInfo`), cambios/cancelaciones/penalidades (`conditions` + una frase propia), una nota sobre los eventos de ejemplo (coherente con "Ejemplo ilustrativo" de M7), y enlaces a `/privacy` y `/booking-info`. **Decisión mía:** no incluí una cláusula de "ley aplicable/jurisdicción" — es una decisión legal del negocio, no algo que deba inventar; se puede agregar cuando se confirme.
  - `/privacy`: qué junta de verdad el formulario de `/quote` (nombre, correo, teléfono, medio de contacto, destino, fechas, adultos/niños con edad, preferencias, presupuesto, notas — la lista real de `QuoteState`, no una genérica) y aclara que el newsletter **todavía no guarda nada** (coherente con `NewsletterForm`); dónde se guardan (nombra a Supabase, sin ocultar el proveedor real); aclara que no hay cookies de seguimiento ni analítica (verificado: no hay ningún script de analítica en el repo); derechos (acceso/corrección/eliminación vía el canal configurable); sin plazos de retención inventados.
- `[x]` `PaymentMethods` configurable (sin logos de bancos hasta autorización).
  - `config/payments.ts` (`paymentMethods: PaymentMethod[]`, solo texto) + `components/PaymentMethods.tsx`. Vacío por defecto — no inventé formas de pago sin confirmar; mientras esté vacío, `/booking-info` dice "Todavía no tenemos formas de pago publicadas aquí" en vez de mostrar una lista inventada.
- `[x]` `NewsletterForm` con validación de email y confirmación (sin fingir almacenamiento si no hay backend).
  - Adelantado y verificado en M2 (`components/NewsletterForm.tsx`): valida vacío, formato y espacios; un correo válido informa que no se guarda. Ahora que sí hay backend (Supabase, desde M10) sigue sin conectarse a propósito: no hay una tabla de suscriptores ni se pidió crear una en este milestone; queda anotado como pendiente si se quiere activar más adelante.

**Verificación:** email de reservas viene de variable de configuración (no del sitio de referencia); newsletter valida email.
- **Decisión mía:** agregué `siteConfig.contact.reservationsEmail` (CLAUDE.md ya distinguía "email de reservas" del contacto general) con reintento a `contact.email` y, si tampoco hay, a `/contact` (`components/ContactChannel.tsx`). Hoy los dos están en `null`, así que `/booking-info`, `/terms` y `/privacy` remiten a `/contact` — se verificó ese camino porque es el real hasta que se configure un correo.
- `npm run lint` y `npm run build` con exit 0; `/booking-info`, `/terms` y `/privacy` salen como rutas estáticas (`○`) nuevas. Navegador (`m11-test.js`, Edge headless): **38/38** — encabezados sin saltos, migas, el contenido real de cada página (con las cifras leídas de `config/packages.ts`, no copiadas a mano en el test), ausencia de plazos/jurisdicción/formas de pago inventadas, la franja del footer en la Home y en otra página cualquiera, 375 px sin desbordamiento en las tres páginas nuevas, y una regresión específica de que el detalle de paquete no se rompió al extraer `BulletList`.
- Regresión completa sobre el código final: lógica 83/27/17/118; M1 41, M2 37, M3 54, M4 79, M5 51, M6 56, M7 42, M8 34, M9 138. Sin cambios necesarios en ninguna batería vieja (M11 no tocó nada que ya estuvieran probando, solo agregó rutas y extrajo un componente).
- **Pendiente (tuyo):** revisión visual de `/booking-info`, `/terms`, `/privacy` y de la franja nueva del footer (aparece en todo el sitio).

---

### M12 — Panel administrativo `[>]`
Decisión del usuario (2026-11-18): **por fases**. Fase 1 = login + protección + dashboard + cotizaciones (ya están en Supabase). Fase 2 = migrar el catálogo (`data/*.ts`) a Supabase y su CRUD. Acceso: **lista de correos** en `ADMIN_EMAILS`.
- `[>]` Reutilizar el patrón de auth existente; proteger todas las rutas `/admin/*`.
  - No había patrón previo: Supabase Auth (correo + contraseña) con `@supabase/ssr`. `proxy.ts` (matcher `/admin`, `/admin/:path*`) refresca la sesión y, sin sesión, redirige a `/admin/login?next=…` (optimista). La barrera real es `lib/admin/auth.ts`: `getAdminUser()` (`auth.getUser()`, validado contra Supabase, + correo en `ADMIN_EMAILS`; vacía = nadie entra) y `requireAdmin()`, llamados en **cada** página, en cada función de `lib/admin/quotes.ts` y en cada Server Action (`app/admin/actions.ts`). `next` solo acepta rutas `/admin…` (sin `//`, `\`, URLs absolutas). Login con un único mensaje para credenciales malas / cuenta no autorizada y otro para Supabase caído. Panel sin Header/Footer públicos (`components/HideOnAdmin.tsx`), `noindex` (metadata + `X-Robots-Tag`) y `Cache-Control: private, no-store`.
  - Verificado en navegador (`next start`): `/admin`, `/admin/quotes?status=Nueva` y un detalle redirigen al login conservando la ruta; `next=//evil.com`, `https://evil.com`, `/\evil.com` y `/admin/login` se reducen a `/admin`; login vacío → "Escribe tu correo y tu contraseña."; correo no autorizado → mensaje genérico; correo autorizado con Supabase inalcanzable → "No pudimos conectar…" y el detalle solo en el log; Home sigue con header y footer.
  - **Falta:** probar con una sesión real (login correcto, cookie, salir). Imposible hoy: el proyecto de Supabase no existe.
- `[>]` Dashboard con métricas (cotizaciones nuevas/en revisión/enviadas, paquetes activos, destinos, experiencias, próximos eventos, consultas recientes).
  - `app/admin/(panel)/page.tsx`: Nueva / En revisión / Propuesta enviada destacadas (enlazan al listado filtrado), el resto de estados + total, 5 consultas recientes, y el catálogo desde la base (publicados por tipo + cuántos sin publicar, próximos eventos publicados con fecha ≥ hoy + cuántos "con fecha por confirmar"). Si Supabase falla, aviso propio (`DataUnavailable`). Compila; **sin probar con datos reales** (mismo bloqueo).
- `[>]` Gestión de paquetes (crear, editar, publicar/despublicar, destacar, archivar, duplicar, imágenes, destino, inclusiones, temporadas, precio/consulta, disponibilidad).
  - **Fase 2 (2026-11-18).** Catálogo movido a la tabla `catalog_items` (`supabase/migrations/m12-catalog.sql`, con la semilla de los 34 elementos de `data/*.ts` generada desde esos archivos). El sitio lee con `getCatalog()` (`lib/catalog/read.ts`; caché con etiqueta, respaldo en `data/` si la base falla). Panel: `/admin/catalog/packages` (activos / archivados), `/new` y `/<slug>`: formulario con todos los campos del tipo (precio vacío = "Consultar precio"; vuelos/traslados/excursiones Sí / No / Sin confirmar; incluye, no incluye, opcionales, itinerario y preguntas propias; temporada, próxima salida, disponibilidad, régimen; destino visible + destino enlazado; tipos; destacado, etiqueta, popularidad, orden), botones Publicar / Despublicar / Archivar / Restaurar / Duplicar (copia sin publicar `<slug>-copia`) y "Ver en el sitio". Al guardar se invalida la caché y las páginas estáticas.
  - **Imágenes: solo la ruta** de una foto que ya esté en `public/images/` (validada: `/images/...` y extensión de imagen). **No hay subida de fotos** desde el panel: haría falta Supabase Storage + `images.remotePatterns`; pendiente si se quiere.
  - Las rutas `[slug]` pasaron a dinámicas (`force-dynamic`) para que un elemento nuevo funcione sin recompilar. Verificado: variantes en mayúsculas y slugs inventados no escriben archivos en `.next/server/app` y `bolivia.html` sigue entero (72 KB).
  - Verificado: lint y build limpios; lógica (`normalize` + `forms`, transpilada y probada aislada) **136/136**: ida y vuelta sin cambios de los 34 elementos de la semilla, paquete completo, precio vacío → `null`, errores sin datos inventados (número/fecha/ruta inválidos, pregunta sin respuesta, slug reservado `new`/`bolivia`), slug fijo al editar, filas raras de la base normalizadas. Navegador con la base caída: 20 URLs públicas y del panel con el código correcto en ≤ 151 ms (antes del arreglo: ~7 s por página por los reintentos de postgrest-js).
  - **Falta:** probar el panel con sesión (crear/editar/publicar/duplicar y verlo en el sitio). Mismo bloqueo de Supabase.
- `[>]` Gestión de destinos, experiencias y eventos.
  - Mismo panel genérico (`/admin/catalog/destinations|experiences|events`) con sus campos: destinos (alcance, país, tipos, destacado, textos, foto, galería), experiencias (categorías, lugar, duración, disponibilidad, incluye, destacada), eventos (categoría, estado del evento, "ejemplo ilustrativo" marcado por defecto, ciudad, fecha, duración, incluye). Mismo estado de verificación y bloqueo que paquetes.
- `[>]` Gestión de cotizaciones con tabla + cambio de estado (Nueva → En revisión → Contactado → Propuesta enviada → Confirmada → Cerrada → Cancelada).
  - Los 7 estados: `supabase/schema.sql` (bases nuevas) + `supabase/migrations/m12-quote-statuses.sql` (base existente: cambia el `check`, pasa 'Enviada' → 'Propuesta enviada', agrega índices) + `QUOTE_STATUSES` en `lib/supabase/types.ts`. `/admin/quotes`: tabla paginada (25), filtro por estado y búsqueda por referencia/nombre/correo/destino (texto saneado antes del `or()` de PostgREST). `/admin/quotes/[id]`: todos los datos con etiquetas legibles (`lib/admin/labels.ts`) y formulario de estado (Server Action que valida uuid + estado, `?saved=1` / `?error=1`). Se puede elegir cualquier estado (no obliga al orden). Compila; **sin probar con datos reales**.

**Verificación:** login obligatorio; crear/editar un paquete y verlo reflejado; cambiar el estado de una cotización de prueba.
- `npm run lint` y `npm run build` con exit 0 (2026-11-18); las 4 rutas `/admin…` salen dinámicas (`ƒ`) y el proxy aparece en el build.
- **Pasos tuyos para desbloquear:** (1) restaurar el proyecto de Supabase o crear uno nuevo y poner sus claves en `.env.local`; (2) en el SQL Editor: proyecto nuevo → `supabase/schema.sql` y luego `supabase/migrations/m12-catalog.sql`; proyecto restaurado → `supabase/migrations/m12-quote-statuses.sql` y luego `m12-catalog.sql`; en ambos casos, al final, `supabase/migrations/m14-likes.sql` (botón "Me gusta"); (3) Authentication → Users → Add user (correo + contraseña); (4) ese correo en `ADMIN_EMAILS=` de `.env.local`; (5) reiniciar el servidor (o volver a compilar).

---

### M13 — Calidad transversal: accesibilidad, SEO, estados, responsive, seguridad `[>]`
Auditoría automática (2026-11-18): `m13-audit.mjs` (Edge sin ventana + puppeteer-core + axe-core 4, instalados en el scratchpad, **no en el repo**) contra `next start`: 23 URLs × 3 anchos (320 / 768 / 1280). Primera pasada: 46 avisos, de los que 2 eran reales (corregidos abajo); el resto, ruido del propio script (304 de caché y el 400 de las fotos de galería opcionales que no existen). Segunda pasada sobre el código final: **643/643 comprobaciones sin problemas**, 83 enlaces internos y 43 URLs del sitemap.
- `[>]` Accesibilidad: alt en imágenes, labels visibles, `aria-label` en botones-ícono, focus visible, navegación por teclado, `aria-live` en éxito/error, contraste, Escape para cerrar modales, foco atrapado en modales.
  - axe (WCAG 2.0/2.1/2.2 A y AA + buenas prácticas) sin violaciones en las 23 URLs públicas + login. Corregido: (1) **enlaces dentro de texto** solo se distinguían por color (axe "serious", 1.4.1) → ahora siempre subrayados (páginas de M11/M13, `ContactChannel` y la franja del pie); (2) **casillas y radios de 20 px** en `/quote` → 24 px (2.5.8; también en el formulario del panel). Todas las imágenes con `alt`, un solo `h1` por página, `lang="es"`. Teclado, Escape y foco atrapado en el menú y los modales ya se verificaron en M1/M5/M9 (sin cambios desde entonces).
  - **Falta:** auditar las páginas del panel con sesión (bloqueo de Supabase) y la revisión con lector de pantalla real.
- `[x]` SEO: titles/descriptions por página, metadata dinámica de paquetes/destinos/experiencias, sitemap, Open Graph, URLs legibles, `noindex` en admin y páginas vacías.
  - `lib/seo.ts` (`pageMetadata`, `metaDescription`, `hasQuery`, `siteUrl`): título con plantilla "%s | Mundo Viajero", descripción, canónica, Open Graph (con la foto del elemento) y Twitter en todas las páginas; `generateMetadata` en los tres `[slug]`. `metadataBase` sale de **`NEXT_PUBLIC_SITE_URL`** (hay que configurarla en producción; sin ella usa localhost). `app/sitemap.ts` (fijas + destinos/paquetes/experiencias publicados) y `app/robots.ts` (excluye `/admin`). `noindex, follow` en listados filtrados (`/packages?…`, `/experiences?category=…`, `/events?category=…`) y en `/quote` precargado; el 404 lo trae de Next; el panel ya lo tenía.
  - Pendiente de M3 resuelto: `/destinations/CARTAGENA`, `/packages/CARTAGENA-CARIBE` y `/experiences/VISITA-GUIADA` tienen canónica en minúsculas (verificado).
  - Verificado: todas las páginas indexables tienen descripción, canónica igual a su ruta y `og:image`; sin títulos repetidos; las 43 URLs del sitemap responden 200.
- `[>]` Estados especiales: catálogo vacío, búsqueda sin resultados, error, paquete no disponible, imagen faltante.
  - Nuevo `app/error.tsx` (mensaje propio + código `digest`, botón "Intentar de nuevo" con `retry`) y `app/global-error.tsx`. Catálogo vacío: la Home oculta las secciones sin elementos (y acota las muestras: con el panel las listas pueden crecer) y `/destinations` y `/destinations/bolivia` muestran un aviso con enlace a cotizar. Búsqueda sin resultados: ya existía (M4/M6/M7), probado con `/packages?destination=zzzz`. Paquete despublicado o inexistente: 404 en español. Imagen faltante: `SafeImage` (M2).
  - `/about` y `/contact` **eran todavía páginas provisionales** ("Sección en construcción") aunque están en el menú: ahora tienen contenido real sin datos inventados. `/contact` muestra solo los canales de `config/site.ts` (hoy ninguno) y remite al formulario de cotización, el único canal que guarda de verdad; el texto de `ContactChannel` ya no promete un "formulario de contacto" que no existe. `components/PlaceholderPage.tsx` borrado (sin usos).
  - **Falta:** ver `error.tsx` en acción (no hay forma limpia de provocar un error en producción sin tocar código).
- `[>]` Responsive verificado en desktop / tablet / móvil, sin overflow horizontal, sin depender de hover en móvil.
  - Sin desborde horizontal en las 23 URLs a 320, 768 y 1280 px; objetivos táctiles ≥ 24 px a 320 px. **Falta tu revisión visual** en los 3 tamaños.
- `[>]` Seguridad: sin claves privadas en frontend, RLS en tablas, inserción pública limitada, admin protegido, sanitizar entradas, no exponer errores técnicos de la base.
  - Verificado: la clave `service_role` no aparece en ninguno de los 33 archivos de `.next/static` (búsqueda del valor real, sin imprimirlo); `admin.ts` es `server-only`. RLS: cotizaciones solo INSERT público; catálogo solo SELECT de lo publicado; escrituras del panel con service_role tras `requireAdmin`. Entradas saneadas en servidor (`quote-submit`, `lib/catalog/*`, búsqueda del panel). Errores de la base solo en el log. Cabeceras nuevas en `next.config.ts`: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, CSP mínima (`frame-ancestors 'none'`, `base-uri`, `form-action`, `object-src`), `Permissions-Policy`, sin `X-Powered-By` (verificado en la respuesta). Sin CSP completa a propósito (los scripts en línea de Next exigirían nonces).
  - **Falta:** probar el panel con sesión real (bloqueo de Supabase).
- `[x]` `npm run lint` y `npm run build` sin errores; sin enlaces ni imágenes rotas.
  - Lint y build con exit 0 sobre el código final; 0 enlaces internos rotos (83), 0 imágenes rotas en 69 cargas. Las fotos de galería opcionales que faltan muestran el fallback (esperado, M-IMG).

**Verificación:** recorrer criterios de aceptación del prompt uno por uno; correr lint y build limpios; revisión visual en los 3 breakpoints. **La revisión visual final queda pendiente de confirmación manual del usuario (no marcar `[x]` solo porque compila).**

---

### M-IMG — Sourcing de imágenes (⚠️ TE INVOLUCRA A TI) `[>]`

Este milestone lo hacés **vos**: descargar cada imagen y guardarla en la ruta indicada dentro de `/public/images/...`. El agente debe implementar `next/image`, lazy loading, `alt` descriptivo y **fallback visual** para que, mientras las imágenes no estén, la página no muestre íconos rotos.

**Recomendación importante:** descargá de bancos gratuitos con licencia libre (**Unsplash, Pexels, Pixabay**) para evitar problemas de derechos. Formato ideal **WebP o JPG optimizado**. Agregá el nombre del banco a la búsqueda para filtrar en Google Images.

**Criterios**
- `[x]` Crear la estructura de carpetas en `/public/images/`.
  - Hecho en M0; ya contiene las imágenes.
- `[x]` Descargar y ubicar todas las imágenes de la tabla de abajo.
  - Verificado (2026-09-20): las **44 de 44** de la tabla existen con el nombre exacto que usa el código (2 generales, 8 categorías, 8 destinos internacionales, 10 de Bolivia, 6 paquetes, 7 experiencias, 3 eventos). Todas son JPEG válidos y legibles.
- `[>]` Optimizar (convertir a WebP / comprimir).
  - **Al visitante ya le llega optimizado:** Next las sirve como WebP redimensionado (medido a 1080 px: 44/44 con estado 200, total 3,8 MB, máximo 264 KB por imagen, ≤ 0,6 s en frío). Lo que **no** está optimizado son los originales del repositorio: **92,4 MB en total**, con `playa-resorts.jpg` (11 MB), `travel-hero.jpg` (9,7 MB), `grandes-ciudades.jpg` (8 MB), `cartagena.jpg` (7 MB) y otras 9 de más de 2,5 MB (hasta 4 000 px de lado). Conviene reducirlas (p. ej. ≤ 2 400 px de ancho y calidad ~80: unos 15–20 MB en total) para que el repo y los despliegues no pesen tanto. Pendiente de que decidas si lo hago yo (sin tocar tus originales hasta que lo confirmes) o lo haces tú.
  - **Resolución insuficiente** (medida a 1280 px de pantalla; en pantallas retina el efecto se duplica). Banners de detalle de destino, que ocupan todo el ancho (recomendado ≥ 1 600 px de ancho): `bolivia/samaipata` 442 px (se estira 2,9×), `punta-cana` 500 (2,6×), `bolivia/sucre` 516 (2,5×), `bolivia/potosi` 516 (2,5×), `bolivia/madidi` 550 (2,3×), `bolivia/titicaca` 611 (2,1×), `bolivia/chiquitania` 677 (1,9×), `rio-de-janeiro` 798 (1,6×) y `newsletter-cta` 801 (1,6×; fondo oscurecido, se nota menos). Fotos principales de paquete (se muestran a ~650 px; recomendado ≥ 1 300): `cartagena-caribe` 397 px (1,6×, vertical), `orlando-parques` 498 (1,3×), `rio-de-janeiro` 559 (1,2×). El resto está bien (`uyuni`, `tarija`, `santa-cruz` y `rurrenabaque` de Bolivia rondan 1 200 px: 1,0×).
- `[x]` Verificar que ninguna imagen quede rota y que cada una tenga su `alt`.
  - Auditado (2026-09-20) en navegador: 29 páginas con fotos (Home, listas, los 18 destinos, los 6 paquetes), 113 `<img>`: **0 rotas de verdad**, **0 sin atributo `alt`**, 0 errores del optimizador y sin overflow. Las 6 "rotas" que marcó la auditoría son la foto del visor de zoom dentro de su `<dialog>` cerrado (carga perezosa; carga al abrirlo, verificado en M5). El fallback solo aparece donde falta una foto **opcional** (galerías).
  - `alt`: las imágenes decorativas (hero, categorías, newsletter, banner de destino) llevan `alt=""` a propósito y las tarjetas "Imagen ilustrativa de …". Si prefieres textos descriptivos por foto, es un ajuste de datos.
- `[ ]` (Opcional, agregado en M3) Galería de destinos: 3 fotos por destino en `/public/images/destinations/<slug>/1.jpg … 3.jpg` y, para los nacionales, `/public/images/destinations/bolivia/<slug>/1.jpg … 3.jpg`. Si faltan, la página de detalle muestra el fallback.
- `[ ]` (Opcional, agregado en M3) Galería de destinos: 3 fotos por destino en `/public/images/destinations/<slug>/1.jpg … 3.jpg` y, para los nacionales, `/public/images/destinations/bolivia/<slug>/1.jpg … 3.jpg`. Si faltan, la página de detalle muestra el fallback.
- `[ ]` (Opcional, agregado en M5) Galería de paquetes: además de `packages/<slug>/main.jpg`, hasta 4 fotos secundarias `packages/<slug>/1.jpg … 4.jpg` por paquete (los 6 slugs de la tabla de paquetes). Si faltan, el detalle muestra el fallback.

#### Frases para buscar en Google (Imágenes)

**Hero y generales**

| Ruta destino | Frase de búsqueda |
|---|---|
| `/public/images/travel-hero.jpg` | `playa tropical turquesa vista aérea persona viajando Unsplash` |
| `/public/images/newsletter-cta.jpg` | `pareja mirando mapa planificando viaje aeropuerto Pexels` |

**Categorías** → `/public/images/categories/`

| Ruta destino | Frase de búsqueda |
|---|---|
| `categories/playa-resorts.jpg` | `resort playa piscina infinita palmeras Unsplash` |
| `categories/grandes-ciudades.jpg` | `skyline ciudad moderna rascacielos atardecer Unsplash` |
| `categories/aventura-naturaleza.jpg` | `senderismo montaña mochilero naturaleza aventura Pexels` |
| `categories/cultura-historia.jpg` | `arquitectura histórica casco antiguo turista cultura Unsplash` |
| `categories/parques-tematicos.jpg` | `montaña rusa parque temático familia diversión Pixabay` |
| `categories/eventos-conciertos.jpg` | `concierto multitud luces escenario noche Unsplash` |
| `categories/viajes-familiares.jpg` | `familia con niños vacaciones playa felices Pexels` |
| `categories/escapadas-nacionales.jpg` | `paisaje andino altiplano Bolivia naturaleza Unsplash` |

**Destinos internacionales** → `/public/images/destinations/`

| Ruta destino | Frase de búsqueda |
|---|---|
| `destinations/cartagena.jpg` | `Cartagena Colombia ciudad amurallada colonial colorida Unsplash` |
| `destinations/cancun.jpg` | `Cancún playa caribe aguas turquesa resort Unsplash` |
| `destinations/punta-cana.jpg` | `Punta Cana playa palmeras todo incluido República Dominicana Pexels` |
| `destinations/miami.jpg` | `Miami South Beach skyline art deco palmeras Unsplash` |
| `destinations/orlando.jpg` | `Orlando Florida parque temático castillo Unsplash` |
| `destinations/dubai.jpg` | `Dubái skyline Burj Khalifa desierto rascacielos Unsplash` |
| `destinations/estambul.jpg` | `Estambul mezquita azul Bósforo atardecer Unsplash` |
| `destinations/rio-de-janeiro.jpg` | `Río de Janeiro Cristo Redentor Pan de Azúcar playa Unsplash` |

**Destinos nacionales (Bolivia)** → `/public/images/destinations/bolivia/`

| Ruta destino | Frase de búsqueda |
|---|---|
| `bolivia/uyuni.jpg` | `Salar de Uyuni Bolivia reflejo espejo cielo Unsplash` |
| `bolivia/chiquitania.jpg` | `Chiquitania Bolivia misiones jesuíticas iglesia naturaleza` |
| `bolivia/titicaca.jpg` | `Lago Titicaca Isla del Sol Bolivia paisaje andino Unsplash` |
| `bolivia/rurrenabaque.jpg` | `Rurrenabaque Amazonía boliviana selva río fauna` |
| `bolivia/samaipata.jpg` | `Samaipata Bolivia El Fuerte ruinas paisaje verde` |
| `bolivia/madidi.jpg` | `Parque Madidi Bolivia selva amazónica biodiversidad` |
| `bolivia/tarija.jpg` | `Tarija Bolivia viñedos valle paisaje` |
| `bolivia/sucre.jpg` | `Sucre Bolivia ciudad blanca arquitectura colonial` |
| `bolivia/potosi.jpg` | `Potosí Bolivia Cerro Rico ciudad colonial` |
| `bolivia/santa-cruz.jpg` | `Santa Cruz de la Sierra Bolivia ciudad plaza moderna` |

**Paquetes** → `/public/images/packages/<slug>/main.jpg` (+ 3–4 de galería con mismo criterio)

| Ruta destino | Frase de búsqueda |
|---|---|
| `packages/cartagena-caribe/main.jpg` | `Cartagena playa ciudad amurallada atardecer turismo Unsplash` |
| `packages/orlando-parques/main.jpg` | `Orlando parque temático atracciones familia Pexels` |
| `packages/punta-cana-todo-incluido/main.jpg` | `Punta Cana hotel todo incluido playa tumbonas Unsplash` |
| `packages/salar-de-uyuni/main.jpg` | `Salar de Uyuni tour 4x4 paisaje sal Bolivia` |
| `packages/rio-de-janeiro/main.jpg` | `Río de Janeiro Copacabana playa ciudad Unsplash` |
| `packages/dubai-ciudad-del-futuro/main.jpg` | `Dubái safari desierto dunas skyline noche Unsplash` |

**Experiencias** → `/public/images/experiences/` (una por experiencia)

| Ruta destino | Frase de búsqueda |
|---|---|
| `experiences/visita-guiada.jpg` | `guía turístico grupo visita cultural ciudad Pexels` |
| `experiences/tour-estadio.jpg` | `tour estadio fútbol gradas cancha vacía Unsplash` |
| `experiences/paseo-gondola.jpg` | `paseo góndola canal Venecia turistas Unsplash` |
| `experiences/visita-museo.jpg` | `museo interior galería obras de arte visitantes Pexels` |
| `experiences/paseo-barco.jpg` | `paseo en barco río ciudad turismo atardecer Unsplash` |
| `experiences/excursion-isla.jpg` | `excursión isla playa lancha navegación día soleado Pexels` |
| `experiences/chiva-rumbera.jpg` | `chiva rumbera bus colorido fiesta noche Colombia` |

**Eventos** → `/public/images/events/`

| Ruta destino | Frase de búsqueda |
|---|---|
| `events/concierto-internacional.jpg` | `concierto estadio multitud luces show noche Unsplash` |
| `events/festival-musica.jpg` | `festival de música al aire libre público escenario Pexels` |
| `events/parque-tematico.jpg` | `parque temático atracción familia día soleado Pixabay` |

**Verificación:** todas las rutas de la tabla existen con su archivo; el agente confirma que ninguna queda rota y que el fallback funciona donde todavía no cargaste imagen.

---

## Changelog

| Fecha | Cambio |
|---|---|
| _(sin fecha)_ | Versión inicial de TASK.md creada con M0–M13 y M-IMG. |
| 2026-09-18 23:47 | Metodología por milestones establecida: `CLAUDE.md` reescrito (proyecto, stack, comandos, convenciones, reglas de trabajo); reglas duplicadas removidas de `TASK.md`. |
| 2026-09-18 23:47 | M0: inspección del stack completada (`[x]`); `npm run lint` y `npm run build` pasan sobre el boilerplate. M0 pasa a `[>]`. |
| 2026-09-19 00:01 | M0: tokens `--travel-*` en `globals.css` (3 ajustados por contraste) expuestos vía `@theme`; modo oscuro de la plantilla eliminado. |
| 2026-09-19 00:01 | M0: `font-family: Arial` removido de `body` (Geist queda como fuente global); `layout.tsx` con `lang="es"` y metadata de Mundo Viajero. |
| 2026-09-19 00:01 | M0: creadas las 14 rutas placeholder (`PlaceholderPage`; `[slug]` con `await props.params`), `data/` con 4 entidades y carpetas `public/images/` con `.gitkeep`. |
| 2026-09-19 00:01 | M0: verificado lint y build en exit 0, 14 rutas con 200 en servidor de producción (404 en control negativo). Criterios en `[x]`; M0 sigue `[>]` hasta la confirmación visual del usuario. |
| 2026-09-19 00:04 | M0 cerrado (`[x]`) tras la confirmación visual del usuario. Foco pasa a M1. |
| 2026-09-19 00:15 | M1: `config/site.ts` (marca, navegación, footer; contacto y redes vacíos), `Logo`, `Header` (sticky, scroll, link activo, menú móvil accesible) y `Footer` de 4 columnas montados en `layout.tsx`; foco visible global y `scroll-padding-top` en `globals.css`. |
| 2026-09-19 00:15 | M1: verificado en navegador (Edge + puppeteer, 41/41), lint y build en exit 0. Criterios `[x]`; M1 sigue `[>]` hasta la confirmación visual del usuario. |
| 2026-09-19 00:21 | M1 (bug): el menú móvil no abría al usar `npm run dev` desde el celular por IP de red (Next 16 bloqueaba los recursos de dev y no había hidratación). Añadido `allowedDevOrigins: ["192.168.*.*"]` en `next.config.ts`; verificado con toque emulado en dev (localhost e IP) y producción. |
| 2026-09-19 00:27 | M1 cerrado (`[x]`) tras la confirmación del usuario de que el menú móvil funciona. Foco pasa a M2. |
| 2026-09-19 00:45 | M2: Home completa (hero, buscador, categorías, destinos, paquetes, experiencias, beneficios, eventos, Bolivia, newsletter y CTA final), con datos de demostración en `data/`, tarjetas reutilizables y `SafeImage` (fallback sin imagen rota). |
| 2026-09-19 00:45 | M2: verificado en navegador (37/37 + corrida con fotos temporales), lint y build exit 0. Criterios `[x]`; M2 sigue `[>]` hasta la confirmación visual del usuario. Adelantos anotados en M3, M4, M6, M7, M8 (`[>]`) y M11 (`[x]`, NewsletterForm). |
| 2026-09-19 03:56 | M2 cerrado (`[x]`) tras la confirmación del usuario. Foco pasa a M3. |
| 2026-09-19 04:11 | M3: `/destinations` (8 internacionales + 10 nacionales), `/destinations/[slug]` estático para los 18 destinos (descripción, tipo de experiencia, galería, CTA de consulta), `app/not-found.tsx` en español y `PageHeader`; `data/destinations.ts` ampliado. |
| 2026-09-19 04:11 | M3 (bug): `/destinations/CARTAGENA` hacía que Next guardara una 404 sobre el HTML prerenderizado de Cartagena. Corregido con `slug.toLowerCase()`; verificado incluso tras reiniciar el servidor. `dynamicParams = false` mantenido (medido: sin él se escriben archivos por cada slug inventado). |
| 2026-09-19 04:11 | M3: verificado en navegador (55/55 sin fotos, 53/53 con fotos temporales), lint y build exit 0. Criterios `[x]`; M3 sigue `[>]` hasta la confirmación visual del usuario. Anotados pendientes en M0, M8, M13 y M-IMG. |
| 2026-09-19 04:25 | M3 cerrado (`[x]`) tras la confirmación del usuario. Foco pasa a M4. |
| 2026-09-19 04:57 | M4: `/packages` con filtros, orden y estado vacío, filtrado en servidor a partir de la URL (`lib/packages.ts`), `FilterForm` en barra lateral y cajón móvil (`<dialog>`), chips de filtros activos; `PackageCard` con "incluye"/régimen/disponibilidad; modelo `TravelPackage` ampliado. Un filtro/orden solo se ofrece si el catálogo tiene datos de ese atributo. |
| 2026-09-19 04:57 | M4: verificado (lógica 66/66, navegador 79/79 con datos reales y 33/33 con catálogo completo de prueba, sin regresiones en M2/M3), lint y build exit 0. Criterios `[x]`; M4 sigue `[>]` hasta la confirmación visual del usuario. Notas en M5 y M9. |
| 2026-09-19 12:02 | M4 cerrado (`[x]`) con la aprobación condicionada del usuario ("si sale perfecto continúa"). Foco pasa a M5. |
| 2026-09-19 12:22 | M5: detalle de paquete estático para los 6 paquetes (breadcrumb, galería con miniaturas y zoom por teclado/toque, ficha con "A consultar", 9 secciones + "Sobre el destino", costos no incluidos explícitos, relacionados); modelo `TravelPackage` ampliado, `lib/format.ts`, `relatedPackages` y contenido general en `config/packages.ts`. Lo no confirmado se muestra como tal, no inventado. |
| 2026-09-19 12:22 | M5: verificado (lógica 83/83, navegador 51/51 con datos reales, 12/12 con catálogo completo, 7/7 con fotos temporales; sin regresiones en M2–M4), lint y build exit 0. Corregido el foco del visor (blanco sobre negro). Criterios `[x]`; M5 sigue `[>]` hasta la confirmación visual del usuario. Notas en M11 y M-IMG. |
| 2026-09-20 04:19 | M-IMG: el usuario subió las 44 imágenes. Verificadas: 44/44 con el nombre exacto y JPEG válidos; el optimizador las sirve como WebP (3,8 MB a 1080 px en total); auditoría de 29 páginas (113 `<img>`): 0 rotas, 0 sin `alt`. Detectados: originales de 92,4 MB (sin comprimir) y 12 fotos de baja resolución en espacios grandes (lista en M-IMG). Criterios `[x]` salvo "Optimizar" (`[>]`). |
| 2026-09-20 04:19 | M5 cerrado (`[x]`) con el "adelante" del usuario. Foco pasa a M6. |
| 2026-09-20 04:37 | M6: `/experiences` con las 10 categorías (5 deshabilitadas sin datos) y filtro `?category=`, `/experiences/[slug]` estático para las 7, `ExperienceCard` ampliada (ciudad, duración, disponibilidad, incluye, Ver experiencia / Consultar), `lib/experiences.ts` y datos de demostración con las 7 fotos reales. Lo no confirmado se muestra como "a consultar". |
| 2026-09-20 04:37 | M6: verificado (lógica 27/27, navegador 56/56 con fotos reales, 7/7 con datos completos; sin regresiones en M2–M5), lint y build exit 0. Corregido el salto de encabezados en la lista. Baterías de M2/M3 actualizadas al estado con fotos. Criterios `[x]`; M6 sigue `[>]` hasta la confirmación visual del usuario. |
| 2026-09-20 22:36 | M7 cerrado (`[x]`) tras la confirmación del usuario. Foco pasa a M8. |
| 2026-09-20 22:31 | M7: `/events` con las 6 categorías (3 deshabilitadas sin datos) y filtro `?category=`, `EventCard` ampliada (ciudad, fecha, duración, incluye, estado cerrado, "Ejemplo ilustrativo", Solicitar información → `/quote?event=`), `lib/events.ts`, `config/events.ts`, datos con las 3 fotos reales y `CategoryNav` compartido (refactor de `/experiences`). |
| 2026-09-20 22:31 | M7: verificado (lógica 17/17, navegador 42/42 con fotos reales, 5/5 con datos completos; sin regresiones en M2–M6), lint y build exit 0. Criterios `[x]`; M7 sigue `[>]` hasta la confirmación visual del usuario. Nota en M9 (`?experience=`, `?event=`). |
| 2026-09-20 22:17 | M6 cerrado (`[x]`) tras la confirmación del usuario. Foco pasa a M7. Sigue pendiente la decisión del usuario sobre comprimir los originales de M-IMG (no se tocó nada). |
| 2026-09-21 00:32 | M8: nueva `/destinations/bolivia` (`components/destinations/NationalOverview.tsx`): migas, 10 destinos nacionales con "Consulta fechas recomendadas", "Paquetes en Bolivia" (región Bolivia) y CTAs a `/quote?type=escapadas-nacionales`. Home y `/destinations` la enlazan ("Ver viajes por Bolivia"). |
| 2026-09-21 00:32 | M8: corregido un defecto real hallado por el test: `/destinations/Bolivia` caía en `[slug]`, su `notFound()` sobrescribía `bolivia.html` con el 404 (70 685 → 12 188 bytes). `[slug]` ahora renderiza la misma página para ese slug. Nota en CLAUDE.md. |
| 2026-09-21 00:32 | M8: verificado (navegador 34/34; lógica 83/27/17; M2 37, M3 54, M4 79, M5 51, M6 56, M7 42), lint y build exit 0. Criterios `[x]`; M8 sigue `[>]` hasta la confirmación visual del usuario. Tests de M2/M3 actualizados (la sección nacional ahora incluye un enlace fuera de las tarjetas; `/destinations/bolivia` ya no es 404). |
| 2026-09-21 11:05 | M8 cerrado (`[x]`) tras la confirmación del usuario. Foco pasa a M9. |
| 2026-09-21 11:05 | M9: `/quote` real (antes placeholder): `QuoteStepper` de 8 pasos con validación por paso, foco y resumen de errores accesibles, `QuoteSummary` con "Editar" por sección, precarga desde la URL (`lib/quote-entry.ts`), lógica pura en `lib/quote.ts` y configuración editable en `config/quote.ts` (tipos de solicitud, pasos, límites, perfiles de presupuesto por país/moneda sin montos inventados, contacto). Sin backend: "Finalizar" no envía ni guarda nada y lo dice (panel provisional hasta M10). |
| 2026-09-21 11:05 | M9: verificado (lógica 118/118; navegador 134/134; regresión: lógica 83/27/17, M1 41, M2 37, M3 54, M4 79, M5 51, M6 56, M7 42, M8 34), lint y build exit 0. Corregidos 2 defectos reales (campos de edad con cantidad fuera de rango; botones "Editar" de 20 px). Criterios `[x]`; M9 sigue `[>]` hasta la confirmación visual del usuario. Tests de M1 y M7 actualizados. |
| 2026-09-22 09:40 | M10 (prerequisito): integración de Supabase. Instalados `@supabase/supabase-js` y `@supabase/ssr`; tres clientes en `lib/supabase/` (`client.ts`, `server.ts`, `admin.ts`); esquema `supabase/schema.sql` (`travel_quotes`, `travel_quote_items`, RLS: INSERT público, sin SELECT público); tipos `TravelQuote`/`TravelQuoteItem` en `lib/supabase/types.ts`. `lib/quote.ts` (M9) sin cambios. Aún no se conecta el envío de `/quote`. CLAUDE.md actualizado: el backend ya no es "aún no existe", ahora es Supabase. |
| 2026-09-22 09:40 | M10 (prerequisito): verificado. lint y build exit 0 (46 rutas). Confirmado que `service_role` no llega a `.next/static`, y con una prueba directa: una página `"use client"` que importaba `admin.ts` hizo fallar el build con el error esperado de `server-only`; sin el import, build limpio (la página de prueba no quedó en el repo). Defecto de proceso hallado y corregido en el camino: había puesto la página de prueba en una carpeta `app/__algo` (prefijo `_`), que Next excluye del enrutador — no compilaba nada y daba un falso "build exit 0"; renombrada sin guion bajo para que la prueba fuera real. |
| 2026-09-23 01:05 | M10: envío real conectado. Server Action (`app/quote/actions.ts` + `lib/quote-submit.ts`) que resanea y revalida todo en el servidor (reutiliza `validateAll`/`itemsFor` de M9 sin copiarlos) e inserta en `travel_quotes`/`travel_quote_items` con `lib/supabase/admin.ts`. `QuoteStepper` reemplaza el panel provisional por el de éxito real (referencia `TV-2026-####`, CTAs "Volver al inicio"/"Explorar destinos"), con estado de carga, cerrojo anti-doble-envío y mensaje de error amable con reintento (nunca el detalle técnico de Supabase). |
| 2026-09-23 01:05 | M10: encontré y corregí 2 defectos reales: (1) la `SUPABASE_SERVICE_ROLE_KEY` del usuario no era un JWT válido (no decodificaba) — probé el camino de error contra ese fallo real de Supabase antes de que el usuario la corrigiera; (2) el aviso "Antes de finalizar" del paso 8 seguía con el texto de M9 ("no se guarda ni se envía ninguna información"), ahora falso — corregido para reflejar que sí se guarda, sin prometer plazos. |
| 2026-09-23 01:05 | M10: verificado con dos cotizaciones reales (con y sin paquete asociado) confirmadas por fuera de la app vía la API REST de Supabase con `service_role`, y con el candado anti-doble-envío probado tanto en el camino de éxito (triple clic → 1 sola fila) como en el de error (triple clic + reintento → exactamente 2 intentos, nunca 3). Filas de prueba borradas después. Regresión completa: lógica 83/27/17/118; M1 41, M2 37, M3 54, M4 79, M5 51, M6 56, M7 42, M8 34, **M9 138/138** (batería actualizada: el paso 8 ahora sí guarda). lint y build exit 0. Criterios de M10 `[x]`; el milestone sigue `[>]` hasta la revisión visual del usuario (la de M9 también seguía pendiente). |
| 2026-09-23 02:10 | M9 y M10 cerrados (`[x]`) tras la confirmación del usuario ("si funciona lo de quote y excelente, continua el siguiente milestone"). Foco pasa a M11. |
| 2026-09-23 02:10 | M11: `/booking-info`, `/terms` y `/privacy` reales (antes placeholders). Nuevo `config/payments.ts` + `components/PaymentMethods.tsx` (vacío por defecto, sin inventar formas de pago); `siteConfig.contact.reservationsEmail` + `components/ContactChannel.tsx` (cae a `/contact` mientras no haya correo configurado); `components/ui/BulletList.tsx` extraído de `app/packages/[slug]/page.tsx` para reutilizar `importantInfo`/`conditions` en `/terms` sin duplicar el texto; franja de "Condiciones importantes" agregada al footer de todo el sitio, con enlace a `/terms`. |
| 2026-09-23 02:10 | M11: verificado. Navegador (`m11-test.js`) 38/38: contenido real de cada página, sin plazos/jurisdicción/formas de pago inventadas, franja del footer en todo el sitio, 375 px sin desbordamiento, regresión de que el detalle de paquete no se rompió al extraer `BulletList`. Regresión completa: lógica 83/27/17/118; M1 41, M2 37, M3 54, M4 79, M5 51, M6 56, M7 42, M8 34, M9 138. lint y build exit 0. Criterios `[x]`; M11 sigue `[>]` hasta la confirmación visual del usuario. |
| 2026-11-18 | M12 fase 1: Supabase Auth + `proxy.ts` + `lib/admin/auth.ts` (`ADMIN_EMAILS`), `/admin/login`, dashboard, `/admin/quotes` (filtros, búsqueda, paginación) y detalle con cambio de estado; 7 estados en `schema.sql` + `supabase/migrations/m12-quote-statuses.sql`. Lint/build limpios; probado en navegador lo que no necesita sesión. Bloqueo: el proyecto de Supabase de `.env.local` ya no existe. |
| 2026-11-18 | M12 fase 2: catálogo en Supabase (`catalog_items` + semilla generada desde `data/*.ts`), `getCatalog()` con caché por etiqueta y respaldo en `data/` (timeout 3 s, sin reintentos, pausa 30 s), rutas `[slug]` dinámicas, CRUD en `/admin/catalog/<tipo>` (crear, editar, publicar/despublicar, archivar/restaurar, duplicar). Lint/build limpios, lógica 136/136, sitio público verificado con la base caída. Panel con sesión sin probar (Supabase inexistente). |
| 2026-11-18 | M13: `lib/seo.ts` + metadata en todas las páginas (canónicas en minúsculas, Open Graph, `noindex` en filtrados), `sitemap.ts`/`robots.ts`, `/about` y `/contact` reales (eran provisionales), `error.tsx`/`global-error.tsx`, catálogo vacío, cabeceras de seguridad. Auditoría (axe + 3 anchos + enlaces + sitemap + cabeceras): 2 hallazgos reales corregidos (enlaces en texto sin subrayar, casillas de 20 px); pasada final 643/643. Lint/build limpios. |
| 2026-11-18 | UI del usuario: línea de tiempo animada en el itinerario del paquete (`ItineraryTimeline`, estilos `.timeline*` en `globals.css`; mejora progresiva, respeta "reducir movimiento") y botón "Me gusta" con contador partido en el detalle de paquetes y experiencias (`LikeButton`, `lib/likes.ts`, tabla `catalog_likes` en `supabase/migrations/m14-likes.sql`; conteo real, un voto por navegador vía cookie `mv_visitor`; sin base → no se muestra). Prueba en navegador 17/17 con datos temporales ya revertidos; lint/build limpios. Falta correr `m14-likes.sql`. |
| 2026-11-18 | Marca: "Mundo Viajero" → **"Universal Tours"** en todo el sitio (nombre, títulos y metadatos, Open Graph, pie, textos legales y consentimiento del formulario, panel) y en la documentación. El usuario confirmó que trabaja para Universal Tours / el sitio es un encargo suyo. El logo sigue siendo la brújula propia del proyecto hasta que el cliente entregue el oficial. |
| 2026-11-18 | **Modo kiosco** en `/kiosco` (pedido del usuario): inicio con 4 accesos grandes, listados con filtros táctiles, fichas de paquete/destino/experiencia/evento, QR para cotizar desde el celular (sin datos personales en la pantalla compartida), reinicio por inactividad (90 s + 15 s de aviso), pantalla completa, sin salidas fuera del kiosco, adaptado a pantalla horizontal y vertical. Nueva dependencia `qrcode`. Prueba en navegador 49/49 (incluye el reinicio real por inactividad y que el QR codifica la URL exacta); lint/build limpios. |
| 2026-11-20 | Contenido real de Universal Tours (de universaltours.com.bo, datos; textos redactados aquí, sin copiar): contacto (correo, teléfono, WhatsApp, dirección, horario), 2 oficinas con horarios en `/contact` (rehecha), redes sociales (Facebook, Instagram, TikTok, YouTube), formas de pago (QR y cuotas), "Sobre nosotros" con historia (fundada el 28/08/1975, IATA, red LTN, representantes de Hertz y Dollar), misión/visión y servicios, beneficios reales en la portada. **No** se cargaron los precios/ofertas/eventos de la portada de ese sitio: sus botones no llevan a ninguna página y podrían no estar vigentes. Corregidos además un desborde de `/contact` a 320 px y el nombre accesible del botón «Me gusta». Auditoría 643/643; lint/build limpios. |
