import { forwardRef } from "react"
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from "react"
import * as D from "@radix-ui/react-dialog"
import { cn } from "@/lib/cn"

export const Sheet = D.Root
export const SheetTrigger = D.Trigger
export const SheetDescription = D.Description

type SheetContentProps = ComponentPropsWithoutRef<typeof D.Content> & {
  children: ReactNode
}

export const SheetContent = forwardRef<ElementRef<typeof D.Content>, SheetContentProps>(
  ({ children, className, ...props }, ref) => (
    <D.Portal>
      <D.Overlay
        className="fixed inset-0 z-40"
        style={{ background: "var(--sc)", animation: "l4m-fade-in .18s ease" }}
      />
      <D.Content
        ref={ref}
        className={cn(
          "fixed left-0 right-0 bottom-0 z-50 rounded-t-[28px] bg-surface text-ink",
          "px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+2rem)]",
          "shadow-[0_-6px_24px_rgba(0,0,0,.24)] outline-none",
          className,
        )}
        style={{ animation: "l4m-sheet-in .26s cubic-bezier(.2,0,0,1)" }}
        {...props}
      >
        <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-line" aria-hidden />
        {children}
      </D.Content>
    </D.Portal>
  ),
)
SheetContent.displayName = "SheetContent"

type SheetTitleProps = ComponentPropsWithoutRef<typeof D.Title>

export const SheetTitle = forwardRef<ElementRef<typeof D.Title>, SheetTitleProps>(
  ({ className, ...props }, ref) => (
    <D.Title
      ref={ref}
      className={cn("text-[22px] font-medium tracking-tight", className)}
      {...props}
    />
  ),
)
SheetTitle.displayName = "SheetTitle"
