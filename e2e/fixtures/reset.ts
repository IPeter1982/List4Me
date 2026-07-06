const API_URL = process.env.API_URL ?? "http://localhost:5058"

export async function resetDb(): Promise<void> {
  const res = await fetch(`${API_URL}/api/test/reset`, { method: "POST" })
  if (!res.ok) {
    throw new Error(`POST /api/test/reset returned ${res.status} — is the backend running in Test env?`)
  }
}
