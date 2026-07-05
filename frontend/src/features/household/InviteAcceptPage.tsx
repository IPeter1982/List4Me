import { useParams, useNavigate } from "react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { householdApi } from "./api"

export function InviteAcceptPage() {
  const { token = "" } = useParams()
  const nav = useNavigate()
  const qc = useQueryClient()

  const info = useQuery({
    queryKey: ["invite", token],
    queryFn: () => householdApi.getInvite(token),
    retry: false
  })

  const accept = useMutation({
    mutationFn: () => householdApi.acceptInvite(token),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["household", "me"] })
      nav("/", { replace: true })
    }
  })

  if (info.isLoading) return <div className="min-h-screen grid place-items-center">Betöltés…</div>
  if (info.isError) return (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <p>Érvénytelen vagy lejárt meghívó.</p>
    </div>
  )

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-sm text-center space-y-4">
        <h1 className="text-xl font-semibold">Csatlakozás</h1>
        <p>Meghívtak a(z) <strong>{info.data!.householdName}</strong> háztartáshoz.</p>
        <Button onClick={() => accept.mutate()} disabled={accept.isPending} className="w-full">
          Elfogadom
        </Button>
        {accept.isError && <p className="text-danger text-sm">Sikertelen elfogadás</p>}
      </div>
    </div>
  )
}
