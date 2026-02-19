import { RefreshCw, Calendar, Package, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/20 p-4 rounded-2xl">
                <RefreshCw className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Política de Devoluciones</h1>
            <p className="text-lg text-muted-foreground">
              Tu satisfacción es lo más importante. Conoce nuestro proceso de devoluciones y cambios.
            </p>
          </div>
        </div>
      </section>

      {/* Returns Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-6">Devoluciones y Cambios</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-2 rounded-full mt-1">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">30 días para devoluciones</h3>
                    <p className="text-muted-foreground">
                      Tienes 30 días a partir de la recepción para solicitar devoluciones o cambios.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-2 rounded-full mt-1">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Producto en perfecto estado</h3>
                    <p className="text-muted-foreground">
                      El producto debe estar en su empaque original y sin señales de uso.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-2 rounded-full mt-1">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Proceso sencillo</h3>
                    <p className="text-muted-foreground">
                      Solicita tu devolución y nosotros nos encargamos de todo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6">Condiciones</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-100 p-2 rounded-full mt-1">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Producto completo</h3>
                    <p className="text-muted-foreground">
                      Debe incluir todos los accesorios, manuales y empaques originales.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-yellow-100 p-2 rounded-full mt-1">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Sin uso evidente</h3>
                    <p className="text-muted-foreground">
                      El producto no debe mostrar señales de uso, rayones o daños.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-yellow-100 p-2 rounded-full mt-1">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Factura requerida</h3>
                    <p className="text-muted-foreground">
                      Es necesario presentar la factura de compra original.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Proceso de Devolución</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-primary/20 p-4 rounded-2xl inline-block mb-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                    1
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Contacto</h3>
                <p className="text-muted-foreground text-sm">
                  Escríbenos dentro de los 30 días posteriores a la compra.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/20 p-4 rounded-2xl inline-block mb-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                    2
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Validación</h3>
                <p className="text-muted-foreground text-sm">
                  Verificamos que cumples con las condiciones de devolución.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/20 p-4 rounded-2xl inline-block mb-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                    3
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Recogida</h3>
                <p className="text-muted-foreground text-sm">
                  Recolectamos el producto en tu domicilio sin costo adicional.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/20 p-4 rounded-2xl inline-block mb-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                    4
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Reembolso</h3>
                <p className="text-muted-foreground text-sm">
                  Procesamos tu reembolso en un máximo de 5 días hábiles.
                </p>
              </div>
            </div>
          </div>

          {/* Refund Information */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Información de Reembolsos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-muted p-6 rounded-2xl">
                <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Tiempo de procesamiento</h3>
                <p className="text-muted-foreground">
                  3-5 días hábiles una vez recibido y verificado el producto.
                </p>
              </div>

              <div className="bg-muted p-6 rounded-2xl">
                <RefreshCw className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Método de reembolso</h3>
                <p className="text-muted-foreground">
                  El reembolso se realiza por el mismo método de pago utilizado originalmente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}