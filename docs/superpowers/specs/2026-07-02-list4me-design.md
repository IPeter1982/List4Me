# List4Me — Design Spec

**Dátum:** 2026-07-02
**Státusz:** Draft (user review pending)
**Author:** Peter (ispanpeter82@gmail.com) + Claude brainstorming

---

## 1. Áttekintés

**List4Me** egy mobile-first webalkalmazás, amivel egy háztartás tagjai kategorizált listákat (nyaralás, bevásárlás, hűtő tartalma, fagyasztó tartalma) tudnak közösen kezelni. Minden listához termékek rendelhetők, minden listának saját termékkör van, és a listák menthetőek sablonként.

**Nem cél (out of scope MVP-ben):**
- Offline / PWA működés
- Barcode-scanner
- Fotó a termékekhez
- Push notification
- Több nyelv (i18n) — csak magyar
- Tetszőlegesen mély kategória fa (max 1 szint alkategória)
- Kategóriánként több lista összevonása / kevert lista
- Analytics, tracking pixel

---

## 2. Kulcs döntések (brainstorming eredmény)

| Terület | Döntés |
|---|---|
| Felhasználók | Több user, **háztartás megosztás** — egy háztartásban több tag, közös listák |
| Realtime sync | **SignalR** — 1-2 mp-en belül minden tagnál látszik a változás |
| Offline | Nem, csak online |
| Termékmodell | Név + default mennyiség + mértékegység + lejárat + jegyzet |
| Kategória-lista | 1 lista = 1 kategória (annak alkategóriáit is látja) |
| Alkategória mélység | 1 szint |
| UI nyelv | Csak magyar, hardcoded (nincs i18n) |
| Ikonok | Curated Lucide set (~80 ikon), kereshető picker |
| Auth | **Auth0** (SaaS), backend csak JWT-t validál |
| Seed adat | 4 default kategória + kb. 50 gyakori termék |
| "Készre jelölve" címke | Kategóriánként konfigurálható (`completed_label`) — pl. "Megvettem", "Elfogyott", "Bepakolva" |
| Törlés | Undo toast 5 mp-ig; utána soft delete |
| Kedvencek | User-specifikus (nem háztartás-szintű) |
| Sablonok | Háztartás-szintű, mindenki használhatja aki tag |
| Sablon items | Külön tábla (`ListTemplateItem`), nem JSON snapshot |
| Swipe | Balra = töröl (piros), Jobbra = készre jelöl (zöld) |
| Készre jelölt sor | Marad helyén, szürke áthúzva, tap-pel visszavonható |
| Backend arch | Vertical Slice + Minimal API |
| Frontend | React + Vite + TS, TanStack Query, React Router v7, Tailwind + shadcn/ui, framer-motion |
| Repo | Monorepo (`/backend`, `/frontend`, `/e2e`) |
| Deploy | Railway, 3 service: backend (Docker), frontend (static), Postgres (managed) |
| CI/CD | GitHub Actions PR-gate + Railway auto-deploy main-re |
| Test DB | Testcontainers backend integration teszthez; docker-compose külön Postgres E2E-hez |

---

## 3. Architektúra

```
┌──────────────────────────────────────────────────────────────────┐
│                       Böngésző (mobil-first)                     │
│  React + Vite SPA — Auth0 SDK, TanStack Query, SignalR JS kliens │
└────────────┬──────────────────────────────────┬──────────────────┘
             │ HTTPS REST/JSON                   │ WebSocket (SignalR)
             ▼                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Backend (.NET 10, Docker)                     │
│  Minimal API + Vertical Slice features                           │
│  Auth: Auth0 JWT validation (Microsoft.IdentityModel)            │
│  SignalR HouseholdHub — group per householdId                    │
│  EF Core 10 + Npgsql                                             │
└──────────────────────────┬───────────────────────────────────────┘
                           │ 5432
                           ▼
                ┌──────────────────────┐
                │  PostgreSQL (Railway) │
                └──────────────────────┘

Auth0 kezeli a bejelentkezést. A backend csak JWT-t validál (nem tárol user rekordot azon kívül,
hogy a HouseholdMember.auth0_user_id-t megkoti a JWT `sub` claim-jéhez).
```

**Railway service topológia (prod):**
- `backend` — Dockerfile, `PORT` és `DATABASE_URL` env-ek, `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `ALLOWED_ORIGIN`
- `frontend` — static hosting a Vite `dist/` output-ra, SPA fallback (`_redirects`: `/*  /index.html  200`)
- `postgres` — Railway managed Postgres

**Lokálisan (dev):**
- Postgres: `docker-compose.yml` (port 5432)
- Backend: `dotnet run` (port 5000)
- Frontend: `pnpm dev` (Vite, port 5173)
- Auth0: dev tenant / dev application

---

## 4. Adatmodell

Minden scope-olt entitás `household_id`-vel indul. Auth middleware ellenőrzi, hogy user csak a saját háztartását éri el.

### Táblák

**Household**
- `id` (uuid, PK)
- `name` (text)
- `created_at` (timestamptz)

**HouseholdMember**
- `id` (uuid, PK)
- `household_id` (FK Household)
- `auth0_user_id` (text, unique)
- `role` (enum: `owner`, `member`)
- `display_name` (text)
- `joined_at` (timestamptz)
- Index: `(auth0_user_id)`

**HouseholdInvite**
- `id` (uuid, PK)
- `household_id` (FK)
- `email` (text, nullable — ha csak link)
- `token` (uuid, unique)
- `expires_at` (timestamptz)
- `used_at` (timestamptz, nullable)
- `created_by_member_id` (FK)
- Index: `(token)`

**Category**
- `id` (uuid, PK)
- `household_id` (FK)
- `name` (text)
- `icon_key` (text — Lucide ikon név, pl. `shopping-cart`)
- `parent_category_id` (FK Category, nullable) — max 1 szint mélység, alkalmazás rétegben ellenőrizve
- `completed_label` (text — pl. "Megvettem", default: "Kész")
- `sort_order` (int)
- `created_at`, `updated_at` (timestamptz)
- `deleted_at` (timestamptz, nullable — soft delete)
- Index: `(household_id, deleted_at)`, `(parent_category_id)`

**Product**
- `id` (uuid, PK)
- `category_id` (FK Category)
- `name` (text)
- `default_quantity` (numeric, nullable)
- `default_unit` (text, nullable — pl. `db`, `kg`, `l`)
- `created_at`, `updated_at`
- `deleted_at` (nullable)
- Index: `(category_id, deleted_at)`, GIN index a `name`-en (autocomplete)

**FavoriteProduct**
- `household_member_id` (FK) — user-specifikus
- `product_id` (FK)
- `created_at`
- PK: `(household_member_id, product_id)`

**List**
- `id` (uuid, PK)
- `household_id` (FK)
- `category_id` (FK)
- `name` (text)
- `created_by_member_id` (FK)
- `from_template_id` (FK ListTemplate, nullable)
- `created_at`, `updated_at`
- `archived_at` (nullable)
- `deleted_at` (nullable)
- Index: `(household_id, archived_at, deleted_at)`

**ListItem**
- `id` (uuid, PK)
- `list_id` (FK List)
- `product_id` (FK Product)
- `quantity` (numeric, nullable)
- `unit` (text, nullable)
- `expires_on` (date, nullable)
- `note` (text, nullable)
- `is_completed` (bool, default false)
- `completed_at` (timestamptz, nullable)
- `completed_by_member_id` (FK, nullable)
- `sort_order` (int)
- `created_at`, `updated_at`
- Index: `(list_id, is_completed)`

**ListTemplate**
- `id` (uuid, PK)
- `household_id` (FK)
- `category_id` (FK)
- `name` (text)
- `created_by_member_id` (FK)
- `created_at`
- Index: `(household_id, category_id)`

**ListTemplateItem**
- `id` (uuid, PK)
- `template_id` (FK ListTemplate)
- `product_id` (FK Product)
- `quantity` (numeric, nullable)
- `unit` (text, nullable)
- `note` (text, nullable)
- `sort_order` (int)

### Kulcs modell döntések

- **Soft delete** minden entitáson, ami listaelemben hivatkozhat (Category, Product) — ez lehetővé teszi, hogy régi lista-nézetek ne törjenek össze törlés után.
- **Auth0 user profil** nem másolódik le. A `HouseholdMember.auth0_user_id` a JWT `sub` claim-jével matchel. Ha user email/név kell, JWT claim-ből olvassuk (belépéskor `display_name` frissül).
- **1 szint alkategória** — `parent_category_id != null AND parent.parent_category_id != null` → alkalmazás rétegben visszautasítjuk.
- **Termékek kategória-scope** — nincs "közös termékkészlet"; minden termék egy adott Category-hoz tartozik. Alkategória Category-jai öröklik a szülő "látótávolságát" listaszerkesztéskor (a lista a főkategóriához van kötve, és a főkategória összes almákategóriájából elérhet termékeket).
- **Cascade törlés:** nincs adatbázis szintű cascade — alkalmazás rétegben végezzük soft delete-tel és ellenőrzésekkel (pl. Category törléskor jelezni: "3 lista és 24 termék is törlődni fog").

---

## 5. Backend API

**Convention:**
- Base URL: `/api`
- Auth: minden `/api/*` végpont Auth0 JWT-t vár (Authorization: Bearer ...)
- Válasz: JSON, `camelCase`
- Hiba: RFC 7807 Problem Details
- Middleware: request-en beemeli az aktuális `HouseholdMember`-t; ellenőrzi, hogy erőforrás annak háztartásához tartozik-e

### Household + tagok
```
POST   /api/households                     — { name } → új háztartás, kérő automatikusan owner
GET    /api/households/me                  — aktuális háztartás + tagok
PATCH  /api/households/me                  — { name } (owner)
POST   /api/households/me/invites          — { email? } → { token, inviteUrl }
GET    /api/invites/{token}                — meghívó info (auth kell)
POST   /api/invites/{token}/accept         — csatlakozás
DELETE /api/households/me/members/{id}     — tag eltávolítás (owner)
```

### Kategóriák
```
GET    /api/categories                     — összes háztartáshoz tartozó, nested (alkategóriákkal)
POST   /api/categories                     — { name, iconKey, parentCategoryId?, completedLabel? }
PATCH  /api/categories/{id}
DELETE /api/categories/{id}                — soft delete; ?force=true a kaszkádolt törléshez
```

### Termékek
```
GET    /api/categories/{id}/products       — kategória + alkategóriái termékei
                                             ?favoritesOnly=true, ?q=alma
POST   /api/categories/{id}/products       — { name, defaultQuantity?, defaultUnit? }
PATCH  /api/products/{id}
DELETE /api/products/{id}                  — soft delete
POST   /api/products/{id}/favorite         — kedvenc jelölés (user-scoped)
DELETE /api/products/{id}/favorite
```

### Listák
```
GET    /api/lists                          — ?categoryId, ?archived=false
POST   /api/lists                          — { name, categoryId, fromTemplateId? }
GET    /api/lists/{id}                     — lista + items részletesen
PATCH  /api/lists/{id}                     — { name?, archived? }
DELETE /api/lists/{id}                     — soft delete

POST   /api/lists/{id}/items                    — { productId, quantity?, unit?, expiresOn?, note? }
PATCH  /api/lists/{id}/items/{itemId}           — { quantity?, unit?, expiresOn?, note? }
POST   /api/lists/{id}/items/{itemId}/complete
POST   /api/lists/{id}/items/{itemId}/uncomplete
DELETE /api/lists/{id}/items/{itemId}
```

### Template-ek
```
GET    /api/templates                      — ?categoryId
POST   /api/templates                      — { name, categoryId, sourceListId? }
GET    /api/templates/{id}                 — template + items
DELETE /api/templates/{id}
```

### Realtime — SignalR
```
Hub URL: /hubs/household
Auth: JWT

Connect → server: Groups.AddToGroupAsync(householdId.ToString())

Broadcast eventek (backend → frontend):
  ListCreated / ListUpdated / ListDeleted { list }
  ListItemCreated / ListItemUpdated / ListItemDeleted { listId, item | itemId }
  ListItemCompleted / ListItemUncompleted { listId, itemId, completedBy }
  CategoryCreated / CategoryUpdated / CategoryDeleted { category | categoryId }
  ProductCreated / ProductUpdated / ProductDeleted { categoryId, product | productId }
  MemberJoined / MemberRemoved { member | memberId }

Kliens: eventek → TanStack Query cache invalidation / setQueryData
```

### Egyéb API döntések
- **Validáció:** FluentValidation feature-önként
- **Rate limit:** ~100 req/perc / IP
- **OpenAPI:** `/swagger` csak Dev/Test env-ben
- **CORS:** csak `ALLOWED_ORIGIN` engedélyezve (prod: Railway frontend URL, dev: `http://localhost:5173`)
- **Pagination:** `?page&limit`, default 50, max 200 (nagy adathalmazokra készülve, de családi méretben ritkán fog kelleni)
- **Logging:** Serilog → stdout; Dev-ben szép konzol, Prod-ban JSON
- **Health:** `GET /health` — Postgres kapcsolat ping
- **Test-only endpointok** (`ASPNETCORE_ENVIRONMENT=Test` esetén regisztrálva):
  - `POST /api/test/reset` — DB drop + migrate + seed
  - `POST /api/test/login-as` — { auth0UserId } → JWT teszt-cél (**csak Test env-ben**, prod build assemblyben nincs is)

---

## 6. Frontend struktúra

### Könyvtárfa
```
frontend/
├── src/
│   ├── main.tsx                    Auth0Provider + QueryClientProvider + Router
│   ├── App.tsx
│   ├── router.tsx                  React Router v7
│   ├── lib/
│   │   ├── api.ts                  fetch wrapper, JWT injection
│   │   ├── queryClient.ts          TanStack Query config
│   │   ├── signalr.ts              SignalR singleton
│   │   └── icons.ts                curated Lucide set + search
│   ├── auth/
│   │   ├── AuthGate.tsx
│   │   └── OnboardingHousehold.tsx
│   ├── features/
│   │   ├── categories/  (CategoryList, CategoryCard, CategoryEditor, IconPicker, SubcategoryTabs)
│   │   ├── products/    (ProductList, ProductEditor, FavoriteToggle)
│   │   ├── lists/       (ListsOverview, NewListDialog, ListView, ListItem, ProductPicker, ExpiryBadge)
│   │   ├── templates/   (TemplatesList, SaveAsTemplateDialog)
│   │   ├── household/   (HouseholdSettings, InviteAcceptPage)
│   │   └── realtime/    (useHouseholdRealtime hook)
│   ├── components/                 shadcn/ui + saját (SwipeableRow, UndoToast, BottomNav)
│   └── styles/globals.css
├── tests/unit/                     Vitest + Testing Library
├── vite.config.ts, tailwind.config.ts, tsconfig.json, package.json
```

### Routing
```
/                          CategoryList (főképernyő)
/categories/:id            CategoryDetail (termékek + listák a kategóriában)
/categories/:id/products   ProductList (kezelés)
/lists                     ListsOverview
/lists/:id                 ListView
/templates                 TemplatesList
/settings                  HouseholdSettings
/invite/:token             InviteAcceptPage
```

Alul fix `BottomNav` 4 tab: **Kategóriák | Listák | Sablonok | Beállítások**.

### Kritikus UX flow-k

**Új lista létrehozása** — kategória képernyőn "Új lista" gomb → dialog: "Üres" vagy "Sablonból" (dropdown a kategória sablonjaiból) + név mező → átirányít `/lists/:id`-re.

**Termék hozzáadás a listához** — lista tetején **fix keresőmező** (mindig látszik). Gépeléskor autocomplete dropdown a kategória (+ alkategóriái) termékeiből. Tap → item hozzáadva, mező tisztul, fókusz marad. Ha nincs találat, "+ Új termék: '…'" opció megjelenik. Üres mezőnél a kedvencek chip-formában legfelül.

**Swipe** — `SwipeableRow` (framer-motion pan gesture):
- Bal > 100 px → piros háttér "Törlés" → DELETE + UndoToast 5 mp
- Jobb > 100 px → zöld háttér a kategória `completed_label`-jével ("Megvettem" / "Elfogyott" / "Bepakolva") → complete → sor szürke áthúzott
- Áthúzott soron rövid tap → uncomplete
- Hosszú tap bármikor → részletek modal (mennyiség, lejárat, jegyzet)

**Realtime esemény** — SignalR event → `useHouseholdRealtime` hook → `queryClient.setQueryData` vagy `invalidateQueries`. Optimistic update saját action-öknél (nem várunk realtime echo-ra a saját eszközön).

**Első bejelentkezés** — Auth0 redirect után `AuthGate` → `GET /api/households/me` 404 esetén `OnboardingHousehold` képernyő: "Új háztartás" vagy "Meghívó link beillesztése". 200 esetén továbbengedés.

### Design tokenek
- Színek: neutral alap + két akcentszín (siker=zöld, veszély=piros)
- Font: system stack (`-apple-system, Inter fallback`)
- Spacing skála: 4/8/16/24/32/48
- Touch target min: 44×44 px
- Safe area: `env(safe-area-inset-bottom)` a BottomNav-nak
- Dark mode: `prefers-color-scheme` követi

### State management
- **Server state:** TanStack Query (kanonikus forrás)
- **URL state:** React Router search params (aktív filter)
- **Ephemeral UI:** komponens `useState`
- **Zustand:** csak ha valamit több komponens megoszt (kezdésben nem biztos hogy kell — pl. UndoToast queue lehet globális)

---

## 7. Tesztelési stratégia

### Backend
```
List4Me.Tests.Unit           xUnit + FluentAssertions (handler unit tesztek)
List4Me.Tests.Integration    xUnit + Testcontainers.PostgreSql + WebApplicationFactory
  Fixtures/PostgresFixture.cs    — Postgres container per test collection
  Auth/FakeJwtAuthHandler.cs     — Auth0 bypass tesztben, tetszőleges user injektálható
  Api/*EndpointTests.cs          — end-to-end végpont tesztek
  Api/HouseholdIsolationTests.cs — KRITIKUS: user A ne lásson user B adatot (403/404)
  Api/RealtimeHubTests.cs        — 2 test kliens, verify broadcast megjön
```

**DB reset:** minden teszt saját tranzakcióban, rollback a végén.

### Frontend
```
frontend/tests/unit          Vitest + @testing-library/react, MSW mock API
```
Nem coverage-hajszolás — csak komplex logika: swipe threshold, undo timer, autocomplete filter.

### E2E (Playwright, monorepo /e2e package)
```
e2e/
├── playwright.config.ts
├── docker-compose.test.yml         Postgres port 5433
├── fixtures/                       auth bypass, seed, test household
├── specs/
│   ├── smoke.spec.ts
│   ├── new-list-empty.spec.ts
│   ├── new-list-from-template.spec.ts
│   ├── swipe-complete.spec.ts
│   ├── swipe-delete-undo.spec.ts
│   ├── autocomplete-add-product.spec.ts
│   ├── favorites.spec.ts
│   ├── realtime-two-users.spec.ts  2 browser context
│   ├── household-invite.spec.ts
│   └── mobile-viewport.spec.ts     iPhone 14, safe area
```

**Test DB izoláció:**
- `docker-compose.test.yml` külön Postgres containert indít **5433-as porton**
- Backend `ASPNETCORE_ENVIRONMENT=Test` — test-only endpointok aktívak
- Test előtt `POST /api/test/reset` — drop + migrate + seed alapállapot
- Auth flow-t `/api/test/login-as` helyettesíti (nem valódi Auth0)

**Playwright run script:**
```
pnpm test:e2e →
  1. docker-compose -f e2e/docker-compose.test.yml up -d
  2. Backend Test env-vel háttérben (várunk /health-re)
  3. Frontend build szerve háttérben (port 5174)
  4. playwright test
  5. cleanup: docker-compose down, kill folyamatok
```

---

## 8. Deployment

### Railway prod

**backend service**
- Multi-stage Dockerfile: `.NET 10 SDK` build → `.NET 10 runtime` non-root user
- Env: `ConnectionStrings__Default`, `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `ALLOWED_ORIGIN`, `ASPNETCORE_ENVIRONMENT=Production`
- Migráció: külön Railway "predeploy" job vagy backend startup `db.Database.Migrate()` (első deploy-nál egyszerű, később ha zavaró — külön job)
- Healthcheck: `/health`

**frontend service**
- Railway "static site" — Vite `dist/`
- Build env: `VITE_API_URL`, `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`
- `_redirects`: `/*  /index.html  200`

**postgres service**
- Railway managed Postgres
- `DATABASE_URL` auto-injektálva a backendbe

**Auth0**
- Egy tenant, két Application (dev, prod)
- API Resource: "List4Me API" (audience)
- Callback URL-ek per environment

### Local dev
- `docker-compose.yml` Postgres-hez (port 5432)
- `dotnet run` a backendhez
- `pnpm dev` a frontendhez
- Auth0 dev tenant

### CI (GitHub Actions)
```
.github/workflows/
├── backend.yml     PR: dotnet test (Testcontainers Docker action)
├── frontend.yml    PR: typecheck + lint + vitest
├── e2e.yml         PR: docker-compose + playwright
└── deploy.yml      main: Railway deploy trigger
```

PR merge blokkolt, amíg backend + frontend + e2e nem zöld. Auto-deploy csak main-re.

### Non-MVP prod ajánlások
- Sentry error tracking (frontend + backend)
- Railway managed Postgres daily backup (jár Hobby plan-nel is)
- Uptime monitor `/health`-re

---

## 9. Nyitott / későbbi kérdések

Ezeket **most nem** oldjuk meg, de dokumentálva vannak:

- **Migráció induláskor vs. külön job.** MVP: startup migration. Ha később nagy adathalmaznál kritikus, dedikált Railway job.
- **`/api/test/*` biztonság.** Csak `ASPNETCORE_ENVIRONMENT=Test` esetén regisztrálva. Prod build assemblyben nincs is (feature flag build-time), + integration teszt ami ellenőrzi hogy prod env-ben 404-et adnak.
- **Playwright a monorepo `/e2e` mappában külön package.json-nal** — nem szennyezzük a frontend deps-et.
- **Sablon vs. lista frissítés.** Ha egy sablon módosul, a belőle létrehozott listákra nem hat vissza (`from_template_id` csak tracking).
- **Kategória kaszkád törlés UI.** `DELETE ?force=true` vagy külön dialog megerősítéssel — MVP-ben dialog, backend a `force` flaget várja.
- **Sort order a listán.** MVP: hozzáadás sorrendje (`sort_order` auto-incrementált). Drag reorder későbbi feature.
- **Lejárat vizualizáció.** MVP: dátum megjelenítés + színes badge (piros ha lejárt, sárga ha 3 napon belül). Reminder / értesítés későbbi feature.
- **Owner átadás / háztartás törlés.** MVP: owner nem távolíthatja el magát, ha ő az egyetlen owner. Háztartás törlés MVP-ben nincs (support ticket).

---

## 10. Definition of Done (MVP)

Egy MVP release akkor kész, ha:
1. Két külön browser-ben belogolt user egy háztartásban tudnak listát szerkeszteni, és a változások realtime látszanak.
2. Kategóriák, alkategóriák, termékek, listák, template-ek CRUD működik.
3. Swipe balra / jobbra működik mobil viewport-on.
4. Új lista létrehozáskor a "Üres / Sablonból" választás megjelenik.
5. Kedvencek szűrő működik.
6. Undo toast törléskor megjelenik és visszaállítja az elemet a 5 mp-en belül.
7. Backend + frontend + E2E tesztek zöldek CI-ben.
8. Prod Railway deploy Auth0-lal él, `/health` 200-at ad, két különböző eszközön mindkettő tud belépni.
9. Kategóriánkénti `completed_label` konfigurálható.
