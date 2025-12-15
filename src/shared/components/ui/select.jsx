

import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown } from "lucide-react"

const Select = ({ children, value, onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="relative" {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            value,
            onValueChange,
            isOpen,
            setIsOpen,
          })
        }
        return child
      })}
    </div>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, isOpen, setIsOpen, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-purple-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-800",
      className,
    )}
    onClick={() => setIsOpen(!isOpen)}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, value }) => (
  <span className={value ? "" : "text-muted-foreground"}>{value || placeholder}</span>
)

const SelectContent = ({ className, children, isOpen, value, onValueChange, setIsOpen, ...props }) => {
  if (!isOpen) return null

  return (
    <div
      className={cn(
        "absolute top-full z-50 w-full rounded-md border border-purple-200 bg-popover p-1 text-popover-foreground shadow-md dark:border-purple-800",
        className,
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onValueChange,
            setIsOpen,
            currentValue: value,
          })
        }
        return child
      })}
    </div>
  )
}

const SelectItem = React.forwardRef(
  ({ className, children, value, onValueChange, setIsOpen, currentValue, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        currentValue === value && "bg-accent text-accent-foreground",
        className,
      )}
      onClick={() => {
        onValueChange(value)
        setIsOpen(false)
      }}
      {...props}
    >
      {children}
    </div>
  ),
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
