// src/modules/customer/context/CustomerContactContext.jsx

import React, { createContext, useState, useContext, useCallback } from 'react';
import * as customerContactApi from '../api/customerContact.api';
import { customerErrorNormalizer } from '../utils/customerErrorNormalizer';

/**
 * ============================================
 * 📧 CUSTOMER CONTACT CONTEXT
 * ============================================
 * 
 * Responsabilidades:
 * - Estado global de mensajes de contacto
 * - Envío de mensajes con validación
 * - Tracking de mensajes restantes (anti-spam 3 por hora)
 * - Manejo de errores normalizado
 * 
 * Acoplado con:
 * - Backend: contact.service.js (anti-spam línea 30-40)
 * - API: customerContact.api.js
 * - Validación: Mismas reglas que contact.validation.js
 */

const CustomerContactContext = createContext();

export const CustomerContactProvider = ({ children }) => {
  // Estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(3);

  /**
   * Cargar mensajes restantes del localStorage
   * Se ejecuta al montar el componente
   */
  const loadRemainingMessages = useCallback(() => {
    try {
      const data = localStorage.getItem('contactMessages');
      if (data) {
        const { count, timestamp } = JSON.parse(data);
        const hourAgo = Date.now() - 60 * 60 * 1000;

        if (timestamp > hourAgo) {
          setRemainingMessages(Math.max(0, 3 - count));
        } else {
          // Expiró, resetear
          localStorage.removeItem('contactMessages');
          setRemainingMessages(3);
        }
      } else {
        setRemainingMessages(3);
      }
    } catch (error) {
      console.error('[ContactContext] Error loading messages count:', error);
      setRemainingMessages(3);
    }
  }, []);

  /**
   * Actualizar contador de mensajes en localStorage
   */
  const updateMessagesCount = useCallback(() => {
    try {
      const data = localStorage.getItem('contactMessages');
      let count = 1;

      if (data) {
        const parsed = JSON.parse(data);
        count = parsed.count + 1;
      }

      localStorage.setItem(
        'contactMessages',
        JSON.stringify({
          count,
          timestamp: Date.now(),
        })
      );

      setRemainingMessages(Math.max(0, 3 - count));
    } catch (error) {
      console.error('[ContactContext] Error updating messages count:', error);
    }
  }, []);

  /**
   * Enviar mensaje de contacto
   * 
   * @param {Object} contactData - Datos del formulario
   * @returns {Promise<Object>} { success, data/error }
   */
  const sendContactMessage = useCallback(async (contactData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validar antes de enviar (validación de cliente)
    const validation = customerContactApi.validateContactData(contactData);
    if (!validation.isValid) {
      setError('Por favor corrige los errores en el formulario');
      setLoading(false);
      return { success: false, errors: validation.errors };
    }

    // Verificar límite de mensajes (validación de cliente)
    if (remainingMessages <= 0) {
      const errorMsg = 'Has alcanzado el límite de mensajes por hora. Intenta más tarde.';
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }

    try {
      // Llamar al backend
      const result = await customerContactApi.sendContactMessage(contactData);

      // Success
      setSuccess(true);
      updateMessagesCount();

      // Auto-clear success después de 5 segundos
      setTimeout(() => {
        setSuccess(false);
        setError(null);
      }, 5000);

      return { success: true, data: result };
    } catch (err) {
      const normalized = customerErrorNormalizer(err);
      setError(normalized.message);
      return { success: false, error: normalized };
    } finally {
      setLoading(false);
    }
  }, [remainingMessages, updateMessagesCount]);

  /**
   * Limpiar estado
   */
  const clearState = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  const value = {
    // Estado
    loading,
    error,
    success,
    remainingMessages,

    // Acciones
    sendContactMessage,
    loadRemainingMessages,
    clearState,
  };

  return (
    <CustomerContactContext.Provider value={value}>
      {children}
    </CustomerContactContext.Provider>
  );
};

/**
 * Hook personalizado para usar el contexto
 */
export const useCustomerContact = () => {
  const context = useContext(CustomerContactContext);
  if (!context) {
    throw new Error(
      'useCustomerContact must be used within CustomerContactProvider'
    );
  }
  return context;
};

export default CustomerContactContext;