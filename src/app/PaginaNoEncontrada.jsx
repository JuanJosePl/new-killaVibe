// not-found.jsx

import { Home, Search, ArrowLeft } from "lucide-react"
import { PageLayout } from "../components/page-layout"
import { Button } from "../components/ui/button"

export default function NotFound() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-8xl mb-8">🔍</div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Lo sentimos, la página que buscas no existe o ha sido movida. Pero no te preocupes, ¡tenemos muchas otras
            cosas increíbles para mostrarte!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/">
              <Button size="lg" className="btn-primary">
                <Home className="h-5 w-5 mr-2" />
                Ir al Inicio
              </Button>
            </a>
            <a href="/productos">
              <Button size="lg" variant="outline">
                <Search className="h-5 w-5 mr-2" />
                Ver Productos
              </Button>
            </a>
            <Button size="lg" variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver Atrás
            </Button>
          </div>

          <div className="mt-12 p-6 bg-muted/50 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4">¿Necesitas ayuda?</h3>
            <p className="text-muted-foreground mb-4">
              Si estás buscando algo específico, contáctanos y te ayudamos a encontrarlo
            </p>
            <a
              href="https://wa.me/message/O4FKBMAABGC5L1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
