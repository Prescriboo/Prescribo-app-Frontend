import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold border',
        {
          'bg-primary-50 text-primary border-blue-100': variant === 'default',
          'bg-success-50 text-success border-green-200': variant === 'success',
          'bg-warning-50 text-warning border-amber-200': variant === 'warning',
          'bg-danger-50 text-danger border-red-200': variant === 'danger',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
