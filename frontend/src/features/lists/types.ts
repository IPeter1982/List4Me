export type ListSummaryDto = {
  id: string
  categoryId: string
  name: string
  createdByMemberId: string
  fromTemplateId: string | null
  totalItems: number
  completedItems: number
  createdAt: string
  archivedAt: string | null
}

export type ListItemDto = {
  id: string
  productId: string
  productName: string
  categoryId: string
  quantity: number | null
  unit: string | null
  expiresOn: string | null
  note: string | null
  isCompleted: boolean
  completedAt: string | null
  completedByMemberId: string | null
  sortOrder: number
}

export type ListDetailDto = {
  id: string
  categoryId: string
  name: string
  createdByMemberId: string
  fromTemplateId: string | null
  createdAt: string
  archivedAt: string | null
  items: ListItemDto[]
}

export type CreateListRequest = {
  name: string
  categoryId: string
  fromTemplateId: string | null
}

export type UpdateListRequest = { name?: string; archived?: boolean }

export type CreateListItemRequest = {
  productId: string
  quantity: number | null
  unit: string | null
  expiresOn: string | null
  note: string | null
}

export type UpdateListItemRequest = Partial<Omit<CreateListItemRequest, "productId">>
