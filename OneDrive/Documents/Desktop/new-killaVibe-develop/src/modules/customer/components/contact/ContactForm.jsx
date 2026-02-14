// src/modules/customer/components/contact/ContactForm.jsx

import React from 'react';

/**
 * ============================================
 * 📋 CONTACTFORM - FORMULARIO PRINCIPAL
 * ============================================
 * 
 * Features:
 * - Validación en tiempo real
 * - Estados animados (success/error/warning)
 * - Anti-spam warning visual
 * - Contador de caracteres
 * - Disabled states
 * - Glassmorphism effect
 * 
 * Props:
 * - formData: { name, email, phone, subject, message }
 * - errors: { general?, name?, email?, phone?, subject?, message? }
 * - onChange: (field, value) => void
 * - onSubmit: (e) => void
 * - isSubmitting: boolean
 * - showSuccess: boolean
 * - remainingMessages: number (0-3)
 */
const ContactForm = ({
  formData,
  errors,
  onChange,
  onSubmit,
  isSubmitting,
  showSuccess,
  remainingMessages,
}) => {
  return (
    <div className="glass-effect rounded-3xl p-8 shadow-card animate-fade-in-up">
      {/* ✅ SUCCESS ALERT */}
      {showSuccess && (
        <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl animate-slide-in-up shadow-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-2xl animate-bounce-subtle">
              ✅
            </div>
            <div>
              <h4 className="font-bold text-green-900 text-lg">
                ¡Mensaje enviado exitosamente!
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Te responderemos lo más pronto posible. Revisa tu email.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ❌ ERROR ALERT */}
      {errors.general && (
        <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl animate-wiggle shadow-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-2xl">
              ❌
            </div>
            <div>
              <h4 className="font-bold text-red-900 text-lg">Error</h4>
              <p className="text-sm text-red-700 mt-1">{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ REMAINING MESSAGES WARNING */}
      {remainingMessages <= 1 && remainingMessages > 0 && (
        <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-2xl animate-pulse-slow">
              ⚠️
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-lg">
                Límite de mensajes
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                Te queda <strong className="text-lg">{remainingMessages}</strong>{' '}
                mensaje disponible por hora
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          FORMULARIO
          ============================================ */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* NOMBRE */}
        <div className="group">
          <label className="label flex items-center gap-2 mb-2">
            <span className="text-2xl">👤</span>
            <span className="font-semibold">Nombre Completo</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            className={`input-base ${
              errors.name ? 'input-error animate-wiggle' : ''
            } group-hover:border-primary/50 transition-all`}
            placeholder="Ej: Juan Pérez"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-2 animate-slide-up flex items-center gap-1">
              <span>⚠️</span> {errors.name}
            </p>
          )}
        </div>

        {/* EMAIL */}
        <div className="group">
          <label className="label flex items-center gap-2 mb-2">
            <span className="text-2xl">📧</span>
            <span className="font-semibold">Email</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={`input-base ${
              errors.email ? 'input-error animate-wiggle' : ''
            } group-hover:border-primary/50 transition-all`}
            placeholder="Ej: juan@example.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-2 animate-slide-up flex items-center gap-1">
              <span>⚠️</span> {errors.email}
            </p>
          )}
        </div>

        {/* TELÉFONO */}
        <div className="group">
          <label className="label flex items-center gap-2 mb-2">
            <span className="text-2xl">📞</span>
            <span className="font-semibold">Teléfono</span>
            <span className="text-muted-foreground text-sm ml-1">(opcional)</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className={`input-base ${
              errors.phone ? 'input-error animate-wiggle' : ''
            } group-hover:border-primary/50 transition-all`}
            placeholder="Ej: +57 300 123 4567"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="text-sm text-destructive mt-2 animate-slide-up flex items-center gap-1">
              <span>⚠️</span> {errors.phone}
            </p>
          )}
        </div>

        {/* ASUNTO */}
        <div className="group">
          <label className="label flex items-center gap-2 mb-2">
            <span className="text-2xl">💬</span>
            <span className="font-semibold">Asunto</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => onChange('subject', e.target.value)}
            className={`input-base ${
              errors.subject ? 'input-error animate-wiggle' : ''
            } group-hover:border-primary/50 transition-all`}
            placeholder="Ej: Consulta sobre producto"
            disabled={isSubmitting}
          />
          {errors.subject && (
            <p className="text-sm text-destructive mt-2 animate-slide-up flex items-center gap-1">
              <span>⚠️</span> {errors.subject}
            </p>
          )}
        </div>

        {/* MENSAJE */}
        <div className="group">
          <label className="label flex items-center gap-2 mb-2">
            <span className="text-2xl">✍️</span>
            <span className="font-semibold">Mensaje</span>
            <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => onChange('message', e.target.value)}
            className={`textarea ${
              errors.message ? 'input-error animate-wiggle' : ''
            } group-hover:border-primary/50 transition-all`}
            placeholder="Cuéntanos en qué podemos ayudarte..."
            rows={6}
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-2">
            {errors.message ? (
              <p className="text-sm text-destructive animate-slide-up flex items-center gap-1">
                <span>⚠️</span> {errors.message}
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {formData.message.length} / 2000 caracteres
                </span>
                {formData.message.length > 1800 && (
                  <span className="text-xs text-amber-600 font-semibold">
                    (Cerca del límite)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting || remainingMessages <= 0}
          className="btn btn-gradient w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed hover-lift shadow-lg"
        >
          {isSubmitting ? (
            <>
              <span className="animate-rotate inline-block">⏳</span>
              <span className="ml-2">Enviando...</span>
            </>
          ) : (
            <>
              <span>🚀</span>
              <span className="ml-2">Enviar Mensaje</span>
            </>
          )}
        </button>

        {/* HELP TEXT */}
        <p className="text-sm text-muted-foreground text-center">
          Al enviar este formulario, aceptas nuestra{' '}
          <a href="#" className="text-primary hover:underline font-semibold">
            Política de Privacidad
          </a>
        </p>
      </form>
    </div>
  );
};

export default ContactForm;