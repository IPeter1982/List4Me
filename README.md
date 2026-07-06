# List4Me

Kategorizált listakezelő háztartásoknak. Monorepo: `/backend` (.NET 10 Minimal API + EF Core), `/frontend` (React + Vite + TS + Tailwind).

## Aktuális állapot

**Plan 3 (Realtime + E2E + Docker + CI) kész** — branch: `plan3-realtime-deploy`. Railway deploy (Phase K) és GitHub branch protection (L5) UI-alapú kézi lépések, code-side minden más él.

- ✅ Backend: **56/56 integrációs teszt zöld** (Plan 2's 50 + 1 FK regressziós + 2 prod-safety + 3 SignalR hub teszt)
- ✅ Frontend: tiszta build (816 KB / 23 KB CSS)
- ✅ SignalR `HouseholdHub` `/hubs/household` — per-háztartás group, `[Authorize]`, `AllowCredentials` CORS
- ✅ `IRealtimeNotifier` minden CRUD handler-ben — Lists / List items / Categories / Products / Templates / Members
- ✅ `frontend/src/features/realtime/useHouseholdRealtime` — automatikus reconnect, TanStack Query invalidation event-per-eventre
- ✅ Test-only endpoints `/api/test/reset` + `/api/test/login-as` (csak Test/Development env; Production-ban 404, integrációs teszttel bizonyítva)
- ✅ Playwright E2E workspace (`e2e/`), 8 zöld chromium spec (a two-user realtime spec browser-to-browser bizonyítja a hub-flow-t), 3 dokumentált fixme
- ✅ Multi-stage `Dockerfile.backend` (SDK build → aspnet non-root, HEALTHCHECK), prod-like `docker compose --profile prod-like up`
- ✅ CI: `.github/workflows/backend.yml`, `frontend.yml`, `e2e.yml` (PR-gate + main mirror)

**Plan 2 (Products + Lists + Templates) kész** — merge PR #3 → `main`. Részletek: `docs/superpowers/plans/2026-07-05-list4me-plan2-products-lists-templates.md`.

**Plan 1 (Foundation + Households + Categories) kész** — merge PR #1 → `main`. Részletek: `docs/superpowers/plans/2026-07-02-list4me-plan1-foundation.md`.

Következő: **Phase K + Plan 4** — Railway prod deploy (services + Auth0 prod tenant + `_redirects` + `DATABASE_URL` parse), GitHub branch protection, invite UI race + swipe E2E hardening. Részletek: `docs/superpowers/plans/2026-07-06-list4me-plan3-realtime-e2e-deploy.md` → *Completion log*.

## Előfeltételek

- .NET 10 SDK (10.0.301+)
- Node 20+ és pnpm 9+
- Docker Desktop
- Auth0 tenant (dev application + API resource)

## Első futtatás

1. Postgres indítása (docker-compose port map: **5433:5432**, hogy a helyi PG-vel ne ütközzön):
   ```
   docker compose up -d
   ```

2. Backend:
   ```
   cd backend
   dotnet ef database update --project src/List4Me.Api
   dotnet run --project src/List4Me.Api
   ```
   A Kestrel bindolása: `http://localhost:5058` (és `https://localhost:7211`).

3. Frontend:
   ```
   cd frontend
   cp .env.local.example .env.local   # töltsd ki az Auth0 kulcsokat
   pnpm install
   pnpm dev
   ```

4. Nyisd meg: `http://localhost:5173`

## Backend tesztek

```
dotnet test backend/List4Me.slnx
```

Testcontainers automatikusan indít egy Postgres 17 példányt véletlen porton — Docker Desktop-nak futnia kell.

## Frontend build

```
pnpm --filter frontend build
```

## Kézi smoke-checklist

Miután beállítottad az Auth0 tenant-et és mindhárom folyamat fut (Postgres, backend, frontend):

### Plan 1 (foundation)

- [ ] Auth0 login redirect + visszatérés a home-ra
- [ ] Új user esetén az onboarding képernyő megjelenik
- [ ] Háztartás létrehozása után 4 seed kategória látszik a rácsban a helyes Lucide ikonokkal (Bevásárlás / Hűtő / Fagyasztó / Nyaralás)
- [ ] Új kategória (`+` FAB) → ikonválasztó + "Készre jelölve" címke működik
- [ ] Meglévő kategória → alsó drawer → Szerkeszt / Törlés
- [ ] Törlés almenüvel: első koppintásra 409, majd "Kaszkádolt törlés bekapcsolása" → "Igen, törlés"
- [ ] Beállítások fül: tagok és háztartás név látszik, "Új meghívó" URL-t generál
- [ ] Második böngésző (inkognitó) → `/invite/:token` URL → Auth0 login → invite accept → home
- [ ] Beállítások fül mindkét usernél mindkét tagot listázza

### Plan 3 (realtime + E2E + docker)

- [ ] Backend Docker image: `docker build -f Dockerfile.backend -t l4m-backend .` → clean; `docker run … l4m-backend` + `curl /health` → 200 Production env
- [ ] Prod-like compose: `docker compose --profile prod-like up` → postgres + backend zöld
- [ ] Frontend E2E build: `pnpm --filter frontend build --mode e2e` → `.env.e2e` betölt, tiszta build
- [ ] E2E workspace: `pnpm --filter e2e test --project=chromium --workers=1` → 8 zöld + 3 fixme
- [ ] Két böngészőben ugyanaz a user: Alice létrehoz egy listát → Bob felület 2 mp-en belül frissül (SignalR)
- [ ] Két külön user egy háztartásban: A hozzáad tételt → B ListView-je automatikusan frissül
- [ ] Kill a backend → frontend "kapcsolat vesztve" állapot; backend újraindul → automatikus reconnect
- [ ] Prod env-ben `/api/test/reset` és `/api/test/login-as` → 404 (`ProductionSafetyTests` bizonyítja unit szinten)
- [ ] `/hubs/household` `Authorization: Bearer <érvénytelen>` → 401
- [ ] `.github/workflows/e2e.yml` sikeresen fut egy PR-en (services Postgres + backend Test env + Playwright chromium)

### Plan 2 (products + lists + templates)

- [ ] Kategória kártya → alsó drawer → "Termékek" → seedelt terméklista
- [ ] Termék keresése (`?q`) az inputba → gépelés közben szűkül
- [ ] "Kedvencek" chip → csak a kedvencek maradnak
- [ ] `+` FAB → új termék létrehozása; egy termék szerkesztése és törlése
- [ ] Alsó menü → Listák → üres állapot
- [ ] `+` FAB → új lista dialog → "Üres" → létrehoz és átugrik a `/lists/:id`-re
- [ ] A listaképernyő tetején mindig látható termékkereső → válassz meglévőt → tétel megjelenik
- [ ] Új név gépelése → "Új termék: ..." → egyben létrehoz + hozzáad
- [ ] Jobbra swipe egy tételen → áthúzva a "Kész" szekcióba
- [ ] Kész tételre koppintás → visszaáll aktívra
- [ ] Balra swipe → tétel eltűnik + alul "Vissza" toast 5 mp; ha "Vissza" → visszajön; ha nem → végleg törlődik
- [ ] Long-press tételen → részletek modal (mennyiség / egység / lejárat / jegyzet)
- [ ] Lejárat 3 napon belül → sárga badge; lejárt → piros
- [ ] Lista fejlécén könyvjelző ikon → SaveAsTemplateDialog → mentés
- [ ] Alsó menü → Sablonok → új sablon látszik; kinyitáskor a tételek is
- [ ] Alsó menü → Listák → `+` FAB → "Sablonból" → sablon kiválasztása → új lista ugyanezekkel a tételekkel
- [ ] Lista fejléc → archív ikon → eltűnik az aktívak közül; "Archívum" toggle → megjelenik
- [ ] Lista fejléc → kuka → megerősítés után eltűnik minden nézetből

## Spec és tervek

- Design spec: `docs/superpowers/specs/2026-07-02-list4me-design.md`
- Plan 1 (Foundation + Households + Categories): `docs/superpowers/plans/2026-07-02-list4me-plan1-foundation.md`
- Plan 2 (Products + Lists + Templates): `docs/superpowers/plans/2026-07-05-list4me-plan2-products-lists-templates.md`
- Plan 3 (Realtime + E2E + Docker + CI — jelen): `docs/superpowers/plans/2026-07-06-list4me-plan3-realtime-e2e-deploy.md`
