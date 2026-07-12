import { test, expect } from "../fixtures/testUser"
import { resetDb } from "../fixtures/reset"
import { createHousehold, firstCategoryId } from "../fixtures/testHousehold"

const API_URL = process.env.API_URL ?? "http://localhost:5058"

test.beforeEach(async () => { await resetDb() })

async function apiPost(path: string, token: string, body: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`)
  return res.json()
}

test("creating a list from a template copies its items", async ({ page, user }) => {
  await createHousehold(user.accessToken)
  const categoryId = await firstCategoryId(user.accessToken)

  // Arrange: create source list with 2 items + a template based on it.
  const list = (await apiPost("/api/lists", user.accessToken,
    { name: "Src", categoryId, fromTemplateId: null })) as { id: string; items: any[] }

  const productsRes = await fetch(`${API_URL}/api/categories/${categoryId}/products`, {
    headers: { authorization: `Bearer ${user.accessToken}` }
  })
  const products = (await productsRes.json()) as Array<{ id: string }>
  await apiPost(`/api/lists/${list.id}/items`, user.accessToken,
    { productId: products[0].id, quantity: 1 })
  await apiPost(`/api/lists/${list.id}/items`, user.accessToken,
    { productId: products[1].id, quantity: 2 })

  const tpl = (await apiPost("/api/templates", user.accessToken,
    { name: "Heti", categoryId, sourceListId: list.id })) as { id: string }

  // Act: navigate to /lists, open dialog, choose Sablonból, pick the template.
  await page.goto("/lists")
  await page.getByRole("button", { name: "Új lista" }).click()
  await page.getByLabel("Név").fill("Új heti")
  // Wait for categories to load into the select before picking one.
  const catSelect = page.getByLabel("Kategória")
  await expect(catSelect.locator(`option[value="${categoryId}"]`)).toBeAttached({ timeout: 5000 })
  await catSelect.selectOption(categoryId)
  await page.getByLabel("Sablonból").check()
  const tplSelect = page.locator("select").last()
  await expect(tplSelect.locator(`option[value="${tpl.id}"]`)).toBeAttached({ timeout: 5000 })
  await tplSelect.selectOption(tpl.id)
  await page.getByRole("button", { name: "Létrehozás" }).click()

  await expect(page).toHaveURL(/\/lists\/[0-9a-f-]+/)
  // Both source products should be present in the new list body.
  const productsRes2 = await fetch(`${API_URL}/api/categories/${categoryId}/products`, {
    headers: { authorization: `Bearer ${user.accessToken}` }
  })
  const productDefs = (await productsRes2.json()) as Array<{ id: string; name: string }>
  const firstName = productDefs.find(p => p.id === products[0].id)!.name
  const secondName = productDefs.find(p => p.id === products[1].id)!.name
  await expect(page.locator("main").getByText(firstName)).toBeVisible({ timeout: 10_000 })
  await expect(page.locator("main").getByText(secondName)).toBeVisible({ timeout: 10_000 })
})
