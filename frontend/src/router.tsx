import type { ReactNode } from "react"
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { householdApi } from "@/features/household/api"
import { OnboardingHousehold } from "@/auth/OnboardingHousehold"
import { PageShell } from "@/components/PageShell"
import { ApiError } from "@/lib/api"
import { CategoryListScreen } from "@/features/categories/CategoryList"

function ListsScreen() { return <PageShell title="Listák"><div>Listák jönnek.</div></PageShell> }
function TemplatesScreen() { return <PageShell title="Sablonok"><div>Sablonok jönnek.</div></PageShell> }
function SettingsScreen() { return <PageShell title="Beállítások"><div>Beállítások jönnek.</div></PageShell> }

function OnboardingGate({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["household", "me"],
    queryFn: householdApi.getMe,
    retry: (n, err) => (err instanceof ApiError && err.status === 404 ? false : n < 1)
  })
  if (isLoading) return <div className="min-h-screen grid place-items-center">Betöltés…</div>
  if (error instanceof ApiError && error.status === 404) return <OnboardingHousehold />
  if (error) return <div className="p-6 text-danger">Hiba: {(error as Error).message}</div>
  if (!data) return <OnboardingHousehold />
  return <>{children}</>
}

const router = createBrowserRouter([
  {
    element: <OnboardingGate><Outlet /></OnboardingGate>,
    children: [
      { path: "/", element: <CategoryListScreen /> },
      { path: "/lists", element: <ListsScreen /> },
      { path: "/templates", element: <TemplatesScreen /> },
      { path: "/settings", element: <SettingsScreen /> },
      { path: "*", element: <Navigate to="/" replace /> }
    ]
  }
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
