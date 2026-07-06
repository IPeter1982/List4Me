import { api } from "@/lib/api"
import type {
  CreateListItemRequest, CreateListRequest,
  ListDetailDto, ListItemDto, ListSummaryDto,
  UpdateListItemRequest, UpdateListRequest,
} from "./types"

function listsQuery(params?: { categoryId?: string; archived?: boolean }) {
  const p = new URLSearchParams()
  if (params?.categoryId) p.set("categoryId", params.categoryId)
  if (params?.archived) p.set("archived", "true")
  const s = p.toString()
  return s ? `?${s}` : ""
}

export const listsApi = {
  list: (params?: { categoryId?: string; archived?: boolean }) =>
    api<ListSummaryDto[]>(`/api/lists${listsQuery(params)}`),
  create: (body: CreateListRequest) =>
    api<ListDetailDto>("/api/lists", { method: "POST", body: JSON.stringify(body) }),
  get: (id: string) => api<ListDetailDto>(`/api/lists/${id}`),
  update: (id: string, body: UpdateListRequest) =>
    api<ListDetailDto>(`/api/lists/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (id: string) => api<void>(`/api/lists/${id}`, { method: "DELETE" }),
}

export const listItemsApi = {
  add: (listId: string, body: CreateListItemRequest) =>
    api<ListItemDto>(`/api/lists/${listId}/items`, { method: "POST", body: JSON.stringify(body) }),
  update: (listId: string, itemId: string, body: UpdateListItemRequest) =>
    api<ListItemDto>(`/api/lists/${listId}/items/${itemId}`, {
      method: "PATCH", body: JSON.stringify(body),
    }),
  complete: (listId: string, itemId: string) =>
    api<ListItemDto>(`/api/lists/${listId}/items/${itemId}/complete`, { method: "POST" }),
  uncomplete: (listId: string, itemId: string) =>
    api<ListItemDto>(`/api/lists/${listId}/items/${itemId}/uncomplete`, { method: "POST" }),
  remove: (listId: string, itemId: string) =>
    api<void>(`/api/lists/${listId}/items/${itemId}`, { method: "DELETE" }),
}
