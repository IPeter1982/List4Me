import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm",
        "min-h-11 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand",
        className
      )}
      {...rest}
    />
  )
)
Input.displayName = "Input"
