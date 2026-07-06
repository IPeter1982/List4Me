import { test, expect } from "../fixtures/testUser"
import { resetDb } from "../fixtures/reset"
import { createHousehold } from "../fixtures/testHousehold"

test.beforeEach(async () => { await resetDb() })

test("mobile viewport: bottom nav renders and page has no horizontal scroll", async ({ page, user }) => {
  await createHousehold(user.accessToken)
  await page.goto("/")

  // BottomNav is a fixed footer with 4 tabs.
  await expect(page.getByRole("navigation")).toBeVisible()
  const tabs = page.getByRole("navigation").locator("a, button")
  expect(await tabs.count()).toBeGreaterThanOrEqual(4)

  // No horizontal overflow — document width should match viewport width.
  const [docWidth, viewportWidth] = await page.evaluate(() => [
    document.documentElement.scrollWidth,
    window.innerWidth
  ])
  expect(docWidth).toBeLessThanOrEqual(viewportWidth + 2)
})
