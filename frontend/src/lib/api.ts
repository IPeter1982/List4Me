const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000"

type TokenProvider = () => Promise<string | null>

let tokenProvider: TokenProvider = async () => null

export function setTokenProvider(p: TokenProvider) { tokenProvider = p }

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
