import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { HouseLine, LinkSimple, ListChecks } from "@phosphor-icons/react"
import { householdApi } from "@/features/household/api"

export function OnboardingHousehold() {
  const qc = useQueryClient()
  const [name, setName] = useState("")
  const [token, setToken] = useState("")

  const create = useMutation({
    mutationFn: () => householdApi.create(name.trim() || "Új háztartás"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household", "me"] })
  })
  const accept = useMutation({
    mutationFn: () => householdApi.acceptInvite(token.trim()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household", "me"] })
  })

  return (
    <div
      className="min-h-screen w-full flex flex-col gap-7 bg-surface-bg text-ink"
      style={{ padding: "48px 24px 40px" }}
    >
      <div className="flex items-center gap-3">
        <span
          className="grid place-items-center w-12 h-12 rounded-2xl shrink-0"
          style={{ background: "var(--priCont)", color: "var(--priInk)" }}
        >
          <ListChecks size={26} weight="duotone" />
        </span>
        <span className="text-[22px] font-bold tracking-tight">List4Me</span>
      </div>

      <div>
        <h2 className="text-[32px] leading-tight font-bold tracking-tight mb-3">
          Egy lista az egész háznak
        </h2>
        <p className="text-[15px] leading-relaxed text-ink-muted">
          Bevásárlás, hűtő, fagyasztó, nyaralás. Mindenki ugyanazt látja, azonnal.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div
          className="flex flex-col gap-3 p-5 rounded-[20px]"
          style={{ background: "var(--pri)", color: "var(--priC)", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }}
        >
          <div className="flex items-start gap-3.5">
            <HouseLine size={26} weight="duotone" className="mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] font-medium">Új háztartás létrehozása</span>
              <span className="text-[12.5px] opacity-85">Te leszel az adminisztrátor</span>
            </div>
          </div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="pl. Kovács család"
            aria-label="Háztartás neve"
            className="min-h-[52px] px-4 rounded-[14px] border-0 text-[15px] outline-none"
            style={{ background: "rgba(255,255,255,.15)", color: "var(--priC)" }}
          />
          <button
            type="button"
            onClick={() => create.mutate()}
            disabled={create.isPending}
            className="min-h-12 rounded-3xl text-[15px] font-medium disabled:opacity-60 active:scale-[.98]"
            style={{ background: "var(--priC)", color: "var(--pri)" }}
          >
            Létrehozás
          </button>
          {create.isError && <p className="text-[13px] opacity-90">Sikertelen létrehozás.</p>}
        </div>

        <div className="flex flex-col gap-3 p-5 rounded-[20px] bg-surface-raised">
          <span className="flex items-center gap-2.5 text-[16px] font-medium">
            <LinkSimple size={22} weight="duotone" className="text-brand" />
            Meghívó beillesztése
          </span>
          <input
            value={token}
            onChange={e => {
              const v = e.target.value.trim()
              const match = v.match(/([0-9a-f-]{36})$/i)
              setToken(match ? match[1] : v)
            }}
            placeholder="list4me.hu/j/…"
            aria-label="Meghívó token vagy URL"
            className="min-h-[52px] px-4 rounded-[14px] border border-line bg-surface text-[15px] text-ink outline-none focus:border-brand"
          />
          <button
            type="button"
            onClick={() => accept.mutate()}
            disabled={!token || accept.isPending}
            className="min-h-12 rounded-3xl border border-line text-brand text-[15px] font-medium disabled:opacity-60 active:bg-surface-sunken"
          >
            Csatlakozás a háztartáshoz
          </button>
          {accept.isError && <p className="text-danger text-sm">Érvénytelen vagy lejárt meghívó.</p>}
        </div>
      </div>

      <p className="mt-auto text-[12.5px] leading-relaxed text-ink-muted">
        A meghívó linket bármelyik tag megoszthatja. Bármikor tudsz csatlakozni másik háztartáshoz is a Beállításokból.
      </p>
    </div>
  )
}
