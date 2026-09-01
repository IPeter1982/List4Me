import { Clock, WarningDiamond } from "@phosphor-icons/react"

type Props = { expiresOn: string | null }

export function ExpiryBadge({ expiresOn }: Props) {
  if (!expiresOn) return null
  const date = new Date(expiresOn)
  const now = new Date()
  const days = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  let bg: string
  let ink: string
  let Icon = Clock
  if (days < 0) {
    bg = "var(--dgBg)"; ink = "var(--dg)"; Icon = WarningDiamond
  } else if (days <= 3) {
    bg = "var(--wnBg)"; ink = "var(--wn)"; Icon = Clock
  } else {
    bg = "var(--cont2)"; ink = "var(--mut)"; Icon = Clock
  }

  const label =
    days < 0
      ? "lejárt"
      : days === 0
      ? "ma"
      : days <= 7
      ? `${days} nap`
      : new Intl.DateTimeFormat("hu-HU", { month: "short", day: "numeric" }).format(date)

  return (
    <span
      className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11.5px] font-medium"
      style={{ background: bg, color: ink }}
    >
      <Icon size={13} weight="duotone" />
      {label}
    </span>
  )
}
