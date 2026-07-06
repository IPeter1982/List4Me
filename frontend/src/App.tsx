import { AuthGate } from "@/auth/AuthGate"
import { AppRouter } from "@/router"
import { UndoToast } from "@/components/UndoToast"

export default function App() {
  return (
    <AuthGate>
      <AppRouter />
      <UndoToast />
    </AuthGate>
  )
}
