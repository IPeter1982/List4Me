import { test as base, type BrowserContext } from "@playwright/test"

const API_URL = process.env.API_URL ?? "http://localhost:5058"

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
 * Injects an @auth0/auth0-react session object into localStorage so the SPA
 * treats the user as already logged in. The key format follows the SDK's
 * on-disk cache shape as of @auth0/auth0-react 2.x.
 */
export async function injectAuth0Session(context: BrowserContext, user: TestUser): Promise<void> {
  const clientId = process.env.VITE_AUTH0_CLIENT_ID ?? "test-client"
  const audience = process.env.VITE_AUTH0_AUDIENCE ?? "list4me-test"
  const scope = "openid profile email"
  const cacheKey = `@@auth0spajs@@::${clientId}::${audience}::${scope}`
  const now = Math.floor(Date.now() / 1000)
  const entry = {
    body: {
      access_token: user.accessToken,
      id_token: user.accessToken,
      scope,
      expires_in: 3600,
      token_type: "Bearer",
      decodedToken: {
        user: { sub: user.sub, name: user.name, email: user.email }
      },
      audience,
      client_id: clientId
    },
    expiresAt: now + 3600
  }
  await context.addInitScript(([key, value]) => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [cacheKey, entry] as const)
}

export const test = base.extend<{ user: TestUser }>({
  user: async ({ context }, use, testInfo) => {
    const sub = `auth0|e2e-${testInfo.testId}`
    const user = await loginAs(sub, "E2E User", `e2e-${testInfo.testId}@example.com`)
    await injectAuth0Session(context, user)
    await use(user)
  }
})
export { expect } from "@playwright/test"
