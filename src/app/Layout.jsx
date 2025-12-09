// layout.jsx

import "../src/index"
import { ThemeProvider } from "../components/theme-provider.jsx"
import { SocialLinks } from "../components/social-links.jsx"
import { CartProvider } from "../hooks/use-cart.jsx"

export const metadata = {
  title: "KillaVibes - Tecnología que vibra contigo",
  description: "Tienda de tecnología en Barranquilla. Audífonos, parlantes, compresores y más. Envíos a toda Colombia.",
  keywords: "tecnología, audífonos, parlantes, Barranquilla, Colombia, KillaVibes",
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased font-sans">
        <CartProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
            <SocialLinks />
          </ThemeProvider>
        </CartProvider>
      </body>
    </html>
  )
}
