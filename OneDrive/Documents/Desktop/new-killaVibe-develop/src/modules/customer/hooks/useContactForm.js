// src/modules/customer/hooks/useContactForm.js

import { useState, useEffect, useCallback } from 'react';
import { useCustomerContact } from '../context/CustomerContactContext';
import { useCustomerActivity } from '../context/CustomerActivityContext';

/**
 * ============================================
 * 🪝 useContactForm - CUSTOM HOOK
 * ============================================
 * 
 * Abstrae toda la lógica del formulario de contacto
 * 
 * Features:
 * - Gestión de estado del formulario
 * - Validación en tiempo real
 * - Envío con manejo de errores
 * - Tracking de actividad
 * - Reset automático después de envío exitoso
 * 
 * @returns {Object} Estado y acciones del formulario
 */
const useContactForm = () => {
  const {
    loading,
    error: contextError,
    success: contextSuccess,
    remainingMessages,
    sendContactMessage,
    loadRemainingMessages,
    clearState,
  } = useCustomerContact();

  const { trackPageView } = useCustomerActivity();

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Cargar mensajes restantes y trackear página al montar
  useEffect(() => {
    loadRemainingMessages();
    trackPageView('Contact');
  }, [loadRemainingMessages, trackPageView]);

  // Sincronizar loading con context
  useEffect(() => {
    setIsSubmitting(loading);
  }, [loading]);

  // Sincronizar error con context
  useEffect(() => {
    if (contextError) {
      setErrors((prev) => ({ ...prev, general: contextError }));
    }
  }, [contextError]);

  // Sincronizar success con context
  useEffect(() => {
    if (contextSuccess) {
      setShowSuccess(true);
      resetForm();

      // Auto-hide success después de 5 segundos
      const timeout = setTimeout(() => {
        setShowSuccess(false);
        clearState();
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [contextSuccess, clearState]);

  /**
   * Manejar cambios en inputs
   */
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error del campo específico
    setErrors((prev) => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });

    // Limpiar error general
    setErrors((prev) => {
      if (prev.general) {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      }
      return prev;
    });
  }, []);

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Verificar límite de mensajes
    if (remainingMessages <= 0) {
      setErrors({
        general: 'Has alcanzado el límite de mensajes por hora. Intenta más tarde.',
      });
      return;
    }

    // Enviar mensaje
    const result = await sendContactMessage(formData);

    // Si hay errores de validación específicos
    if (result.errors) {
      setErrors(result.errors);
    }

    // Si fue exitoso, scroll to top
    if (result.success) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [formData, remainingMessages, sendContactMessage]);

  /**
   * Resetear formulario
   */
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
    setErrors({});
  }, []);

  return {
    // Estado
    formData,
    errors,
    isSubmitting,
    showSuccess,
    remainingMessages,

    // Acciones
    handleChange,
    handleSubmit,
    resetForm,
  };
};

export default useContactForm;