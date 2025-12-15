import Header from "./header"
import Footer from "./footer"
import { CartProvider } from "../hooks/use-cart.jsx"
import { AuthProvider } from "../src/contexts/AuthContext.jsx"

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