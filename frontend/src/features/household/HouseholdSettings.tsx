import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth0 } from "@auth0/auth0-react"
import { DotsThreeVertical, LinkSimple, Moon, SignOut } from "@phosphor-icons/react"
import { PageShell } from "@/components/PageShell"
import { useTheme } from "@/theme/ThemeProvider"
import { cn } from "@/lib/cn"
import { householdApi } from "./api"
import type { HouseholdMember, Invite } from "./api"

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function roleLabel(role: string): string {
  return role === "Owner" ? "Tulajdonos" : "Tag"
}

export function HouseholdSettingsScreen() {
  const qc = useQueryClient()
  const { logout } = useAuth0()
  const { theme, toggle } = useTheme()
  const { data: household } = useQuery({
    queryKey: ["household", "me"], queryFn: householdApi.getMe
  })
  const [invite, setInvite] = useState<Invite | null>(null)
  const [nameDraft, setNameDraft] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const createInvite = useMutation({
    mutationFn: () => householdApi.createInvite(),
    onSuccess: (i) => setInvite(i)
  })
  const rename = useMutation({
    mutationFn: (name: string) => householdApi.update(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household", "me"] })
  })

  const currentName = nameDraft ?? household?.name ?? ""

  const copyInvite = async () => {
    if (!invite) return
    try {
      await navigator.clipboard.writeText(invite.inviteUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch { /* no clipboard access */ }
  }

  return (
    <PageShell title="Beállítások">
      {household && (
        <div className="flex flex-col gap-3">
          <section className="p-[18px] rounded-[20px] bg-surface-raised flex flex-col gap-3.5">
            <span className="text-[12.5px] font-medium text-ink-muted">Háztartás</span>
            <input
              value={currentName}
              onChange={e => setNameDraft(e.target.value)}
              onBlur={e => {
                const next = e.target.value.trim()
                if (next && next !== household.name) rename.mutate(next)
                setNameDraft(null)
              }}
              aria-label="Háztartás neve"
              className="min-h-[52px] px-4 rounded-[14px] border border-line bg-surface text-[16px] text-ink outline-none focus:border-brand"
            />

            <div className="flex flex-col">
              {household.members.map((m: HouseholdMember) => (
                <div key={m.id} className="flex items-center gap-3.5 min-h-14">
                  <span
                    className="grid place-items-center w-10 h-10 rounded-full text-[15px] font-medium shrink-0"
                    style={{ background: "var(--priCont)", color: "var(--priInk)" }}
                  >
                    {initials(m.displayName)}
                  </span>
                  <span className="flex-1 min-w-0 flex flex-col">
                    <span className="text-[15px] truncate">{m.displayName}</span>
                    <span className="text-[12.5px] text-ink-muted">{roleLabel(m.role)}</span>
                  </span>
                  <DotsThreeVertical size={18} weight="duotone" className="text-ink-muted" />
                </div>
              ))}
            </div>

            {invite && (
              <div
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-[14px]"
                style={{ background: "var(--bg)" }}
              >
                <LinkSimple size={20} weight="duotone" className="text-brand shrink-0" />
                <span className="flex-1 min-w-0 truncate text-[13.5px] text-ink-muted">
                  {invite.inviteUrl}
                </span>
                <button
                  type="button"
                  onClick={copyInvite}
                  className="min-h-10 px-3.5 rounded-full text-brand text-sm font-medium"
                >
                  {copied ? "Másolva" : "Másolás"}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => createInvite.mutate()}
              disabled={createInvite.isPending}
              className="min-h-12 rounded-3xl bg-brand text-brand-on text-[15px] font-medium disabled:opacity-60 active:scale-[.98]"
            >
              {invite ? "Új meghívó link" : "Tag meghívása"}
            </button>
            {createInvite.isError && (
              <p className="text-danger text-sm">Nem sikerült meghívót létrehozni.</p>
            )}
          </section>

          <section className="px-[18px] py-1.5 rounded-[20px] bg-surface-raised">
            <PrefRow
              icon={<Moon size={22} weight="duotone" />}
              name="Sötét téma"
              sub={theme === "dark" ? "Bekapcsolva" : "Kikapcsolva"}
              active={theme === "dark"}
              onToggle={toggle}
            />
          </section>

          <button
            type="button"
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="self-start inline-flex items-center gap-2 min-h-12 px-5 ml-1 rounded-3xl border border-line text-danger text-[15px] font-medium active:bg-danger-soft"
          >
            <SignOut size={18} weight="duotone" />
            Kijelentkezés
          </button>
        </div>
      )}
    </PageShell>
  )
}

function PrefRow({
  icon, name, sub, active, onToggle
}: {
  icon: React.ReactNode
  name: string
  sub: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-3.5 min-h-15 py-3">
      <span className="text-ink-muted">{icon}</span>
      <span className="flex-1 min-w-0 flex flex-col">
        <span className="text-[15px]">{name}</span>
        <span className="text-[12.5px] text-ink-muted">{sub}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        onClick={onToggle}
        className={cn(
          "w-13 h-8 flex items-center p-[3px] rounded-[16px] border-2 transition-colors",
          active ? "border-brand" : "border-line"
        )}
        style={{
          width: "52px",
          background: active ? "var(--priCont)" : "var(--surf)",
          justifyContent: active ? "flex-end" : "flex-start",
        }}
      >
        <span
          className="w-[22px] h-[22px] rounded-full transition-colors"
          style={{ background: active ? "var(--pri)" : "var(--mut)" }}
        />
      </button>
    </div>
  )
}
