import { forwardRef } from "react"
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from "react"
import * as D from "@radix-ui/react-dialog"
import { X } from "@phosphor-icons/react"
import { cn } from "@/lib/cn"

export const Dialog = D.Root
export const DialogTrigger = D.Trigger
export const DialogDescription = D.Description

type DialogContentProps = ComponentPropsWithoutRef<typeof D.Content> & {
  children: ReactNode
}

export const DialogContent = forwardRef<ElementRef<typeof D.Content>, DialogContentProps>(
  ({ children, className, ...props }, ref) => (
    <D.Portal>
      <D.Overlay className="fixed inset-0 bg-black/50 z-40" />
      <D.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
          "w-[90vw] max-w-md rounded-2xl bg-white p-6 shadow-xl",
          "dark:bg-neutral-900",
          className,
        )}
        {...props}
      >
        <D.Close
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1 hover:bg-neutral-100"
        >
          <X size={20} weight="duotone" />
        </D.Close>
        {children}
      </D.Content>
    </D.Portal>
  ),
)
DialogContent.displayName = "DialogContent"

type DialogTitleProps = ComponentPropsWithoutRef<typeof D.Title>

export const DialogTitle = forwardRef<ElementRef<typeof D.Title>, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <D.Title
      ref={ref}
      className={cn("text-lg font-semibold mb-2", className)}
      {...props}
    />
  ),
)
DialogTitle.displayName = "DialogTitle"
