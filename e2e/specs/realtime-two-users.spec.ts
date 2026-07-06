import { expect } from "@playwright/test"
import { test } from "@playwright/test"
import { resetDb } from "../fixtures/reset"
import { loginAs, injectE2ESession } from "../fixtures/testUser"
import { createHousehold, firstCategoryId } from "../fixtures/testHousehold"

const API_URL = process.env.API_URL ?? "http://localhost:5058"

async function createInvite(accessToken: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/households/me/invites`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ email: null })
  })
  if (!res.ok) throw new Error(`create invite failed: ${res.status}`)
  return ((await res.json()) as { token: string }).token
}

async function acceptInvite(accessToken: string, token: string) {
  const res = await fetch(`${API_URL}/api/invites/${token}/accept`, {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}` }
  })
  if (!res.ok) throw new Error(`accept invite failed: ${res.status} ${await res.text()}`)
}

test("two users in the same household see each other's list creations", async ({ browser }) => {
  await resetDb()

  const alice = await loginAs("auth0|rt-alice", "Alice", "alice@example.com")
  const bob = await loginAs("auth0|rt-bob", "Bob", "bob@example.com")
  await createHousehold(alice.accessToken, "Shared")
  const token = await createInvite(alice.accessToken)
  await acceptInvite(bob.accessToken, token)
  const categoryId = await firstCategoryId(alice.accessToken)

  const ctxA = await browser.newContext()
  const ctxB = await browser.newContext()
  await injectE2ESession(ctxA, alice)
  await injectE2ESession(ctxB, bob)
  const pageA = await ctxA.newPage()
  const pageB = await ctxB.newPage()

  await pageA.goto("/lists")
  await pageB.goto("/lists")
  // Wait for Bob's page to finish its initial load (bottom nav is a good proxy).
  await expect(pageB.getByRole("navigation")).toBeVisible({ timeout: 10_000 })

  // Alice creates a list via UI
  await pageA.getByRole("button", { name: "Új lista" }).click()
  await pageA.getByLabel("Név").fill("Realtime lista")
  await pageA.getByLabel("Kategória").selectOption(categoryId)
  await pageA.getByRole("button", { name: "Létrehozás" }).click()
  await expect(pageA).toHaveURL(/\/lists\/[0-9a-f-]+/)

  // Bob's /lists page should refresh via realtime — no manual reload.
  await expect(pageB.getByText("Realtime lista")).toBeVisible({ timeout: 5000 })

  await ctxA.close()
  await ctxB.close()
})
