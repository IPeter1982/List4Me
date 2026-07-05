import { api } from "@/lib/api"
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "./types"

export const categoriesApi = {
  list: () => api<Category[]>("/api/categories"),
  create: (p: CreateCategoryPayload) =>
    api<Category>("/api/categories", { method: "POST", body: JSON.stringify(p) }),
  update: (id: string, p: UpdateCategoryPayload) =>
    api<void>(`/api/categories/${id}`, { method: "PATCH", body: JSON.stringify(p) }),
  remove: (id: string, force = false) =>
    api<void>(`/api/categories/${id}${force ? "?force=true" : ""}`, { method: "DELETE" })
}
