import { api } from "@/lib/api"
import type {
  CreateTemplateRequest, TemplateDetailDto, TemplateSummaryDto,
} from "./types"

function listQuery(params?: { categoryId?: string }) {
  return params?.categoryId ? `?categoryId=${params.categoryId}` : ""
}

export const templatesApi = {
  list: (params?: { categoryId?: string }) =>
    api<TemplateSummaryDto[]>(`/api/templates${listQuery(params)}`),
  create: (body: CreateTemplateRequest) =>
    api<TemplateDetailDto>("/api/templates", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  get: (id: string) => api<TemplateDetailDto>(`/api/templates/${id}`),
  remove: (id: string) => api<void>(`/api/templates/${id}`, { method: "DELETE" }),
}

// Legacy alias so existing imports continue to work.
export type { TemplateSummaryDto }
