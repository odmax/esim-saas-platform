import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 rounded-xl font-medium 
      transition-all duration-200 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 
      disabled:pointer-events-none disabled:opacity-50
      active:scale-[0.98]
    `
    
    const variants = {
      default: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-600",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-sm hover:shadow-md",
      destructive: "bg-red-500 text-white shadow-lg shadow-red-500/25 hover:bg-red-600 hover:shadow-red-500/30",
      outline: "border-2 border-slate-200 bg-white/50 hover:bg-slate-50 hover:border-slate-300",
      ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
    }

    const sizes = {
      default: "h-11 px-5 py-2.5 text-sm",
      sm: "h-9 px-4 py-2 text-xs rounded-lg",
      lg: "h-12 px-8 py-3 text-base rounded-xl",
      icon: "h-11 w-11 rounded-xl"
    }

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
