export const RealtimeEvents = {
  ListCreated: "list.created",
  ListUpdated: "list.updated",
  ListDeleted: "list.deleted",
  ListItemCreated: "listItem.created",
  ListItemUpdated: "listItem.updated",
  ListItemDeleted: "listItem.deleted",
  ListItemCompleted: "listItem.completed",
  ListItemUncompleted: "listItem.uncompleted",
  CategoryCreated: "category.created",
  CategoryUpdated: "category.updated",
  CategoryDeleted: "category.deleted",
  ProductCreated: "product.created",
  ProductUpdated: "product.updated",
  ProductDeleted: "product.deleted",
  ProductFavoriteChanged: "product.favoriteChanged",
  TemplateCreated: "template.created",
  TemplateDeleted: "template.deleted",
  MemberJoined: "member.joined",
  MemberRemoved: "member.removed"
} as const

export type RealtimeEventName = (typeof RealtimeEvents)[keyof typeof RealtimeEvents]
