import { type ReactNode, useCallback } from "react"
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import { Check, Trash2 } from "lucide-react"

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
  const bg = useTransform(
    x,
    [-threshold, 0, threshold],
    ["#dc2626", "transparent", "#16a34a"],
  )
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
        className="pointer-events-none absolute inset-0 flex items-center justify-between px-4 text-white"
        style={{ background: bg }}
      >
        <motion.span className="flex items-center gap-1" style={{ opacity: leftOpacity }}>
          <Trash2 className="size-4" /> Törlés
        </motion.span>
        <motion.span className="flex items-center gap-1" style={{ opacity: rightOpacity }}>
          <Check className="size-4" /> {rightLabel}
        </motion.span>
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={onDragEnd}
        style={{ x }}
        className="relative bg-white dark:bg-neutral-900"
      >
        {children}
      </motion.div>
    </div>
  )
}
