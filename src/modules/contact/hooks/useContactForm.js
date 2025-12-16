// src/hooks/useContactForm.js

import { useState } from 'react';
import { toast } from 'react-toastify';
import { sendContactMessage } from '../api/contact';
import { contactSchema, contactInitialValues } from '../schemas/contactSchema';

/**
 * @hook useContactForm
 * @description Hook personalizado para manejar formulario de contacto
 * 
 * RESPONSABILIDADES:
 * - Gestionar estado del formulario
 * - Validar datos con Yup schema
 * - Enviar mensaje al backend
 * - Manejar loading y errores
 * - Mostrar notificaciones (toast)
 * - Reset del formulario después de envío exitoso
 * 
 * SINCRONIZACIÓN CON BACKEND:
 * - API: POST /api/contact
 * - Validaciones idénticas a contact.validation.js
 * - Rate limiting: 3 mensajes/hora por email
 * 
 * @returns {Object} Estado y funciones del formulario
 */
export const useContactForm = () => {
  /**
   * Estado del formulario
   */
  const [formData, setFormData] = useState(contactInitialValues);
  
  /**
   * Estado de envío
   */
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  /**
   * Estado de éxito
   */
  const [submitted, setSubmitted] = useState(false);
  
  /**
   * Errores de validación
   */
  const [errors, setErrors] = useState({});
  
  /**
   * Error general
   */
  const [error, setError] = useState(null);

  /**
   * @function handleInputChange
   * @description Actualiza un campo del formulario
   * @param {string} field - Nombre del campo
   * @param {any} value - Valor del campo
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario escribe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
    
    // Limpiar error general
    if (error) {
      setError(null);
    }
  };

  /**
   * @function validateForm
   * @description Valida el formulario completo
   * @returns {Promise<boolean>} true si es válido, false si no
   */
  const validateForm = async () => {
    try {
      await contactSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationError) {
      const newErrors = {};
      validationError.inner.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
      
      // Mostrar toast con el primer error
      const firstError = validationError.inner[0]?.message;
      if (firstError) {
        toast.error(firstError);
      }
      
      return false;
    }
  };

  /**
   * @function handleSubmit
   * @description Envía el formulario de contacto
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setError(null);
    setErrors({});
    
    // Validar formulario
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Enviar mensaje al backend
      const response = await sendContactMessage(formData);
      
      if (response.success) {
        // Éxito
        setSubmitted(true);
        toast.success(response.message || '¡Mensaje enviado exitosamente!');
        
        // Reset del formulario después de 5 segundos
        setTimeout(() => {
          setFormData(contactInitialValues);
          setSubmitted(false);
        }, 5000);
      }
    } catch (err) {
      console.error('Error al enviar mensaje de contacto:', err);
      
      // Manejar errores específicos del backend
      const errorMessage = err.message || 'Error al enviar el mensaje. Por favor intenta de nuevo.';
      
      // Errores de validación del backend
      if (err.errors && Array.isArray(err.errors)) {
        const backendErrors = {};
        err.errors.forEach(error => {
          // Mapear errores del backend a campos del formulario
          if (error.includes('nombre')) backendErrors.name = error;
          else if (error.includes('email')) backendErrors.email = error;
          else if (error.includes('teléfono')) backendErrors.phone = error;
          else if (error.includes('asunto')) backendErrors.subject = error;
          else if (error.includes('mensaje')) backendErrors.message = error;
        });
        
        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);
        }
      }
      
      // Manejar rate limiting (anti-spam)
      if (errorMessage.includes('demasiados mensajes')) {
        setError('Has enviado muchos mensajes recientemente. Por favor espera un momento antes de intentar de nuevo.');
        toast.error('Demasiados mensajes enviados. Intenta en 1 hora.');
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * @function resetForm
   * @description Resetea el formulario a sus valores iniciales
   */
  const resetForm = () => {
    setFormData(contactInitialValues);
    setErrors({});
    setError(null);
    setSubmitted(false);
  };

  return {
    // Estado del formulario
    formData,
    isSubmitting,
    submitted,
    errors,
    error,
    
    // Funciones
    handleInputChange,
    handleSubmit,
    resetForm
  };
};

export default useContactForm;