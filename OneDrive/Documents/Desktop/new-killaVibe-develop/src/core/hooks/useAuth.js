// src/core/hooks/useAuth.js

/**
 * @module useAuth
 * @description Re-export del hook useAuth desde AuthProvider
 * 
 * Esto permite importar useAuth desde core/hooks en lugar de providers
 * Mantiene la estructura limpia y organizada
 */

export { useAuth } from '../providers/AuthProvider';