export type ProductDto = {
  id: string
  categoryId: string
  name: string
  defaultQuantity: number | null
  defaultUnit: string | null
  isFavorite: boolean
}

export type CreateProductRequest = {
  name: string
  defaultQuantity: number | null
  defaultUnit: string | null
}

export type UpdateProductRequest = CreateProductRequest

export type ListProductsParams = {
  categoryId: string
  q?: string
  favoritesOnly?: boolean
}
