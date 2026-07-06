import { test, expect } from "../fixtures/testUser"
import { resetDb } from "../fixtures/reset"
import { createHousehold, firstCategoryId } from "../fixtures/testHousehold"

test.beforeEach(async () => { await resetDb() })

async function createList(accessToken: string, categoryId: string, name: string) {
  const res = await fetch(`${process.env.API_URL ?? "http://localhost:5058"}/api/lists`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ name, categoryId, fromTemplateId: null })
  })
  if (!res.ok) throw new Error(`create list failed: ${res.status}`)
  return (await res.json()) as { id: string }
}

test("typing in ProductPicker filters and adds an existing product", async ({ page, user }) => {
  await createHousehold(user.accessToken)
  const categoryId = await firstCategoryId(user.accessToken)
  const list = await createList(user.accessToken, categoryId, "Shopping")

  await page.goto(`/lists/${list.id}`)
  const picker = page.getByRole("textbox", { name: "Termék hozzáadása" })
  await picker.fill("kenyér")

  const firstMatch = page.locator("ul li button").first()
  await expect(firstMatch).toBeVisible({ timeout: 5000 })
  const productName = (await firstMatch.textContent())?.trim() ?? ""
  await firstMatch.click()

  // The named product appears as an item row in the list body.
  await expect(page.locator("main").getByText(productName)).toBeVisible({ timeout: 5000 })
})

test("empty search followed by unknown text shows create-new option", async ({ page, user }) => {
  await createHousehold(user.accessToken)
  const categoryId = await firstCategoryId(user.accessToken)
  const list = await createList(user.accessToken, categoryId, "Shopping")

  await page.goto(`/lists/${list.id}`)
  const picker = page.getByRole("textbox", { name: "Termék hozzáadása" })
  await picker.fill("Xxxxx-nem-letezo")
  await expect(page.getByText(/Új termék:/)).toBeVisible({ timeout: 5000 })
})
