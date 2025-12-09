import { useState } from "react"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { PageLayout } from "../../components/page-layout.jsx"
import { CheckoutForm } from "../../components/checkout-form.jsx"
import { CartSummary } from "../../components/cart-summary.jsx"
import { Card, CardContent } from "../../components/ui/card.jsx"
import { Button } from "../../components/ui/button.jsx"
import { useCart } from "../../hooks/use-cart.jsx"
import { orderService } from "../../src/services/orderService.js"
import { useAuth } from "../../src/contexts/AuthContext.jsx"

export default function CheckoutPage() {
  const { items, clearCart } = useCart()
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderData, setOrderData] = useState(null)

  const handleSubmit = async (formData) => {
    if (!token) {
      alert('Debes iniciar sesión para realizar una compra')
      return
    }

    setIsLoading(true)

    try {
      // Preparar datos para la orden
      const orderData = {
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          street: formData.address,
          city: formData.city,
          state: formData.department,
          zipCode: formData.postalCode,
          country: "Colombia",
          phone: formData.phone,
        },
        billingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          street: formData.address,
          city: formData.city,
          state: formData.department,
          zipCode: formData.postalCode,
          country: "Colombia",
          phone: formData.phone,
        },
        paymentMethod: formData.paymentMethod,
        customerNotes: formData.notes,
      }

      // Crear orden en el backend
      const response = await orderService.createOrder(orderData, token)
      
      if (response.success) {
        setOrderData(response.data)
        clearCart()
        setOrderComplete(true)
      } else {
        alert('Error al crear la orden: ' + response.message)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Error al procesar la orden. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="text-8xl mb-6">🛒</div>
            <h1 className="text-2xl font-bold mb-4">No hay productos para checkout</h1>
            <p className="text-muted-foreground mb-8">
              Tu carrito está vacío. Agrega algunos productos antes de proceder al checkout.
            </p>
            <a href="/productos">
              <Button size="lg" className="btn-primary">
                Ir de Compras
              </Button>
            </a>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (orderComplete && orderData) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
              <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4">¡Pedido Confirmado!</h1>
              <p className="text-lg text-muted-foreground mb-6">
                Tu pedido #{orderData.orderNumber} ha sido recibido y está siendo procesado.
              </p>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">¿Qué sigue?</h2>
                <div className="space-y-3 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Confirmación</p>
                      <p className="text-sm text-muted-foreground">
                        Te enviaremos un WhatsApp para confirmar tu pedido
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Preparación</p>
                      <p className="text-sm text-muted-foreground">Preparamos tu pedido con mucho cuidado</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Entrega</p>
                      <p className="text-sm text-muted-foreground">Recibe tu pedido en la dirección indicada</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/productos">
                <Button variant="outline" size="lg">
                  Seguir Comprando
                </Button>
              </a>
              <a href="https://wa.me/message/O4FKBMAABGC5L1" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="btn-primary">
                  Contactar por WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <a href="/carrito" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al carrito
          </a>
          <h1 className="text-3xl lg:text-4xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Completa tu información para finalizar la compra</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CartSummary onCheckout={() => {}} />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}