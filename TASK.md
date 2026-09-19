# TASK.md — Plataforma de Viajes (Mundo Viajero)

**Objetivo actual:** Construir una plataforma B2C de asesoría, cotización y venta de viajes (destinos, paquetes, experiencias, eventos y cotización personalizada) con panel administrativo, inspirada en la amplitud funcional de Universal Tours pero con identidad propia.

**Última actualización:** _(el agente completa fecha y hora en cada avance)_

**Foco actual:** M0 — Fundaciones del proyecto

---

## Leyenda de estados

- `[ ]` no iniciado
- `[>]` en progreso / parcial (falta algo para llegar al 100%)
- `[x]` completado y verificado

---

## Reglas de trabajo (recordatorio para el agente)

- Al iniciar cualquier sesión, lee primero este `TASK.md` y ubícate en **Foco actual**.
- Después de cada avance real (no de cada mensaje): cambia el estado del criterio/milestone, actualiza **Última actualización** y **Foco actual**, y agrega una línea al **Changelog**.
- No marques un criterio como `[x]` hasta haberlo verificado (corriendo el código, `npm run lint` / `npm run build`, o comprobación manual). Si está a medias, usa `[>]` y anota exactamente qué falta.
- La corrección se juzga sobre el **último estado del código**, no sobre pasos intermedios.
- `TASK.md` es la **fuente de verdad**: si algo se contradice, gana este archivo.
- Antes de dar por cerrado un milestone, auto-revisión rápida contra fallas comunes: código incompleto o que no corre, afirmar éxito sin verificar, verificación débil (solo happy path), sobre-implementar cosas no pedidas, romper algo que ya funcionaba (regresiones), desviarse de las instrucciones.
- No copiar literalmente identidad visual, textos, logos ni fotos de Universal Tours. Marca propia.
- Precios, fechas y disponibilidad quedan **editables**; si no están confirmados, usar `Consultar precio` / `Consultar fechas`.

---

## Milestones

### M0 — Fundaciones del proyecto `[ ]`
Base técnica antes de escribir UI de negocio.
- `[ ]` Inspeccionar stack existente (framework, Supabase, panel admin, patrón de auth, cómo están hechos los formularios y componentes actuales).
- `[ ]` Definir tokens de diseño en `:root` con la paleta acordada (`--travel-primary`, `--travel-accent`, `--travel-teal`, etc.).
- `[ ]` Configurar la tipografía global sin romper la existente.
- `[ ]` Crear el árbol de rutas: `/`, `/destinations`, `/destinations/[slug]`, `/packages`, `/packages/[slug]`, `/experiences`, `/experiences/[slug]`, `/events`, `/about`, `/contact`, `/quote`, `/booking-info`, `/terms`, `/privacy`.
- `[ ]` Estructura de carpetas para datos de demostración editables (paquetes, destinos, experiencias, eventos).
- `[ ]` Estructura de carpetas `/public/images/...` según el milestone M-IMG.

**Verificación:** el proyecto compila (`npm run build`), todas las rutas resuelven aunque sea con placeholder, los tokens se aplican en un componente de prueba.

---

### M1 — Header y Footer globales `[ ]`
- `[ ]` Header sticky con logo textual propio (**Mundo Viajero**) y símbolo propio (brújula / avión / globo).
- `[ ]` Menú: Inicio, Destinos, Paquetes, Experiencias, Eventos, Sobre nosotros, Contacto.
- `[ ]` CTA destacado **Cotizar mi viaje** → `/quote`, visible también en móvil.
- `[ ]` Comportamiento scroll (sombra + fondo sólido), estado activo, focus visible.
- `[ ]` Menú hamburguesa accesible en móvil, con bloqueo de scroll de fondo y botón claro para cerrar.
- `[ ]` Footer con 4 columnas: Marca, Explorar, Ayuda, Contacto (datos configurables) + redes sociales configurables + copyright.

**Verificación:** navegar por teclado, abrir/cerrar menú móvil sin scroll bleed, todos los enlaces del footer apuntan a rutas existentes.

---

### M2 — Página de inicio (Home) `[ ]`
- `[ ]` Hero principal (etiqueta, título, subtítulo, CTA primario **Cotizar mi viaje**, secundario **Explorar destinos**, imagen con overlay).
- `[ ]` Buscador rápido de viajes (destino, tipo, fecha, duración, viajeros, presupuesto) que redirige a `/packages?...` con parámetros.
- `[ ]` Sección de categorías de viaje (8 tarjetas) con enlaces filtrados.
- `[ ]` Destinos destacados (6–8 tarjetas).
- `[ ]` Paquetes recomendados (usando `PackageCard`).
- `[ ]` Experiencias y excursiones (muestra).
- `[ ]` Beneficios de reservar con la agencia.
- `[ ]` Eventos y conciertos (muestra).
- `[ ]` Destinos nacionales (Bolivia).
- `[ ]` Newsletter + CTA final.

**Verificación:** el buscador arma bien la URL con parámetros; ningún enlace roto; sin overflow horizontal en móvil.

---

### M3 — Destinos: lista y detalle `[ ]`
- `[ ]` `/destinations` con grilla de destinos (internacionales + nacionales).
- `[ ]` `/destinations/[slug]` con descripción, galería, tipo de experiencia y CTA de consulta.
- `[ ]` `DestinationCard` reutilizable por props (sin duplicar tarjetas).
- `[ ]` Estado de imagen faltante (fondo degradado + ícono + nombre, nunca imagen rota).

**Verificación:** entrar a al menos 3 slugs distintos; comprobar fallback de imagen forzando una ruta inexistente.

---

### M4 — Paquetes: lista, filtros y orden `[ ]`
- `[ ]` `/packages` con cabecera (título + texto que invita a cotización personalizada si no hay match).
- `[ ]` Filtros: destino, región, tipo, duración, temporada, precio, régimen, incluye vuelos/traslados/excursiones, disponibilidad, etiqueta.
- `[ ]` Ordenamiento: relevancia, precio, duración, populares, destacados, salida más próxima.
- `[ ]` `PackageCard` con imagen, badge, nombre, destino, duración, resumen, incluye, precio/`Consultar precio`, botones **Ver paquete** y **Cotizar**.
- `[ ]` Estado "sin resultados" amable con CTA **Cotizar una opción personalizada**.
- `[ ]` `FilterSidebar` (desktop) y `MobileFilterDrawer` (móvil).

**Verificación:** aplicar combinaciones de filtros y verificar que la lista responde; probar el caso sin resultados.

---

### M5 — Detalle de paquete `[ ]`
- `[ ]` `/packages/[slug]` con breadcrumb, galería (principal + 3–4 secundarias, zoom, miniaturas).
- `[ ]` Info principal: nombre, destino, duración, temporada, badge, precio/consulta, disponibilidad, CTA **Cotizar este paquete**.
- `[ ]` Secciones: Qué incluye, Qué NO incluye, itinerario sugerido, opcionales, recomendaciones, info importante, condiciones, FAQ, paquetes relacionados.
- `[ ]` Cargar los 6 paquetes de demostración editables (Cartagena, Orlando, Punta Cana, Uyuni, Río, Dubái) con precios/fechas como `null` o texto de consulta.

**Verificación:** los 6 paquetes abren; "qué no incluye" muestra explícitamente costos potenciales; galería navegable por teclado.

---

### M6 — Experiencias y excursiones `[ ]`
- `[ ]` `/experiences` con categorías (visitas guiadas, museos, paseos en barco, naturaleza, parques, gastronomía, aventura, familiar, nocturna, religiosa).
- `[ ]` `ExperienceCard` (imagen, nombre, ciudad, duración, disponibilidad, incluye, **Ver experiencia** / **Consultar**).
- `[ ]` `/experiences/[slug]` con detalle.
- `[ ]` Datos de demostración editables.

**Verificación:** entrar a varias experiencias; textos sin datos inventados como verificables.

---

### M7 — Eventos, conciertos y entretenimiento `[ ]`
- `[ ]` `/events` con categorías (conciertos, deportivos, ferias, festivales, parques, especiales).
- `[ ]` `EventCard` (imagen, nombre, ciudad, fecha, duración, incluye, estado, **Solicitar información**).
- `[ ]` Ejemplos ficticios editables (sin artistas/fechas/entradas presentados como confirmados).

**Verificación:** las tarjetas no afirman disponibilidad real; enlaces de "Solicitar información" funcionan.

---

### M8 — Viajes nacionales (Bolivia) `[ ]`
- `[ ]` Sección en home y/o `/destinations/bolivia`.
- `[ ]` Tarjetas de destinos nacionales (Uyuni, Chiquitania, Titicaca, Rurrenabaque, Samaipata, Madidi, Tarija, Sucre, Potosí, Santa Cruz).
- `[ ]` Sin temporadas exactas inventadas → usar `Consulta fechas recomendadas`.

**Verificación:** todas las tarjetas cargan; ninguna afirma fechas/precios como definitivos.

---

### M9 — Formulario de cotización multi-step (núcleo) `[ ]`
- `[ ]` `/quote` con hero.
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
- `[ ]` Sección de **Condiciones importantes** (precios/imágenes ilustrativas/penalidades) editable, visible en detalle y footer.
- `[ ]` `/terms` y `/privacy`.
- `[ ]` `PaymentMethods` configurable (sin logos de bancos hasta autorización).
- `[ ]` `NewsletterForm` con validación de email y confirmación (sin fingir almacenamiento si no hay backend).

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
- `[ ]` Estados especiales: catálogo vacío, búsqueda sin resultados, error, paquete no disponible, imagen faltante.
- `[ ]` Responsive verificado en desktop / tablet / móvil, sin overflow horizontal, sin depender de hover en móvil.
- `[ ]` Seguridad: sin claves privadas en frontend, RLS en tablas, inserción pública limitada, admin protegido, sanitizar entradas, no exponer errores técnicos de la base.
- `[ ]` `npm run lint` y `npm run build` sin errores; sin enlaces ni imágenes rotas.

**Verificación:** recorrer criterios de aceptación del prompt uno por uno; correr lint y build limpios; revisión visual en los 3 breakpoints. **La revisión visual final queda pendiente de confirmación manual del usuario (no marcar `[x]` solo porque compila).**

---

### M-IMG — Sourcing de imágenes (⚠️ TE INVOLUCRA A TI) `[ ]`

Este milestone lo hacés **vos**: descargar cada imagen y guardarla en la ruta indicada dentro de `/public/images/...`. El agente debe implementar `next/image`, lazy loading, `alt` descriptivo y **fallback visual** para que, mientras las imágenes no estén, la página no muestre íconos rotos.

**Recomendación importante:** descargá de bancos gratuitos con licencia libre (**Unsplash, Pexels, Pixabay**) para evitar problemas de derechos. Formato ideal **WebP o JPG optimizado**. Agregá el nombre del banco a la búsqueda para filtrar en Google Images.

**Criterios**
- `[ ]` Crear la estructura de carpetas en `/public/images/`.
- `[ ]` Descargar y ubicar todas las imágenes de la tabla de abajo.
- `[ ]` Optimizar (convertir a WebP / comprimir).
- `[ ]` Verificar que ninguna imagen quede rota y que cada una tenga su `alt`.

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
| _(pendiente)_ | Versión inicial de TASK.md creada con M0–M13 y M-IMG. |
