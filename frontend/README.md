# List4Me — Frontend

React 19 + Vite + TypeScript + Tailwind CSS v4 SPA a List4Me backendhez.

## Fejlesztés

```bash
pnpm install                 # root könyvtárból is működik: pnpm --filter frontend install
cp .env.local.example .env.local
# töltsd ki: VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_AUTH0_AUDIENCE, VITE_API_URL
pnpm dev                     # http://localhost:5173
```

A backend Kestrel-je alapból `http://localhost:5058`-en fut. Ha máshol, állítsd be `VITE_API_URL`-t.

## Parancsok

| Parancs         | Mit csinál                                              |
| --------------- | ------------------------------------------------------- |
| `pnpm dev`      | Vite dev szerver HMR-rel                                |
| `pnpm build`    | Production build → `dist/`                              |
| `pnpm preview`  | A `dist/` kiszolgálása lokálisan                        |
| `pnpm lint`     | Oxlint (React + TypeScript szabályok)                   |
| `pnpm typecheck`| `tsc --noEmit` — projekt szintű típusellenőrzés         |

## Mappastruktúra

```
src/
├── main.tsx                  # StrictMode > Auth0 > QueryClient > App
├── router.tsx                # react-router v7 config (invite-route toplevel!)
├── auth/
│   ├── AuthGate.tsx          # Auth0 loading / login / logged-in states
│   ├── OnboardingGate.tsx    # háztartás nélküli usert onboardingra tereli
│   ├── OnboardingHousehold.tsx
│   └── InviteAcceptPage.tsx  # /invite/:token
├── components/
│   ├── PageShell.tsx         # sticky title + safe-area padding
│   ├── BottomNav.tsx         # 4-tabs mobil nav
│   └── ui/                   # Button, Input, Dialog (Radix + Tailwind)
├── features/
│   ├── household/            # api, HouseholdSettings
│   └── categories/           # api, CategoryList, CategoryEditor, CategoryCard, IconPicker
└── lib/
    ├── api.ts                # fetch wrapper + ApiError + setTokenProvider pattern
    ├── queryClient.ts        # TanStack Query defaults
    ├── icons.ts              # 62 kebab-case → Lucide ikon mapping
    └── cn.ts                 # tailwind-merge + clsx
```

## Fontos konvenciók

- **TS strict:** `verbatimModuleSyntax` + `erasableSyntaxOnly` bekapcsolva. Használj `import type { … }`-ot típusoknál, kerüld a parameter-property osztály konstruktorokat.
- **Path alias:** `@/…` → `src/…` (`vite.config.ts` + `tsconfig.json`).
- **Router:** react-router **v7**, `react-router-dom` NEM kell. `NavLink`, `useParams`, `Outlet` mind a `react-router` csomagból.
- **Auth pattern:** `api.ts` egy modul-scope `tokenProvider`-en át kéri a JWT-t. `AuthGate` egy `useEffect`-ben állítja be az Auth0 `getAccessTokenSilently` függvénnyel — így a `queryFn`-ek maradhatnak sync-nek.
- **Ikonkulcsok:** kebab-case string, `iconRegistry`-vel Lucide komponensre feloldva. A backend `IconKeys.cs` a source of truth — ha új kulcs kell, oda is add hozzá.

## Környezet

`.env.local.example` sablon:

```
VITE_AUTH0_DOMAIN=your-tenant.eu.auth0.com
VITE_AUTH0_CLIENT_ID=xxx
VITE_AUTH0_AUDIENCE=https://api.list4me.local
VITE_API_URL=http://localhost:5058
```

## Kézi teszt

A root `README.md` "Kézi smoke-checklist" szekciója írja le a teljes login → onboarding → kategória CRUD → meghívó folyamatot.
