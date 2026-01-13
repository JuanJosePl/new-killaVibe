// src/modules/customer/pages/CustomerContactPage.jsx

import React from 'react';
import useContactForm from '../hooks/useContactForm';
import {
  ContactForm,
  ContactInfoCard,
  FAQCard,
  SocialLinks,
} from '../components/contact';

/**
 * ============================================
 * 📧 CUSTOMER CONTACT PAGE - PÁGINA COMPLETA
 * ============================================
 * 
 * Página de contacto con formulario funcional
 * 
 * Features:
 * - ✅ Formulario con validación en tiempo real
 * - ✅ Anti-spam (3 mensajes por hora)
 * - ✅ Tracking de mensajes restantes
 * - ✅ FAQs con acordeón animado
 * - ✅ Información de contacto con iconos 3D
 * - ✅ Enlaces sociales interactivos
 * - ✅ Diseño moderno 2025 (Glassmorphism + Gradientes)
 * - ✅ Responsive design
 * - ✅ Animaciones fluidas
 * - ✅ 100% acoplado con backend
 * 
 * Backend endpoints usados:
 * - POST /api/contact (contact.controller.js - sendContactMessage)
 */
const CustomerContactPage = () => {
  const {
    formData,
    errors,
    isSubmitting,
    showSuccess,
    remainingMessages,
    handleChange,
    handleSubmit,
  } = useContactForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ============================================
            HEADER - HERO SECTION
            ============================================ */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="mb-6 relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse-glow" />
            <h1 className="relative text-5xl sm:text-6xl md:text-7xl font-black mb-4 animate-slide-in-up">
              <span className="gradient-text-animated">
                📧 Contáctanos
              </span>
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            ¿Tienes alguna pregunta? Estamos aquí para ayudarte.
            <br />
            <span className="font-semibold text-foreground">
              Responderemos lo más pronto posible.
            </span>
          </p>
        </div>

        {/* ============================================
            MAIN CONTENT - GRID LAYOUT
            ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* FORMULARIO - 2/3 */}
          <div className="lg:col-span-2">
            <ContactForm
              formData={formData}
              errors={errors}
              onChange={handleChange}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              showSuccess={showSuccess}
              remainingMessages={remainingMessages}
            />
          </div>

          {/* INFORMACIÓN DE CONTACTO - 1/3 */}
          <div className="space-y-6">
            <div className="animate-scale-in delay-100">
              <ContactInfoCard
                icon="🏢"
                title="Ubicación"
                content="Barranquilla, Atlántico, Colombia"
                gradient="from-blue-500 to-cyan-500"
              />
            </div>
            <div className="animate-scale-in delay-200">
              <ContactInfoCard
                icon="📞"
                title="Teléfono"
                content="+57 300 123 4567"
                gradient="from-green-500 to-emerald-500"
              />
            </div>
            <div className="animate-scale-in delay-300">
              <ContactInfoCard
                icon="✉️"
                title="Email"
                content="soporte@vibeskilla.com"
                gradient="from-purple-500 to-pink-500"
              />
            </div>
            <div className="animate-scale-in delay-400">
              <ContactInfoCard
                icon="🕐"
                title="Horario de Atención"
                content="Lun - Vie: 9AM - 6PM"
                gradient="from-amber-500 to-orange-500"
              />
            </div>
          </div>
        </div>

        {/* ============================================
            FAQs SECTION
            ============================================ */}
        <div className="mb-12">
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
              <span className="gradient-text">💡 Preguntas Frecuentes</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Encuentra respuestas rápidas a las dudas más comunes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="animate-scale-in delay-100">
              <FAQCard
                question="¿Cuánto tarda el envío?"
                answer="Los envíos dentro de la ciudad tardan 1-2 días hábiles. Envíos nacionales tardan 3-5 días hábiles. Para envíos internacionales, el tiempo puede variar entre 7-15 días hábiles dependiendo del destino."
              />
            </div>
            <div className="animate-scale-in delay-200">
              <FAQCard
                question="¿Puedo devolver un producto?"
                answer="Sí, aceptamos devoluciones dentro de los 30 días posteriores a la entrega. El producto debe estar sin usar y en su empaque original. El proceso es 100% gratuito y te devolvemos el dinero completo."
              />
            </div>
            <div className="animate-scale-in delay-300">
              <FAQCard
                question="¿Qué métodos de pago aceptan?"
                answer="Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express), PayPal, transferencias bancarias, PSE y pago contra entrega. Todos los pagos son 100% seguros."
              />
            </div>
            <div className="animate-scale-in delay-400">
              <FAQCard
                question="¿Cómo puedo rastrear mi pedido?"
                answer="Una vez enviado tu pedido, recibirás un email con el número de seguimiento. También puedes ver el estado en tiempo real en la sección 'Mis Órdenes' dentro de tu perfil."
              />
            </div>
            <div className="animate-scale-in delay-500">
              <FAQCard
                question="¿Tienen tienda física?"
                answer="Actualmente solo operamos online, pero estamos trabajando para abrir nuestra primera tienda física en Barranquilla en 2025. ¡Síguenos en redes sociales para estar al tanto!"
              />
            </div>
            <div className="animate-scale-in delay-600">
              <FAQCard
                question="¿Hacen envíos internacionales?"
                answer="Por ahora solo realizamos envíos dentro de Colombia. Estamos trabajando para expandirnos internacionalmente a partir del segundo semestre de 2025."
              />
            </div>
          </div>
        </div>

        {/* ============================================
            SOCIAL LINKS SECTION
            ============================================ */}
        <div className="animate-scale-in mb-12">
          <SocialLinks />
        </div>

        {/* ============================================
            CTA SECTION - EXTRA SUPPORT
            ============================================ */}
        <div className="card card-gradient text-white p-8 text-center animate-fade-in-up">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">
            ¿Necesitas ayuda urgente? 📞
          </h3>
          <p className="text-lg sm:text-xl mb-6 opacity-90">
            Nuestro equipo de soporte está disponible para ayudarte en tiempo real
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="btn bg-white/20 backdrop-blur-xl border-2 border-white/50 text-white hover:bg-white/30 hover-lift text-base sm:text-lg">
              <span>💬</span>
              <span>Chat en Vivo</span>
            </button>
            <button className="btn bg-white/20 backdrop-blur-xl border-2 border-white/50 text-white hover:bg-white/30 hover-lift text-base sm:text-lg">
              <span>📞</span>
              <span>Llamar Ahora</span>
            </button>
            <button className="btn bg-white/20 backdrop-blur-xl border-2 border-white/50 text-white hover:bg-white/30 hover-lift text-base sm:text-lg">
              <span>📧</span>
              <span>Email Directo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerContactPage;