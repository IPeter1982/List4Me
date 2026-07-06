import type { QueryClient } from "@tanstack/react-query"

export function handleRealtimeEvent(
  qc: QueryClient,
  event: string,
  payload: any
): void {
  switch (event) {
    case "list.created":
    case "list.updated":
    case "list.deleted": {
      qc.invalidateQueries({ queryKey: ["lists"] })
      const listId = payload?.listId ?? payload?.id
      if (listId) qc.invalidateQueries({ queryKey: ["lists", "detail", listId] })
      return
    }
    case "listItem.created":
    case "listItem.updated":
    case "listItem.deleted":
    case "listItem.completed":
    case "listItem.uncompleted": {
      const listId = payload?.listId
      if (listId) qc.invalidateQueries({ queryKey: ["lists", "detail", listId] })
      qc.invalidateQueries({ queryKey: ["lists"] })
      return
    }
    case "category.created":
    case "category.updated":
    case "category.deleted":
      qc.invalidateQueries({ queryKey: ["categories"] })
      return
    case "product.created":
    case "product.updated":
    case "product.deleted":
    case "product.favoriteChanged":
      qc.invalidateQueries({ queryKey: ["products"] })
      return
    case "template.created":
    case "template.deleted":
      qc.invalidateQueries({ queryKey: ["templates"] })
      return
    case "member.joined":
    case "member.removed":
      qc.invalidateQueries({ queryKey: ["household", "me"] })
      return
  }
}
