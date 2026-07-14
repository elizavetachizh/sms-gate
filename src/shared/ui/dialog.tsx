import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from 'react'
import { XIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

interface DialogContextValue {
  onOpenChange: (open: boolean) => void
  titleId: string
  descriptionId: string
  setHasDescription: (value: boolean) => void
  portalContainerRef: RefObject<HTMLDialogElement | null>
}

const DialogContext = createContext<DialogContextValue | null>(null)

export function useDialogPortalContainer() {
  return useContext(DialogContext)?.portalContainerRef ?? null
}

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
      value={{
        onOpenChange,
        titleId,
        descriptionId,
        setHasDescription,
        portalContainerRef: ref,
      }}
    >
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        aria-describedby={hasDescription ? descriptionId : undefined}
        className="fixed inset-0 m-0 hidden w-full max-w-none border-0 bg-transparent p-4 shadow-none backdrop:bg-black/50 open:flex open:items-center open:justify-center"
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
  onClick,
  ...props
}: ComponentProps<'div'>) {
  const context = useContext(DialogContext)

  return (
    <div
      className={cn(
        'relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg',
        className,
      )}
      onClick={(event) => {
        event.stopPropagation()
        onClick?.(event)
      }}
      {...props}
    >
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
