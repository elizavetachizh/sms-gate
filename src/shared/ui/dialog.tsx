import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import { XIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

interface DialogContextValue {
  onOpenChange: (open: boolean) => void
  titleId: string
  descriptionId: string
  setHasDescription: (value: boolean) => void
}

const DialogContext = createContext<DialogContextValue | null>(null)

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const [hasDescription, setHasDescription] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <DialogContext.Provider
      value={{ onOpenChange, titleId, descriptionId, setHasDescription }}
    >
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        aria-describedby={hasDescription ? descriptionId : undefined}
        className="fixed top-1/2 left-1/2 z-50 m-0 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-0 shadow-lg backdrop:bg-black/50"
        onClose={() => onOpenChange(false)}
        onClick={(event) => {
          if (event.target === ref.current) {
            onOpenChange(false)
          }
        }}
      >
        {children}
      </dialog>
    </DialogContext.Provider>
  )
}

export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<'div'>) {
  const context = useContext(DialogContext)

  return (
    <div className={cn('relative p-6', className)} {...props}>
      {children}
      {context && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={() => context.onOpenChange(false)}
          aria-label="Закрыть"
        >
          <XIcon />
        </Button>
      )}
    </div>
  )
}

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5 pr-8', className)} {...props} />
}

export function DialogTitle({ className, id, ...props }: ComponentProps<'h2'>) {
  const context = useContext(DialogContext)

  return (
    <h2
      id={id ?? context?.titleId}
      className={cn('text-lg font-semibold leading-none', className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  id,
  ...props
}: ComponentProps<'div'>) {
  const context = useContext(DialogContext)

  useEffect(() => {
    context?.setHasDescription(true)
    return () => context?.setHasDescription(false)
  }, [context])

  return (
    <div
      id={id ?? context?.descriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}
