// src/schemas/searchSchemas.js
import * as Yup from 'yup';

/**
 * @module SearchSchemas
 * @description Validaciones Yup sincronizadas con Joi del backend
 * 
 * Basado en: src/modules/search/search.validation.js
 */

/**
 * Validación para sugerencias de búsqueda
 * Sincronizado con: searchValidation.getSearchSuggestions
 */
export const searchSuggestionsSchema = Yup.object({
  q: Yup.string()
    .trim()
    .min(2, 'La búsqueda debe tener al menos 2 caracteres')
    .max(100, 'La búsqueda no puede exceder 100 caracteres')
    .required('El parámetro de búsqueda es requerido'),
  limit: Yup.number()
    .integer('Debe ser un número entero')
    .min(1, 'Mínimo 1 resultado')
    .max(20, 'Máximo 20 resultados')
    .default(5)
});

/**
 * Validación para búsquedas populares
 * Sincronizado con: searchValidation.getPopularSearches
 */
export const popularSearchesSchema = Yup.object({
  limit: Yup.number()
    .integer('Debe ser un número entero')
    .min(1, 'Mínimo 1 resultado')
    .max(50, 'Máximo 50 resultados')
    .default(10),
  days: Yup.number()
    .integer('Debe ser un número entero')
    .min(1, 'Mínimo 1 día')
    .max(365, 'Máximo 365 días')
    .default(30)
});

/**
 * Validación para búsquedas en tendencia
 * Sincronizado con: searchValidation.getTrendingSearches
 */
export const trendingSearchesSchema = Yup.object({
  limit: Yup.number()
    .integer('Debe ser un número entero')
    .min(1, 'Mínimo 1 resultado')
    .max(50, 'Máximo 50 resultados')
    .default(10)
});

/**
 * Validación para historial de búsqueda
 * Sincronizado con: searchValidation.getUserSearchHistory
 */
export const userSearchHistorySchema = Yup.object({
  limit: Yup.number()
    .integer('Debe ser un número entero')
    .min(1, 'Mínimo 1 resultado')
    .max(100, 'Máximo 100 resultados')
    .default(20)
});

/**
 * Validación para búsquedas fallidas (Admin)
 * Sincronizado con: searchValidation.getFailedSearches
 */
export const failedSearchesSchema = Yup.object({
  limit: Yup.number()
    .integer('Debe ser un número entero')
    .min(1, 'Mínimo 1 resultado')
    .max(100, 'Máximo 100 resultados')
    .default(20),
  days: Yup.number()
    .integer('Debe ser un número entero')
    .min(1, 'Mínimo 1 día')
    .max(365, 'Máximo 365 días')
    .default(30)
});

/**
 * Validación para estadísticas de búsqueda (Admin)
 * Sincronizado con: searchValidation.getSearchStats
 */
export const searchStatsSchema = Yup.object({
  days: Yup.number()
    .integer('Debe ser un número entero')
    .min(1, 'Mínimo 1 día')
    .max(365, 'Máximo 365 días')
    .default(30)
});