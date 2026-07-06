import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, type ReactNode } from "react"
import { setTokenProvider } from "@/lib/api"
import { Button } from "@/components/ui/button"

const E2E_MODE = import.meta.env.VITE_E2E === "true"
const E2E_TOKEN_KEY = "l4m_e2e_token"

export function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, loginWithRedirect, getAccessTokenSilently, logout } = useAuth0()

  useEffect(() => {
    setTokenProvider(async () => {
      if (E2E_MODE) return window.localStorage.getItem(E2E_TOKEN_KEY)
      if (!isAuthenticated) return null
      try { return await getAccessTokenSilently() } catch { return null }
    })
  }, [isAuthenticated, getAccessTokenSilently])

  if (E2E_MODE) {
    const hasToken = window.localStorage.getItem(E2E_TOKEN_KEY) !== null
    if (!hasToken) {
      return <div className="min-h-screen grid place-items-center text-neutral-500">E2E: no token in localStorage</div>
    }
    return <>{children}</>
  }

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center text-neutral-500">Betöltés…</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="max-w-sm text-center space-y-4">
          <h1 className="text-3xl font-semibold">List4Me</h1>
          <p className="text-neutral-600">Kategorizált listák a háztartásodnak.</p>
          <Button onClick={() => loginWithRedirect()} className="w-full">Bejelentkezés</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {children}
      <button
        className="fixed top-3 right-3 text-xs text-neutral-500 hover:text-neutral-900"
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      >Kijelentkezés</button>
    </div>
  )
}
