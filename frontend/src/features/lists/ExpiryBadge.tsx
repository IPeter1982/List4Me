type Props = { expiresOn: string | null }

export function ExpiryBadge({ expiresOn }: Props) {
  if (!expiresOn) return null
  const date = new Date(expiresOn)
  const now = new Date()
  const days = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const color =
    days < 0
      ? "bg-red-600 text-white"
      : days <= 3
      ? "bg-yellow-500 text-black"
      : "bg-neutral-200 text-neutral-700"
  const label =
    days < 0
      ? "lejárt"
      : days === 0
      ? "ma"
      : days <= 3
      ? `${days} nap`
      : new Intl.DateTimeFormat("hu").format(date)
  return (
    <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-xs " + color}>
      {label}
    </span>
  )
}
