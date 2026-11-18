"use server";

// Server Action delgada del botón "Me gusta": toda la validación vive en lib/likes.ts (server-only), porque una
// Server Action es alcanzable con un POST directo.
import { toggleLike, type LikeState } from "@/lib/likes";

export async function setLikeAction(kind: unknown, slug: unknown, want: unknown): Promise<LikeState | null> {
  return toggleLike(kind, slug, want);
}
