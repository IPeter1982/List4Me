import { test as base, type BrowserContext } from "@playwright/test"

const API_URL = process.env.API_URL ?? "http://localhost:5058"
const WEB_URL = process.env.WEB_URL ?? "http://localhost:4173"
const E2E_TOKEN_KEY = "l4m_e2e_token"

export interface TestUser {
  sub: string
  name: string
  email: string
  accessToken: string
}

export async function loginAs(sub: string, name: string, email: string): Promise<TestUser> {
  const res = await fetch(`${API_URL}/api/test/login-as`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ auth0UserId: sub, name, email })
  })
  if (!res.ok) {
    throw new Error(`POST /api/test/login-as returned ${res.status}`)
  }
  const body = (await res.json()) as { accessToken: string }
  return { sub, name, email, accessToken: body.accessToken }
}

/**
 * Frontend is built with VITE_E2E=true so AuthGate reads
 * localStorage["l4m_e2e_token"] instead of routing through Auth0.
 * addInitScript primes the key before the first page load.
 */
export async function injectE2ESession(context: BrowserContext, user: TestUser): Promise<void> {
  await context.addInitScript(([key, token]) => {
    window.localStorage.setItem(key, token)
  }, [E2E_TOKEN_KEY, user.accessToken] as const)
}

export const test = base.extend<{ user: TestUser }>({
  user: async ({ context }, use, testInfo) => {
    // Sanitize testId to keep the auth0-style sub short & bounded.
    const sub = `auth0|e2e-${testInfo.testId.slice(0, 12)}`
    const user = await loginAs(sub, "E2E User", `e2e-${testInfo.testId.slice(0, 12)}@example.com`)
    await injectE2ESession(context, user)
    await use(user)
  }
})
export { expect } from "@playwright/test"
export { WEB_URL }
