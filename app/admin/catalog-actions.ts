"use server";

// Server Actions del catálogo en el panel (M12 fase 2). Cada una exige un admin por su cuenta (requireAdmin) y
// todas las funciones de lib/admin/catalog.ts lo vuelven a comprobar.
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import {
  createCatalogItem,
  duplicateCatalogItem,
  isCatalogStatus,
  listCatalogItems,
  setCatalogStatus,
  updateCatalogItem,
} from "@/lib/admin/catalog";
import { parseFormValues, readFormData, type FormErrors, type FormValues } from "@/lib/catalog/forms";
import { isCatalogKind, isSlug, type CatalogKind } from "@/lib/catalog/normalize";
import { CATALOG_TAG } from "@/lib/catalog/read";

export type CatalogFormState = { values: FormValues; errors: FormErrors; message: string | null; attempt: number };

// Después de escribir: el catálogo cacheado expira ya (`updateTag`: la siguiente visita espera datos frescos en vez
// de ver los viejos) y las páginas estáticas que lo usan (Home, /destinations, /destinations/bolivia) se
// regeneran en su próxima visita.
function invalidateCatalog() {
  updateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}

const editPath = (kind: CatalogKind, slug: string) => `/admin/catalog/${kind}/${slug}`;

export async function saveCatalogItemAction(prev: CatalogFormState, formData: FormData): Promise<CatalogFormState> {
  const kind = formData.get("kind");
  const originalSlug = formData.get("originalSlug");
  const intent = formData.get("intent");
  if (!isCatalogKind(kind)) return { ...prev, message: "Tipo de elemento inválido.", attempt: prev.attempt + 1 };
  const editing = typeof originalSlug === "string" && originalSlug !== "";
  if (editing && !isSlug(originalSlug)) return { ...prev, message: "Elemento inválido.", attempt: prev.attempt + 1 };
  await requireAdmin(editing ? editPath(kind, originalSlug) : `/admin/catalog/${kind}/new`);

  const values = readFormData(kind, formData);
  const destinations = kind === "packages" ? await listCatalogItems("destinations", "active") : [];
  const parsed = parseFormValues(kind, values, {
    fixedSlug: editing ? originalSlug : undefined,
    destinationSlugs: (destinations ?? []).map((item) => item.slug),
  });
  if (!parsed.ok) {
    return { values, errors: parsed.errors, message: "Revisa los campos marcados.", attempt: prev.attempt + 1 };
  }

  const result = editing
    ? await updateCatalogItem(kind, originalSlug, parsed.item, parsed.sortOrder)
    : await createCatalogItem(kind, parsed.item, parsed.sortOrder, intent === "publish" ? "published" : "draft");
  if (!result.ok) {
    return {
      values,
      errors: result.field ? { [result.field]: result.message } : {},
      message: result.message,
      attempt: prev.attempt + 1,
    };
  }

  invalidateCatalog();
  redirect(`${editPath(kind, result.slug)}?saved=${editing ? "1" : "created"}`);
}

export async function catalogStatusAction(formData: FormData): Promise<void> {
  const kind = formData.get("kind");
  const slug = formData.get("slug");
  const status = formData.get("status");
  if (!isCatalogKind(kind) || !isSlug(slug) || !isCatalogStatus(status)) redirect("/admin");
  await requireAdmin(editPath(kind, slug));

  const ok = await setCatalogStatus(kind, slug, status);
  if (ok) invalidateCatalog();
  redirect(`${editPath(kind, slug)}?${ok ? `status=${status}` : "error=1"}`);
}

export async function duplicateCatalogItemAction(formData: FormData): Promise<void> {
  const kind = formData.get("kind");
  const slug = formData.get("slug");
  if (!isCatalogKind(kind) || !isSlug(slug)) redirect("/admin");
  await requireAdmin(editPath(kind, slug));

  const result = await duplicateCatalogItem(kind, slug);
  // La copia nace "no publicada": no cambia nada visible, no hace falta invalidar el catálogo público.
  redirect(result.ok ? `${editPath(kind, result.slug)}?saved=duplicated` : `${editPath(kind, slug)}?error=1`);
}
