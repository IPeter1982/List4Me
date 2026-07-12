import { execSync, spawn, type ChildProcess } from "node:child_process"
import { setTimeout as sleep } from "node:timers/promises"

const API_URL = process.env.API_URL ?? "http://localhost:5058"
const WEB_URL = process.env.WEB_URL ?? "http://localhost:4173"
const CONN =
  process.env.TEST_DB_CONN ??
  "Host=localhost;Port=5434;Database=list4me_e2e;Username=postgres;Password=postgres"

async function waitFor(url: string, label: string, timeoutMs = 60_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url)
      if (r.ok) return
    } catch {
      /* ignore */
    }
    await sleep(500)
  }
  throw new Error(`Timeout waiting for ${label} at ${url}`)
}

async function main() {
  console.log("→ starting postgres-e2e via docker compose")
  execSync("docker compose -f e2e/docker-compose.test.yml up -d", { stdio: "inherit" })

  console.log("→ starting backend (ASPNETCORE_ENVIRONMENT=Test)")
  const backend: ChildProcess = spawn(
    "dotnet",
    ["run", "--project", "backend/src/List4Me.Api", "--no-launch-profile"],
    {
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        ASPNETCORE_ENVIRONMENT: "Test",
        ASPNETCORE_URLS: API_URL.replace("http://", "http://").replace(/:(\d+)$/, ":$1"),
        ConnectionStrings__Default: CONN
      }
    }
  )

  console.log("→ starting frontend preview")
  const frontend: ChildProcess = spawn(
    "pnpm",
    ["--filter", "frontend", "preview", "--host", "127.0.0.1", "--port", "4173"],
    { stdio: "inherit", shell: true }
  )

  await waitFor(`${API_URL}/health`, "backend /health")
  await waitFor(WEB_URL, "frontend")
  console.log("✓ stack ready — run `pnpm test:e2e` in another terminal")

  const shutdown = () => {
    backend.kill()
    frontend.kill()
    try {
      execSync("docker compose -f e2e/docker-compose.test.yml down", { stdio: "inherit" })
    } catch {
      /* ignore */
    }
    process.exit(0)
  }
  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
