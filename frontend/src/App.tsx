import { AuthGate } from "@/auth/AuthGate"
import { AppRouter } from "@/router"

export default function App() {
  return (
    <AuthGate>
      <AppRouter />
    </AuthGate>
  )
}
