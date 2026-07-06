import { test, expect } from "../fixtures/testUser"
import { resetDb } from "../fixtures/reset"
import { createHousehold, firstCategoryId } from "../fixtures/testHousehold"

const API_URL = process.env.API_URL ?? "http://localhost:5058"

test.beforeEach(async () => { await resetDb() })

test.fixme("swipe item right marks it complete", async ({ page, user }) => {
  // Framer-motion pan gestures don't respond to Playwright's mouse.down/move/up
  // sequence out of the box — the pan handler debounces on animation frames.
  // Track work: research window.PointerEvent + touch emulation, or expose a
  // data-testid hook on ListItemRow so we can invoke the swipe handler directly.
  await createHousehold(user.accessToken)
  const categoryId = await firstCategoryId(user.accessToken)
  const list = await (await fetch(`${API_URL}/api/lists`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${user.accessToken}` },
    body: JSON.stringify({ name: "S", categoryId, fromTemplateId: null })
  })).json() as { id: string }

  await page.goto(`/lists/${list.id}`)
  const row = page.locator("main li").first()
  const box = await row.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return
  await page.mouse.move(box.x + 20, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + 200, box.y + box.height / 2, { steps: 10 })
  await page.mouse.up()
  await expect(page.getByText("Kész")).toBeVisible()
})
