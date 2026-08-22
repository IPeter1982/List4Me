import { type ReactNode, useCallback } from "react"
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import { CheckCircle, Trash } from "@phosphor-icons/react"

type Props = {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  rightLabel?: string
  threshold?: number
}

export function SwipeableRow({
  children,
  onSwipeLeft,
  onSwipeRight,
  rightLabel = "Kész",
  threshold = 100,
}: Props) {
  const x = useMotionValue(0)
  const rightOpacity = useTransform(x, [0, threshold * 0.7, threshold], [0, 0.6, 1])
  const leftOpacity = useTransform(x, [-threshold, -threshold * 0.7, 0], [1, 0.6, 0])

  const onDragEnd = useCallback(
    (_e: unknown, info: PanInfo) => {
      if (info.offset.x <= -threshold && onSwipeLeft) onSwipeLeft()
      else if (info.offset.x >= threshold && onSwipeRight) onSwipeRight()
      x.set(0)
    },
    [onSwipeLeft, onSwipeRight, threshold, x],
  )

  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-end gap-2 px-6"
        style={{ background: "var(--dgBg)", color: "var(--dg)", opacity: leftOpacity }}
      >
        <span className="text-sm font-medium">Törlés</span>
        <Trash size={22} weight="duotone" />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center gap-2 px-6"
        style={{ background: "var(--okBg)", color: "var(--ok)", opacity: rightOpacity }}
      >
        <CheckCircle size={22} weight="duotone" />
        <span className="text-sm font-medium">{rightLabel}</span>
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={onDragEnd}
        style={{ x, background: "var(--bg)" }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  )
}
