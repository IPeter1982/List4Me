export type Category = {
  id: string
  name: string
  iconKey: string
  parentCategoryId: string | null
  completedLabel: string
  sortOrder: number
  subcategories: Category[]
}

export type CreateCategoryPayload = {
  name: string
  iconKey: string
  parentCategoryId?: string | null
  completedLabel?: string
}

export type UpdateCategoryPayload = {
  name: string
  iconKey: string
  completedLabel: string
  sortOrder?: number
}
