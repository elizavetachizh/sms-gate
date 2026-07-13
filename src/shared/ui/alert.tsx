import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'

const alertVariants = cva(
  [
    'relative w-full rounded-lg border px-4 py-3 text-sm',
    '[&>svg]:absolute [&>svg]:top-3.5 [&>svg]:left-4 [&>svg]:size-4',
    '[&:has(svg)]:pl-11 [&>svg+div]:translate-y-[-2px]',
  ].join(' '),
  {
    variants: {
      variant: {
        success: [
          'border-emerald-200 bg-emerald-50 text-emerald-950',
          '[&>svg]:text-emerald-600',
          '[&_[data-slot=alert-title]]:text-emerald-900',
          '[&_[data-slot=alert-description]]:text-emerald-800',
          'dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100',
          'dark:[&>svg]:text-emerald-400',
          'dark:[&_[data-slot=alert-title]]:text-emerald-100',
          'dark:[&_[data-slot=alert-description]]:text-emerald-200/90',
        ].join(' '),
        destructive: [
          'border-red-200 bg-red-50 text-red-950',
          '[&>svg]:text-red-600',
          '[&_[data-slot=alert-title]]:text-red-900',
          '[&_[data-slot=alert-description]]:text-red-800',
          'dark:border-red-900 dark:bg-red-950/50 dark:text-red-100',
          'dark:[&>svg]:text-red-400',
          'dark:[&_[data-slot=alert-title]]:text-red-100',
          'dark:[&_[data-slot=alert-description]]:text-red-200/90',
        ].join(' '),
        default: 'border-border bg-background text-foreground',
        warning: [
          'border-amber-200 bg-amber-50 text-amber-950',
          '[&>svg]:text-amber-600',
          '[&_[data-slot=alert-title]]:text-amber-900',
          '[&_[data-slot=alert-description]]:text-amber-800',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'h5'>) {
  return (
    <h5
      data-slot="alert-title"
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
