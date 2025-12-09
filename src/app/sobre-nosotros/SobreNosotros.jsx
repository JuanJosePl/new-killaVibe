import { Zap, Users, Award, Heart, Truck, Shield } from "lucide-react"
import { PageLayout } from "../../components/page-layout"
import { Card, CardContent } from "../../components/ui/card"

export default function AboutPage() {
  const values = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Innovación",
      description: "Siempre buscamos las últimas tecnologías para ofrecerte lo mejor",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Comunidad",
      description: "Construimos una comunidad que vibra con la tecnología",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Calidad",
      description: "Solo productos originales y de la más alta calidad",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Pasión",
      description: "Amamos lo que hacemos y se nota en cada detalle",
    },
  ]

  const features = [
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Envío Gratis",
      description: "En Barranquilla y Soledad",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Garantía Total",
      description: "Productos 100% originales",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Atención 24/7",
      description: "Siempre disponibles para ti",
    },
  ]

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 text-primary mb-4">
            <Zap className="h-8 w-8" />
            <span className="text-2xl font-bold">KillaVibes</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold mb-6 text-balance">Tecnología que vibra contigo</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
            Somos una empresa barranquillera apasionada por la tecnología. Desde 2024, conectamos a nuestra comunidad
            con los mejores productos tecnológicos, siempre con la vibra Killa que nos caracteriza.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Nuestra Historia</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                KillaVibes nació en el corazón de Barranquilla con una misión clara: democratizar el acceso a la
                tecnología de calidad en la Costa Caribe colombiana.
              </p>
              <p>
                Comenzamos como un pequeño emprendimiento local, pero nuestra pasión por la tecnología y el compromiso
                con nuestros clientes nos ha permitido crecer y convertirnos en una referencia en la región.
              </p>
              <p>
                Hoy, no solo vendemos productos, sino que construimos una comunidad de entusiastas de la tecnología que
                comparten nuestra vibra única.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="text-8xl">🚀</div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nuestros Valores</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Los principios que guían cada decisión y nos mantienen conectados con nuestra comunidad
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card
                key={index}
                className="text-center animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                    {value.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 lg:p-12 mb-16">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Nuestra Misión</h2>
            <p className="text-lg text-muted-foreground mb-8">
              "Conectar a nuestra comunidad costeña con la mejor tecnología del mundo, ofreciendo productos de calidad,
              servicio excepcional y esa vibra única que nos hace ser KillaVibes. Queremos que cada cliente sienta que
              la tecnología no es solo un producto, sino una extensión de su personalidad."
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">El Equipo KillaVibes</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Un equipo joven, apasionado y comprometido con llevarte la mejor experiencia tecnológica
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((member, index) => (
              <Card key={member} className="animate-slide-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-6 text-center">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4 text-4xl">
                    👨‍💻
                  </div>
                  <h3 className="font-semibold mb-2">Equipo KillaVibes</h3>
                  <p className="text-sm text-muted-foreground">Especialistas en tecnología y atención al cliente</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">¿Listo para unirte a la vibra?</h2>
          <p className="text-lg opacity-90 mb-6">Descubre por qué miles de costeños ya confían en KillaVibes</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/productos"
              className="inline-flex items-center px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Ver Productos
            </a>
            <a
              href="https://wa.me/message/O4FKBMAABGC5L1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
            >
              Contáctanos
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
