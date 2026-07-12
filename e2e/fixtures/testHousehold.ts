const API_URL = process.env.API_URL ?? "http://localhost:5058"

export interface HouseholdInfo {
  id: string
  name: string
}

export async function createHousehold(accessToken: string, name = "E2E Home"): Promise<HouseholdInfo> {
  const res = await fetch(`${API_URL}/api/households`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ name })
  })
  if (!res.ok) throw new Error(`createHousehold failed: ${res.status}`)
  return (await res.json()) as HouseholdInfo
}

export async function firstCategoryId(accessToken: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/categories`, {
    headers: { authorization: `Bearer ${accessToken}` }
  })
  if (!res.ok) throw new Error(`GET /api/categories failed: ${res.status}`)
  const cats = (await res.json()) as Array<{ id: string }>
  if (cats.length === 0) throw new Error("No categories seeded")
  return cats[0].id
}
