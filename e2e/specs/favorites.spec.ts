import { test, expect } from "../fixtures/testUser"
import { resetDb } from "../fixtures/reset"
import { createHousehold, firstCategoryId } from "../fixtures/testHousehold"

test.beforeEach(async () => { await resetDb() })

test("favorite toggle + Kedvencek chip filters the product list", async ({ page, user }) => {
  await createHousehold(user.accessToken)
  const categoryId = await firstCategoryId(user.accessToken)

  await page.goto(`/categories/${categoryId}/products`)
  await expect(page.locator("main")).toBeVisible()

  const rows = page.locator("main li")
  const rowCount = await rows.count()
  expect(rowCount).toBeGreaterThan(1)

  // Star the first two products
  const firstStar = rows.nth(0).getByRole("button", { name: /Kedvenc/ })
  const secondStar = rows.nth(1).getByRole("button", { name: /Kedvenc/ })
  await firstStar.click()
  await secondStar.click()

  await page.getByRole("button", { name: /Kedvencek/ }).click()
  await expect(rows).toHaveCount(2)
})
