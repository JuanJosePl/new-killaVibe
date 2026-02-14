

import * as React from "react"
import { cn } from "../../lib/utils"
import { X } from "lucide-react"

const Dialog = ({ children, open, onOpenChange }) => {
  return (
    <>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
          <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]">
            {React.Children.map(children, (child) =>
              React.isValidElement(child) && child.type === DialogContent ? child : null,
            )}
          </div>
        </div>
      )}
    </>
  )
}

const DialogTrigger = ({ children, onClick }) => {
  return React.cloneElement(children, { onClick })
}

const DialogContent = React.forwardRef(({ className, children, onClose, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid w-full max-w-lg gap-4 border border-purple-200 bg-background p-6 shadow-lg duration-200 sm:rounded-lg dark:border-purple-800",
      className,
    )}
    onClick={(e) => e.stopPropagation()}
    {...props}
  >
    {children}
    <button
      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      onClick={onClose}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Cerrar</span>
    </button>
  </div>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
DialogDescription.displayName = "DialogDescription"

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription }
