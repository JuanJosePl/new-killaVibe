
import { CartProvider } from "../../../modules/cart/context/CartContext.jsx"
import { AuthProvider } from "../../../core/providers/AuthProvider.jsx"

export function PageLayout({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
          
          <main className="flex-1 bg-background">{children}</main>
          
        </div>
      </CartProvider>
    </AuthProvider>
  )
}