export type TemplateSummaryDto = {
  id: string
  categoryId: string
  name: string
  createdByMemberId: string
  itemCount: number
  createdAt: string
}

export type TemplateItemDto = {
  id: string
  productId: string
  productName: string
  quantity: number | null
  unit: string | null
  note: string | null
  sortOrder: number
}

export type TemplateDetailDto = {
  id: string
  categoryId: string
  name: string
  createdByMemberId: string
  createdAt: string
  items: TemplateItemDto[]
}

export type CreateTemplateRequest = {
  name: string
  categoryId: string
  sourceListId: string | null
}
