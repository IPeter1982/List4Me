import { test, expect } from "../fixtures/testUser"
import { resetDb } from "../fixtures/reset"
import { createHousehold, firstCategoryId } from "../fixtures/testHousehold"

test.beforeEach(async () => { await resetDb() })

test("create empty list via FAB dialog navigates to ListView", async ({ page, user }) => {
  await createHousehold(user.accessToken)
  const categoryId = await firstCategoryId(user.accessToken)

  await page.goto("/lists")
  await page.getByRole("button", { name: "Új lista" }).click()

  await expect(page.getByRole("dialog")).toBeVisible()
  await page.getByLabel("Név").fill("Teszt lista")
  await page.getByLabel("Kategória").selectOption(categoryId)
  await page.getByRole("button", { name: "Létrehozás" }).click()

  await expect(page).toHaveURL(/\/lists\/[0-9a-f-]+/)
  await expect(page.getByRole("textbox", { name: "Lista neve" })).toHaveValue("Teszt lista")
})
