import { Truck, Clock, MapPin, Shield, Package, CheckCircle } from "lucide-react"

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/20 p-4 rounded-2xl">
                <Truck className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Información de Envíos</h1>
            <p className="text-lg text-muted-foreground">
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Free Shipping Banner */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">¡Envío Gratis!</h2>
            <p className="text-lg mb-4">
              En todos los pedidos superiores a $150.000 en Barranquilla y Soledad
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Sin costo adicional</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Entrega rápida</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Seguimiento en tiempo real</span>
              </div>
            </div>
          </div>

          {/* Shipping Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <div className="bg-primary/20 p-4 rounded-2xl inline-block mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Entrega Express</h3>
              <p className="text-muted-foreground mb-4">3-5 horas</p>
              <div className="text-lg font-bold text-primary">$15.000</div>
              <p className="text-sm text-muted-foreground mt-2">Barranquilla y Soledad</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <div className="bg-primary/20 p-4 rounded-2xl inline-block mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Entrega Estándar</h3>
              <p className="text-muted-foreground mb-4">24-48 horas</p>
              <div className="text-lg font-bold text-primary">$8.000</div>
              <p className="text-sm text-muted-foreground mt-2">Barranquilla y Soledad</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <div className="bg-primary/20 p-4 rounded-2xl inline-block mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Nacional</h3>
              <p className="text-muted-foreground mb-4">3-7 días hábiles</p>
              <div className="text-lg font-bold text-primary">Desde $12.000</div>
              <p className="text-sm text-muted-foreground mt-2">Todo Colombia</p>
            </div>
          </div>

          {/* Coverage Areas */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Zonas de Cobertura</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-lg">Barranquilla y Área Metropolitana</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Barranquilla</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Soledad</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Malambo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Puerto Colombia</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-lg">Nacional</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Bogotá</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Medellín</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Cali</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Cartagena</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Y todas las principales ciudades</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tracking and Support */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-muted p-6 rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary/20 p-3 rounded-xl">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Seguimiento de Pedidos</h3>
              </div>
              <p className="text-muted-foreground">
                Una vez confirmado tu pedido, recibirás un código de seguimiento por WhatsApp 
                y correo electrónico para monitorear tu envío en tiempo real.
              </p>
            </div>

            <div className="bg-muted p-6 rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary/20 p-3 rounded-xl">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Seguridad y Confianza</h3>
              </div>
              <p className="text-muted-foreground">
                Todos nuestros envíos están asegurados. Tu compra está protegida desde que 
                sale de nuestro almacén hasta que llega a tus manos.
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold mb-6">¿Preguntas sobre tu envío?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Nuestro equipo de logística está disponible para ayudarte
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a
                href="https://wa.me/573002521314"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Contactar por WhatsApp
              </a>
              <a
                href="tel:+573002521314"
                className="btn-outline"
              >
                Llamar ahora
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}