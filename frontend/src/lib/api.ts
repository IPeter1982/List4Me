const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5058"
const E2E_MODE = import.meta.env.VITE_E2E === "true"
const E2E_TOKEN_KEY = "l4m_e2e_token"

type TokenProvider = () => Promise<string | null>

// In E2E mode the token is always readable from localStorage — set the
// default provider at module load so the first render can already inject
// Authorization headers without waiting for AuthGate's useEffect to run.
let tokenProvider: TokenProvider = E2E_MODE
  ? async () => window.localStorage.getItem(E2E_TOKEN_KEY)
  : async () => null

export function setTokenProvider(p: TokenProvider) { tokenProvider = p }

export async function getAccessToken(): Promise<string | null> {
  return tokenProvider()
}

export const apiBaseUrl = API_URL

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown, message: string) {
    super(message)
    this.status = status
    this.body = body
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await tokenProvider()
  const headers = new Headers(init.headers)
  headers.set("content-type", "application/json")
  if (token) headers.set("authorization", `Bearer ${token}`)

  const resp = await fetch(`${API_URL}${path}`, { ...init, headers })
  if (!resp.ok) {
    const text = await resp.text().catch(() => "")
    let body: unknown = text
    try { body = JSON.parse(text) } catch { /* not json */ }
    throw new ApiError(resp.status, body, `${resp.status} ${resp.statusText}`)
  }
  if (resp.status === 204) return undefined as T
  return (await resp.json()) as T
}
