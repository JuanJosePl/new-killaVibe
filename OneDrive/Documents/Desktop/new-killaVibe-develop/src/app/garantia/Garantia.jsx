import { Shield, Clock, Phone, Mail, CheckCircle, XCircle } from "lucide-react"

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/20 p-4 rounded-2xl">
                <Shield className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Garantía KillaVibes</h1>
            <p className="text-lg text-muted-foreground">
              Tu tranquilidad es nuestra prioridad. Conoce todo sobre nuestra política de garantía.
            </p>
          </div>
        </div>
      </section>

      {/* Warranty Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-6">¿Qué cubre nuestra garantía?</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-full mt-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Defectos de fabricación</h3>
                    <p className="text-muted-foreground">
                      Cubrimos cualquier defecto de fabricación durante el período de garantía.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-full mt-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Problemas de funcionamiento</h3>
                    <p className="text-muted-foreground">
                      Si tu producto deja de funcionar correctamente, estamos aquí para ayudarte.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-full mt-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Soporte técnico</h3>
                    <p className="text-muted-foreground">
                      Asesoramiento técnico gratuito durante todo el período de garantía.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6">¿Qué no cubre la garantía?</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-2 rounded-full mt-1">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Daños por mal uso</h3>
                    <p className="text-muted-foreground">
                      Daños causados por uso inadecuado o accidentes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-2 rounded-full mt-1">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Modificaciones no autorizadas</h3>
                    <p className="text-muted-foreground">
                      Productos que han sido modificados o reparados por terceros.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-2 rounded-full mt-1">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Desgaste normal</h3>
                    <p className="text-muted-foreground">
                      Desgaste natural del producto por uso regular.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warranty Period */}
          <div className="mt-16 bg-card border border-border rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Períodos de Garantía</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/20 p-4 rounded-2xl inline-block mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Productos Electrónicos</h3>
                <p className="text-muted-foreground">12 meses de garantía</p>
              </div>

              <div className="text-center">
                <div className="bg-primary/20 p-4 rounded-2xl inline-block mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Accesorios</h3>
                <p className="text-muted-foreground">6 meses de garantía</p>
              </div>

              <div className="text-center">
                <div className="bg-primary/20 p-4 rounded-2xl inline-block mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Equipos Premium</h3>
                <p className="text-muted-foreground">24 meses de garantía</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-6">¿Necesitas ayuda con tu garantía?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span>+57 300 252 1314</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <span>garantias@killavibes.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}