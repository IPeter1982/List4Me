# List4Me

Kategorizált listakezelő háztartásoknak. Monorepo: `/backend` (.NET 10 Minimal API), `/frontend` (React + Vite + TS), `/e2e` (Playwright — later).

## Dev quickstart
```
docker compose up -d              # Postgres on 5432
cd backend && dotnet run --project src/List4Me.Api
cd frontend && pnpm install && pnpm dev
```

See `docs/superpowers/specs/2026-07-02-list4me-design.md`.
