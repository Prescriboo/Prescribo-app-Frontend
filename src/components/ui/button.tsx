import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md shadow-primary/25 hover:-translate-y-0.5 hover:shadow-lg': variant === 'default',
            'border border-border bg-white text-slate-900 hover:bg-slate-50 hover:border-primary-light hover:text-primary': variant === 'outline',
            'hover:bg-slate-50 text-slate-500 hover:text-slate-900': variant === 'ghost',
            'bg-danger text-white hover:bg-red-600': variant === 'danger',
            'h-9 px-4 text-sm': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
