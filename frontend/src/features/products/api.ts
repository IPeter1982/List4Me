import { api } from "@/lib/api"
import type {
  CreateProductRequest,
  ListProductsParams,
  ProductDto,
  UpdateProductRequest,
} from "./types"

function qs({ q, favoritesOnly }: Omit<ListProductsParams, "categoryId">) {
  const p = new URLSearchParams()
  if (q) p.set("q", q)
  if (favoritesOnly) p.set("favoritesOnly", "true")
  const s = p.toString()
  return s ? `?${s}` : ""
}

export const productsApi = {
  list: ({ categoryId, q, favoritesOnly }: ListProductsParams) =>
    api<ProductDto[]>(`/api/categories/${categoryId}/products${qs({ q, favoritesOnly })}`),
  create: (categoryId: string, body: CreateProductRequest) =>
    api<ProductDto>(`/api/categories/${categoryId}/products`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: UpdateProductRequest) =>
    api<ProductDto>(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    api<void>(`/api/products/${id}`, { method: "DELETE" }),
  favorite: (id: string) =>
    api<void>(`/api/products/${id}/favorite`, { method: "POST" }),
  unfavorite: (id: string) =>
    api<void>(`/api/products/${id}/favorite`, { method: "DELETE" }),
}
