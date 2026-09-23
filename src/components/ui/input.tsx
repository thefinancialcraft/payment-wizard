import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onWheel, onKeyDown, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          className
        )}
        style={{
          background: 'rgba(20, 20, 20, 0.3)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
        ref={ref}
        onWheel={(event) => {
          if (type === 'number') {
            event.currentTarget.blur();
            event.preventDefault();
          }
          onWheel?.(event);
        }}
        onKeyDown={(event) => {
          if (type === 'number' && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            event.preventDefault();
          }
          onKeyDown?.(event);
        }}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
