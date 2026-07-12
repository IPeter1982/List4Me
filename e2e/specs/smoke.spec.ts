import { test, expect } from "../fixtures/testUser"
import { resetDb } from "../fixtures/reset"
import { createHousehold } from "../fixtures/testHousehold"

test.beforeEach(async () => {
  await resetDb()
})

test("logged-in user with household lands on the category grid", async ({ page, user }) => {
  await createHousehold(user.accessToken)
  await page.goto("/")
  // Plan 1 seeds 4 default categories on household creation; one of them is "Bevásárlás".
  await expect(page.getByText("Bevásárlás")).toBeVisible({ timeout: 10_000 })
})
