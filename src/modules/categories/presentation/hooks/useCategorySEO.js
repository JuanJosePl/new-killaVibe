/**
 * @hook useCategorySEO
 * @description Hook para gestionar el contexto SEO de una categoría.
 *
 * Casos de uso:
 * - Inyectar meta tags en <Helmet> desde un CategoryDetailDTO
 * - Obtener SEO de una categoría referenciada (ej. desde una página de producto)
 * - Resolver breadcrumbs para marcado estructurado (JSON-LD)
 *
 * El hook trabaja con el seoContext que ya viene en CategoryEntity
 * (campo `seoContext` del CategoryDetailDTO), o puede hacer un fetch
 * directo al endpoint /categories/:id/seo si es necesario.
 */

import { useState, useCallback, useMemo } from 'react';
import { CategorySEOContext } from '../../domain/category.model.js';
import categoriesRepository from '../../infrastructure/categories.repository.js';

const useCategorySEO = () => {
  const [seoContext, setSeoContext] = useState(null); // CategorySEOContext | null
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  /**
   * Carga el contexto SEO directamente desde el endpoint /categories/:id/seo.
   * Usar cuando no se tiene el campo seoContext de la entidad.
   */
  const fetchSEOContext = useCallback(async (categoryId) => {
    if (!categoryId) {
      setError('categoryId es requerido.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const ctx = await categoriesRepository.getSEOContext(categoryId);
      setSeoContext(ctx);
      return ctx;
    } catch (err) {
      setError(err.message ?? 'Error al obtener contexto SEO.');
      setSeoContext(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Hidrata el seoContext desde una CategoryEntity ya cargada.
   * No hace llamada de red — usa el campo `seoContext` del detalle.
   *
   * @param {import('../../domain/category.entity.js').CategoryEntity} entity
   */
  const hydrateFromEntity = useCallback((entity) => {
    if (!entity?.seoContext) {
      setSeoContext(null);
      return;
    }
    const ctx = CategorySEOContext.fromRaw(entity.seoContext);
    setSeoContext(ctx);
  }, []);

  /** Limpia el contexto SEO */
  const clearSEOContext = useCallback(() => {
    setSeoContext(null);
    setError(null);
  }, []);

  /**
   * Props listos para pasar a <Helmet> de react-helmet-async.
   * Devuelve un objeto vacío si no hay contexto.
   */
  const helmetProps = useMemo(() => {
    if (!seoContext) return {};
    return seoContext.toHelmetProps();
  }, [seoContext]);

  /**
   * Items del breadcrumb listos para UI y JSON-LD.
   * @returns {import('../../domain/category.model.js').BreadcrumbItem[]}
   */
  const breadcrumb = useMemo(() => {
    return seoContext?.breadcrumb ?? [];
  }, [seoContext]);

  return {
    // Data
    seoContext,
    helmetProps,
    breadcrumb,
    hasSEOContext : seoContext !== null,

    // Estado
    loading,
    error,

    // Acciones
    fetchSEOContext,
    hydrateFromEntity,
    clearSEOContext,
  };
};

export default useCategorySEO;