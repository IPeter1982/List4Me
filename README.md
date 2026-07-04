# List4Me

Kategorizált listakezelő háztartásoknak. Monorepo: `/backend` (.NET 10 Minimal API + EF Core), `/frontend` (React + Vite + TS + Tailwind).

## Aktuális állapot

**Plan 1 (Foundation + Households + Categories) kész** — branch: `plan1-foundation`, PR: [github.com/IPeter1982/List4Me/pulls](https://github.com/IPeter1982/List4Me/pulls).

- ✅ Backend: 20/20 integrációs teszt zöld (Testcontainers Postgres 17)
- ✅ Frontend: tiszta build (608 KB / gzip 189 KB)
- ✅ Auth0 login → onboarding (új háztartás / meghívó) → 4-fülű shell → kategória CRUD + IconPicker (62 Lucide ikon) + kaszkádolt törlés
- ⏳ Kézi smoke a lenti checklist alapján (Auth0 tenant + `.env.local` szükséges)

Következő: **Plan 2** — Products + Lists + Templates. Részletek és eltérések a tervhez képest: `docs/superpowers/plans/2026-07-02-list4me-plan1-foundation.md` → *Completion log*.

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

- [ ] Auth0 login redirect + visszatérés a home-ra
- [ ] Új user esetén az onboarding képernyő megjelenik
- [ ] Háztartás létrehozása után 4 seed kategória látszik a rácsban a helyes Lucide ikonokkal (Bevásárlás / Hűtő / Fagyasztó / Nyaralás)
- [ ] Új kategória (`+` FAB) → ikonválasztó + "Készre jelölve" címke működik
- [ ] Meglévő kategória → alsó drawer → Szerkeszt / Törlés
- [ ] Törlés almenüvel: első koppintásra 409, majd "Kaszkádolt törlés bekapcsolása" → "Igen, törlés"
- [ ] Beállítások fül: tagok és háztartás név látszik, "Új meghívó" URL-t generál
- [ ] Második böngésző (inkognitó) → `/invite/:token` URL → Auth0 login → invite accept → home
- [ ] Beállítások fül mindkét usernél mindkét tagot listázza

## Spec és tervek

- Design spec: `docs/superpowers/specs/2026-07-02-list4me-design.md`
- Plan 1 (jelen): `docs/superpowers/plans/2026-07-02-list4me-plan1-foundation.md`
- Plan 2 (Products + Lists + Templates) és Plan 3 (Realtime + E2E + Deploy) később.
