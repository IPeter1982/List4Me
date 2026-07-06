# List4Me

Kategorizált listakezelő háztartásoknak. Monorepo: `/backend` (.NET 10 Minimal API + EF Core), `/frontend` (React + Vite + TS + Tailwind).

## Aktuális állapot

**Plan 2 (Products + Lists + Templates) kész** — branch: `plan2-lists`, PR: [github.com/IPeter1982/List4Me/pulls](https://github.com/IPeter1982/List4Me/pulls).

- ✅ Backend: 50/50 integrációs teszt zöld (Testcontainers Postgres 17)
- ✅ Frontend: tiszta build (758 KB / gzip 236 KB) — bundle a framer-motion + zustand + új képernyők miatt nőtt
- ✅ Products slice: seedelt katalógus + kategória-scope, `?q` autocomplete (pg_trgm GIN index), `?favoritesOnly`, kedvenc jelölés per household member
- ✅ Lists slice: háztartás-scope, kategória-scope, `?archived` szűrő, üres vagy sablonból létrehozás, tétel-CRUD, `?/complete` + `?/uncomplete`
- ✅ Templates slice: sablon üresen vagy meglévő listából, listát sablonból (fromTemplateId)
- ✅ Cross-household izoláció integrációs tesztekkel bizonyítva (products/lists/templates)
- ✅ CVE-tiszta backend (Microsoft.OpenApi 2.9.0 + System.Security.Cryptography.Xml 10.0.9)
- ✅ Frontend UX: mindig látható termékkereső, framer-motion swipe (jobbra kész / balra törlés), zustand-alapú 5 mp-es undo toast, lejárati badge (piros/sárga/szürke), long-press részletek modal

**Plan 1 (Foundation + Households + Categories) kész** — branch: `plan1-foundation`. Részletek és eltérések: `docs/superpowers/plans/2026-07-02-list4me-plan1-foundation.md` → *Completion log*.

Következő: **Plan 3** — SignalR realtime, Playwright E2E, Docker + Railway deploy, CI/CD. Részletek: `docs/superpowers/plans/2026-07-05-list4me-plan2-products-lists-templates.md` → *Completion log*.

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
- Plan 2 (Products + Lists + Templates — jelen): `docs/superpowers/plans/2026-07-05-list4me-plan2-products-lists-templates.md`
- Plan 3 (Realtime + E2E + Deploy) később.
