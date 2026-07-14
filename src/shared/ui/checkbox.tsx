import * as React from 'react'
import { cn } from '@/shared/lib/utils'

const Checkbox = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  function Checkbox({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'size-4 shrink-0 rounded border border-input accent-primary',
          className,
        )}
        {...props}
      />
    )
  },
)

export { Checkbox }
