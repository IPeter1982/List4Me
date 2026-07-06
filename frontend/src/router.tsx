import type { ReactNode } from "react"
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { householdApi } from "@/features/household/api"
import { OnboardingHousehold } from "@/auth/OnboardingHousehold"
import { ApiError } from "@/lib/api"
import { CategoryListScreen } from "@/features/categories/CategoryList"
import { HouseholdSettingsScreen } from "@/features/household/HouseholdSettings"
import { InviteAcceptPage } from "@/features/household/InviteAcceptPage"
import { ProductList } from "@/features/products/ProductList"
import { ListsOverview } from "@/features/lists/ListsOverview"
import { ListView } from "@/features/lists/ListView"
import { TemplatesList } from "@/features/templates/TemplatesList"

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
  { path: "/invite/:token", element: <InviteAcceptPage /> },
  {
    element: <OnboardingGate><Outlet /></OnboardingGate>,
    children: [
      { path: "/", element: <CategoryListScreen /> },
      { path: "/lists", element: <ListsOverview /> },
      { path: "/lists/:id", element: <ListView /> },
      { path: "/templates", element: <TemplatesList /> },
      { path: "/categories/:id/products", element: <ProductList /> },
      { path: "/settings", element: <HouseholdSettingsScreen /> },
      { path: "*", element: <Navigate to="/" replace /> }
    ]
  }
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
