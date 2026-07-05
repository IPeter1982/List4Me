import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useAuth0 } from "@auth0/auth0-react"
import { Copy, UserPlus } from "lucide-react"
import { PageShell } from "@/components/PageShell"
import { Button } from "@/components/ui/button"
import { householdApi } from "./api"
import type { Invite } from "./api"

export function HouseholdSettingsScreen() {
  const { logout } = useAuth0()
  const { data: household } = useQuery({
    queryKey: ["household", "me"], queryFn: householdApi.getMe
  })
  const [invite, setInvite] = useState<Invite | null>(null)
  const createInvite = useMutation({
    mutationFn: () => householdApi.createInvite(),
    onSuccess: setInvite
  })

  return (
    <PageShell title="Beállítások">
      {household && (
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-medium text-neutral-500 mb-2">HÁZTARTÁS</h2>
            <div className="rounded-lg border p-3 bg-white dark:bg-neutral-900">
              <div className="font-medium">{household.name}</div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium text-neutral-500 mb-2">TAGOK</h2>
            <ul className="rounded-lg border bg-white divide-y dark:bg-neutral-900">
              {household.members.map(m => (
                <li key={m.id} className="p-3 flex justify-between">
                  <span>{m.displayName}</span>
                  <span className="text-xs text-neutral-500">{m.role === "Owner" ? "Tulajdonos" : "Tag"}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-medium text-neutral-500 mb-2">MEGHÍVÓ</h2>
            <Button onClick={() => createInvite.mutate()} disabled={createInvite.isPending}>
              <UserPlus className="size-4 mr-2" />Új meghívó
            </Button>
            {invite && (
              <div className="mt-3 rounded-lg border p-3 bg-white dark:bg-neutral-900">
                <p className="text-sm break-all">{invite.inviteUrl}</p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(invite.inviteUrl)}
                  className="mt-2 text-brand text-sm inline-flex items-center gap-1"
                >
                  <Copy className="size-4" /> Másolás
                </button>
              </div>
            )}
          </section>

          <Button variant="ghost" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            Kijelentkezés
          </Button>
        </div>
      )}
    </PageShell>
  )
}
