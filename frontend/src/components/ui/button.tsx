import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

type Variant = "primary" | "secondary" | "ghost" | "danger"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const styles: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-blue-700 active:bg-blue-800",
  secondary: "bg-neutral-200 text-neutral-900 hover:bg-neutral-300",
  ghost: "bg-transparent hover:bg-neutral-100",
  danger: "bg-danger text-white hover:bg-red-700"
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
        "min-h-11 min-w-11 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        styles[variant],
        className
      )}
      {...rest}
    />
  )
)
Button.displayName = "Button"
