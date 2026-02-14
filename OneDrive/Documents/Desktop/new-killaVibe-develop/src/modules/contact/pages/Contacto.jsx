// src/app/contacto/Contacto.jsx

import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Instagram,
  Send,
  CheckCircle2,
} from "lucide-react";
import { PageLayout } from "../../../shared/components/feedback/components/page-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Button } from "../../../shared/components/ui/button";
import { useContactForm } from "../hooks/useContactForm";

/**
 * @component ContactPage
 * @description Página de contacto con formulario funcional
 * 
 * FUNCIONALIDADES:
 * - Formulario de contacto con validación
 * - Información de contacto (ubicación, teléfono, email, horario)
 * - Enlaces a redes sociales
 * - Feedback visual (loading, éxito, errores)
 * - Anti-spam integrado (3 mensajes/hora)
 * 
 * INTEGRACIÓN CON BACKEND:
 * - API: POST /api/contact
 * - Hook: useContactForm (custom)
 * - Validación: contactSchema (Yup)
 * 
 * ARQUITECTURA:
 * PageLayout → ContactPage
 *   ├─> Información de contacto (izquierda)
 *   │   ├─> Ubicación
 *   │   ├─> Teléfono
 *   │   ├─> Email
 *   │   ├─> Horario
 *   │   └─> Redes sociales
 *   └─> Formulario (derecha)
 *       ├─> Campos validados
 *       ├─> Loading state
 *       ├─> Success state
 *       └─> Error handling
 */
export default function ContactPage() {
  const {
    formData,
    isSubmitting,
    submitted,
    errors,
    error,
    handleInputChange,
    handleSubmit,
  } = useContactForm();

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Contáctanos</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Contáctanos por cualquier medio y te
            responderemos lo más pronto posible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Información de Contacto
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Ubicación</h3>
                    <p className="text-muted-foreground">
                      Barranquilla, Atlántico
                      <br />
                      Colombia 🇨🇴
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Teléfono</h3>
                    <a
                      href="tel:+573002521314"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      +57 300 252 1314
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a
                      href="mailto:info@killavibes.com"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      info@killavibes.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Horario de Atención</h3>
                    <p className="text-muted-foreground">
                      24/7 - Siempre disponibles
                      <br />
                      Respuesta garantizada 🧿
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Síguenos</h2>
              <div className="flex space-x-4 flex-wrap gap-2">
                <a
                  href="https://wa.me/message/O4FKBMAABGC5L1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="https://www.instagram.com/killavibes_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  <span>Instagram</span>
                </a>
                <a
                  href="https://www.threads.com/@killavibes_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  <span className="font-bold">@</span>
                  <span>Threads</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Envíanos un Mensaje</CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      ¡Mensaje Enviado Exitosamente!
                    </h3>
                    <p className="text-muted-foreground">
                      Gracias por contactarnos. Hemos recibido tu mensaje y te
                      responderemos dentro de las próximas 24 horas.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Error general */}
                    {error && (
                      <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                        {error}
                      </div>
                    )}

                    {/* Name y Phone (2 columnas) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          required
                          disabled={isSubmitting}
                          className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                          <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          disabled={isSubmitting}
                          className={errors.phone ? 'border-red-500' : ''}
                          placeholder="+57 300 123 4567"
                        />
                        {errors.phone && (
                          <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                        disabled={isSubmitting}
                        className={errors.email ? 'border-red-500' : ''}
                        placeholder="tu@email.com"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                      )}
                    </div>

                    {/* Subject */}
                    <div>
                      <Label htmlFor="subject">Asunto *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) =>
                          handleInputChange("subject", e.target.value)
                        }
                        required
                        disabled={isSubmitting}
                        className={errors.subject ? 'border-red-500' : ''}
                        placeholder="¿En qué podemos ayudarte?"
                      />
                      {errors.subject && (
                        <p className="text-xs text-red-600 mt-1">{errors.subject}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <Label htmlFor="message">Mensaje *</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        value={formData.message}
                        onChange={(e) =>
                          handleInputChange("message", e.target.value)
                        }
                        required
                        disabled={isSubmitting}
                        placeholder="Por favor, describe tu consulta o mensaje en detalle..."
                        className={errors.message ? 'border-red-500' : ''}
                      />
                      {errors.message && (
                        <p className="text-xs text-red-600 mt-1">{errors.message}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Mensaje
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Contact Banner */}
        <div className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            ¿Necesitas ayuda inmediata?
          </h2>
          <p className="text-lg opacity-90 mb-6">
            Contáctanos por WhatsApp para atención inmediata
          </p>
          <a
            href="https://wa.me/message/O4FKBMAABGC5L1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Chatear Ahora
          </a>
        </div>
      </div>
    </PageLayout>
  );
}