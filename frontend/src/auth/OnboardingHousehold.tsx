import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { householdApi } from "@/features/household/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function OnboardingHousehold() {
  const qc = useQueryClient()
  const [name, setName] = useState("")
  const [token, setToken] = useState("")
  const [tab, setTab] = useState<"create" | "join">("create")

  const create = useMutation({
    mutationFn: () => householdApi.create(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household", "me"] })
  })
  const accept = useMutation({
    mutationFn: () => householdApi.acceptInvite(token.trim()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household", "me"] })
  })

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h2 className="text-xl font-semibold text-center">Kezdjük!</h2>

        <div className="flex gap-2">
          <Button variant={tab === "create" ? "primary" : "ghost"} onClick={() => setTab("create")} className="flex-1">
            Új háztartás
          </Button>
          <Button variant={tab === "join" ? "primary" : "ghost"} onClick={() => setTab("join")} className="flex-1">
            Meghívó elfogadása
          </Button>
        </div>

        {tab === "create" ? (
          <div className="space-y-3">
            <label htmlFor="household-name" className="block text-sm">Háztartás neve</label>
            <Input id="household-name" value={name} onChange={e => setName(e.target.value)} placeholder="Pl. Kovács család" />
            <Button
              onClick={() => create.mutate()}
              disabled={!name.trim() || create.isPending}
              className="w-full"
            >Létrehoz</Button>
            {create.isError && <p className="text-danger text-sm">Sikertelen létrehozás</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <label htmlFor="invite-token" className="block text-sm">Meghívó token vagy URL</label>
            <Input id="invite-token" value={token} onChange={e => {
              const v = e.target.value.trim()
              const match = v.match(/([0-9a-f-]{36})$/i)
              setToken(match ? match[1] : v)
            }} placeholder="pl. 3f2b…-token" />
            <Button
              onClick={() => accept.mutate()}
              disabled={!token || accept.isPending}
              className="w-full"
            >Csatlakozás</Button>
            {accept.isError && <p className="text-danger text-sm">Érvénytelen vagy lejárt meghívó</p>}
          </div>
        )}
      </div>
    </div>
  )
}
