import { AuthGate } from "@/auth/AuthGate"

export default function App() {
  return (
    <AuthGate>
      <div className="p-6">Bejelentkezve.</div>
    </AuthGate>
  )
}
