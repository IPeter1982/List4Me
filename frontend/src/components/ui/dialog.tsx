import * as D from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/cn"

export const Dialog = D.Root
export const DialogTrigger = D.Trigger

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 bg-black/50 z-40" />
      <D.Content className={cn(
        "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
        "w-[90vw] max-w-md rounded-2xl bg-white p-6 shadow-xl",
        "dark:bg-neutral-900",
        className
      )}>
        <D.Close className="absolute right-3 top-3 rounded-full p-1 hover:bg-neutral-100">
          <X className="size-5" />
        </D.Close>
        {children}
      </D.Content>
    </D.Portal>
  )
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <D.Title className="text-lg font-semibold mb-2">{children}</D.Title>
}
