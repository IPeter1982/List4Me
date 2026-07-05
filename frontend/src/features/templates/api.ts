import { api } from "@/lib/api"

export type TemplateSummaryDto = {
  id: string
  categoryId: string
  name: string
  createdByMemberId: string
  itemCount: number
  createdAt: string
}

export const templatesApi = {
  // Filled in Phase H; return empty so NewListDialog compiles.
  list: (_params?: { categoryId?: string }) => api<TemplateSummaryDto[]>("/api/templates"),
}
