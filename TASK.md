# TASK.md — Plataforma de Viajes (Mundo Viajero)

**Objetivo actual:** Construir una plataforma B2C de asesoría, cotización y venta de viajes (destinos, paquetes, experiencias, eventos y cotización personalizada) con panel administrativo, inspirada en la amplitud funcional de Universal Tours pero con identidad propia.

**Última actualización:** 2026-09-20 04:37 (UTC-4)

**Foco actual:** M6 — Experiencias y excursiones: los 4 criterios están `[x]` y verificados en navegador con tus fotos reales; **falta tu confirmación visual**. Siguiente: M7 (Eventos, conciertos y entretenimiento).

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
  - 3 ejemplos ficticios marcados como "Ejemplo ilustrativo" y "Fechas por confirmar"; sin artistas, fechas ni entradas. "Solicitar información" → `/contact`.
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

### M6 — Experiencias y excursiones `[>]`
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
- **Pendiente (tuyo):** confirmación visual en escritorio y móvil. Recién ahí M6 pasa a `[x]`.

---

### M7 — Eventos, conciertos y entretenimiento `[ ]`
- `[ ]` `/events` con categorías (conciertos, deportivos, ferias, festivales, parques, especiales).
- `[>]` `EventCard` (imagen, nombre, ciudad, fecha, duración, incluye, estado, **Solicitar información**).
  - Creada en M2 con imagen, nombre, categoría, ciudad, estado y **Solicitar información**. Faltan fecha, duración e "incluye" (no se inventan mientras no estén confirmados).
- `[ ]` Ejemplos ficticios editables (sin artistas/fechas/entradas presentados como confirmados).

**Verificación:** las tarjetas no afirman disponibilidad real; enlaces de "Solicitar información" funcionan.

---

### M8 — Viajes nacionales (Bolivia) `[ ]`
- `[>]` Sección en home y/o `/destinations/bolivia`.
  - La sección de la Home está hecha y verificada en M2 (10 destinos con "Consulta fechas recomendadas"). Falta decidir si además habrá `/destinations/bolivia` (hoy responde 404: no es un slug de destino; M3 lo verifica).
- `[ ]` Tarjetas de destinos nacionales (Uyuni, Chiquitania, Titicaca, Rurrenabaque, Samaipata, Madidi, Tarija, Sucre, Potosí, Santa Cruz).
- `[ ]` Sin temporadas exactas inventadas → usar `Consulta fechas recomendadas`.

**Verificación:** todas las tarjetas cargan; ninguna afirma fechas/precios como definitivos.

---

### M9 — Formulario de cotización multi-step (núcleo) `[ ]`
- `[ ]` `/quote` con hero.
  - Contrato de entrada (ya enlazado desde M2 / M3 / M4): `?package=<slug>`, `?destination=<slug o nombre>` y, desde `/packages`, `?destination&type&date&duration&travelers&budget`. `/quote` debe leerlos, validarlos y precargar el formulario.
- `[ ]` `QuoteStepper` de 8 pasos: tipo de solicitud, destino, fechas, viajeros, preferencias, presupuesto, contacto, confirmación.
- `[ ]` `QuoteSummary` que muestra todo lo seleccionado antes de enviar.
- `[ ]` Validaciones (nombre, email válido, teléfono, destino o "necesito sugerencias", regreso posterior a salida, adultos ≥ 1, edades 0–17, aceptación de privacidad) con mensajes claros.
- `[ ]` Rangos de presupuesto configurables por país/moneda (no valores rígidos en frontend).

**Verificación:** completar el flujo con datos válidos e inválidos; comprobar que cada mensaje de error aparece cuando corresponde.

---

### M10 — Confirmación + modelo de datos de cotización `[ ]`
- `[ ]` `QuoteSuccess` con título, texto, número de solicitud dinámico (`TV-2026-####` si hay backend) y CTAs.
- `[ ]` Modelo `TravelQuote` y `TravelQuoteItem` (según el tipado del prompt) en Supabase u origen de datos.
- `[ ]` Guardado real de la solicitud si existe backend; si no, no simular persistencia permanente.
- `[ ]` Sin promesas de tiempos de respuesta si no están definidas.

**Verificación:** enviar una cotización de prueba y confirmar que se persiste (o que la demo no finge persistencia); revisar el registro creado.

---

### M11 — Booking info, condiciones, formas de pago y newsletter `[ ]`
- `[ ]` `/booking-info` (cambios y modificaciones, email configurable, advertencia de condiciones, datos solicitados, CTA).
- `[>]` Sección de **Condiciones importantes** (precios/imágenes ilustrativas/penalidades) editable, visible en detalle y footer.
  - Borrador ya visible en el detalle de paquete (M5): `importantInfo` y `conditions` en `config/packages.ts`, redactados sin cifras ni penalidades. Falta el contenido definitivo (penalidades), mostrarlo en el footer y en `/booking-info`, `/terms` y `/privacy`.
- `[ ]` `/terms` y `/privacy`.
- `[ ]` `PaymentMethods` configurable (sin logos de bancos hasta autorización).
- `[x]` `NewsletterForm` con validación de email y confirmación (sin fingir almacenamiento si no hay backend).
  - Adelantado y verificado en M2 (`components/NewsletterForm.tsx`): valida vacío, formato y espacios; un correo válido informa que no se guarda. Si más adelante hay backend, hay que conectarlo aquí.

**Verificación:** email de reservas viene de variable de configuración (no del sitio de referencia); newsletter valida email.

---

### M12 — Panel administrativo `[ ]`
- `[ ]` Reutilizar el patrón de auth existente; proteger todas las rutas `/admin/*`.
- `[ ]` Dashboard con métricas (cotizaciones nuevas/en revisión/enviadas, paquetes activos, destinos, experiencias, próximos eventos, consultas recientes).
- `[ ]` Gestión de paquetes (crear, editar, publicar/despublicar, destacar, archivar, duplicar, imágenes, destino, inclusiones, temporadas, precio/consulta, disponibilidad).
- `[ ]` Gestión de destinos, experiencias y eventos.
- `[ ]` Gestión de cotizaciones con tabla + cambio de estado (Nueva → En revisión → Contactado → Propuesta enviada → Confirmada → Cerrada → Cancelada).

**Verificación:** login obligatorio; crear/editar un paquete y verlo reflejado; cambiar el estado de una cotización de prueba.

---

### M13 — Calidad transversal: accesibilidad, SEO, estados, responsive, seguridad `[ ]`
- `[ ]` Accesibilidad: alt en imágenes, labels visibles, `aria-label` en botones-ícono, focus visible, navegación por teclado, `aria-live` en éxito/error, contraste, Escape para cerrar modales, foco atrapado en modales.
- `[ ]` SEO: titles/descriptions por página, metadata dinámica de paquetes/destinos/experiencias, sitemap, Open Graph, URLs legibles, `noindex` en admin y páginas vacías.
  - Pendiente detectado en M3: en producción `/destinations/CARTAGENA` (y otras variantes de mayúsculas) responde 200 con el mismo contenido que `/destinations/cartagena`; definir la URL canónica (`alternates.canonical`) para evitar contenido duplicado.
- `[ ]` Estados especiales: catálogo vacío, búsqueda sin resultados, error, paquete no disponible, imagen faltante.
- `[ ]` Responsive verificado en desktop / tablet / móvil, sin overflow horizontal, sin depender de hover en móvil.
- `[ ]` Seguridad: sin claves privadas en frontend, RLS en tablas, inserción pública limitada, admin protegido, sanitizar entradas, no exponer errores técnicos de la base.
- `[ ]` `npm run lint` y `npm run build` sin errores; sin enlaces ni imágenes rotas.

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
