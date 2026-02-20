// modules/search/domain/search.entity.js
//
// Entidades puras del dominio Search.
// Sin dependencias de React, Zustand, Router ni API.
//
// ARQUITECTURA CLAVE:
// Este módulo Search es un módulo de ANALYTICS e HISTORIAL, no de búsqueda
// de productos full-text. La búsqueda full-text de productos vive en el módulo
// Products (GET /api/products?search=...). Este módulo gestiona:
//   1. Sugerencias (historial + productos agregados por backend)
//   2. Búsquedas populares (analytics agregado)
//   3. Tendencias (analytics con trendScore calculado por backend)
//   4. Historial personal (queries del usuario autenticado)
//   5. Admin: fallidas + stats

import { TREND_LEVELS, FAILED_IMPACT_LEVELS } from './search.model.js';

// ============================================
// SUGGESTION ENTITY
// ============================================

/**
 * @class SuggestionEntity
 * @description Sugerencia de búsqueda. Shape de respuesta del backend:
 *   { suggestion: string, popularity: number }
 */
export class SuggestionEntity {
  constructor(raw) {
    this.suggestion  = raw.suggestion  ?? '';
    this.popularity  = raw.popularity  ?? 0;
    Object.freeze(this);
  }

  toPlain() {
    return { suggestion: this.suggestion, popularity: this.popularity };
  }
}

// ============================================
// POPULAR SEARCH ENTITY
// ============================================

/**
 * @class PopularSearchEntity
 * @description Búsqueda popular. Shape del backend (statics.getPopularSearches):
 *   { query, count, avgResults, clickRate }
 *   clickRate ya viene multiplicado ×100 (es porcentaje)
 */
export class PopularSearchEntity {
  constructor(raw) {
    this.query      = raw.query      ?? '';
    this.count      = raw.count      ?? 0;
    this.avgResults = raw.avgResults ?? 0;
    this.clickRate  = raw.clickRate  ?? 0; // Ya es porcentaje (×100) — backend lo hace
    Object.freeze(this);
  }

  toPlain() {
    return {
      query:      this.query,
      count:      this.count,
      avgResults: this.avgResults,
      clickRate:  this.clickRate,
    };
  }
}

// ============================================
// TRENDING SEARCH ENTITY
// ============================================

/**
 * @class TrendingSearchEntity
 * @description Búsqueda en tendencia. Shape del backend (statics.getTrendingSearches):
 *   { query, recentCount, totalCount, trendScore }
 *   trendScore = recentCount / totalCount — calculado por backend, NO recalcular
 */
export class TrendingSearchEntity {
  constructor(raw) {
    this.query       = raw.query       ?? '';
    this.recentCount = raw.recentCount ?? 0;
    this.totalCount  = raw.totalCount  ?? 0;
    this.trendScore  = raw.trendScore  ?? 0; // Backend lo calcula — readonly

    // Clasificación para UI (NO es cálculo de score)
    this.trendLevel = this._classifyTrendLevel(this.trendScore);

    Object.freeze(this);
  }

  /**
   * Clasificar nivel de tendencia basado en trendScore del backend.
   * El score lo calcula el backend. Aquí solo se clasifica para display.
   * @private
   */
  _classifyTrendLevel(score) {
    if (score >= TREND_LEVELS.HIGH.threshold)        return TREND_LEVELS.HIGH;
    if (score >= TREND_LEVELS.MEDIUM_HIGH.threshold) return TREND_LEVELS.MEDIUM_HIGH;
    if (score >= TREND_LEVELS.MEDIUM.threshold)      return TREND_LEVELS.MEDIUM;
    return TREND_LEVELS.LOW;
  }

  toPlain() {
    return {
      query:       this.query,
      recentCount: this.recentCount,
      totalCount:  this.totalCount,
      trendScore:  this.trendScore,
      trendLevel:  { ...this.trendLevel },
    };
  }
}

// ============================================
// HISTORY ENTRY ENTITY
// ============================================

/**
 * @class SearchHistoryEntity
 * @description Entrada de historial personal. Shape del backend (getUserSearchHistory):
 *   { _id, query, resultsCount, clicked, createdAt }
 */
export class SearchHistoryEntity {
  constructor(raw) {
    this._id          = raw._id;
    this.query        = raw.query        ?? '';
    this.resultsCount = raw.resultsCount ?? 0;
    this.clicked      = raw.clicked      ?? false;
    this.createdAt    = raw.createdAt ? new Date(raw.createdAt) : null;

    // Computed: ¿fue una búsqueda sin resultados?
    this.wasFailed = this.resultsCount === 0;

    Object.freeze(this);
  }

  toPlain() {
    return {
      _id:          this._id,
      query:        this.query,
      resultsCount: this.resultsCount,
      clicked:      this.clicked,
      wasFailed:    this.wasFailed,
      createdAt:    this.createdAt?.toISOString() ?? null,
    };
  }
}

// ============================================
// FAILED SEARCH ENTITY (ADMIN)
// ============================================

/**
 * @class FailedSearchEntity
 * @description Búsqueda sin resultados. Shape del backend (statics.getFailedSearches):
 *   { query, failedCount }
 */
export class FailedSearchEntity {
  constructor(raw) {
    this.query       = raw.query       ?? '';
    this.failedCount = raw.failedCount ?? 0;

    // Clasificación de impacto para UI admin
    this.impact = this._classifyImpact(this.failedCount);

    Object.freeze(this);
  }

  _classifyImpact(count) {
    if (count >= FAILED_IMPACT_LEVELS.HIGH.threshold)   return FAILED_IMPACT_LEVELS.HIGH;
    if (count >= FAILED_IMPACT_LEVELS.MEDIUM.threshold) return FAILED_IMPACT_LEVELS.MEDIUM;
    return FAILED_IMPACT_LEVELS.LOW;
  }

  toPlain() {
    return {
      query:       this.query,
      failedCount: this.failedCount,
      impact:      { ...this.impact },
    };
  }
}

// ============================================
// SEARCH STATS ENTITY (ADMIN)
// ============================================

/**
 * @class SearchStatsEntity
 * @description Estadísticas de búsqueda. Shape del backend (getSearchStats):
 *   { totalSearches, uniqueQueries, avgResults, clickThroughRate,
 *     failedSearches, failedRate, period }
 *   clickThroughRate ya viene ×100 — backend lo hace
 *   failedRate ya viene como string "12.34" — lo convertimos a número
 */
export class SearchStatsEntity {
  constructor(raw) {
    this.totalSearches     = raw.totalSearches     ?? 0;
    this.uniqueQueries     = raw.uniqueQueries     ?? 0;
    this.avgResults        = raw.avgResults        ?? 0;
    this.clickThroughRate  = raw.clickThroughRate  ?? 0;  // Ya es % — backend
    this.failedSearches    = raw.failedSearches    ?? 0;
    this.failedRate        = parseFloat(raw.failedRate ?? 0); // Backend retorna string
    this.period            = raw.period            ?? 30;
    Object.freeze(this);
  }

  toPlain() {
    return {
      totalSearches:    this.totalSearches,
      uniqueQueries:    this.uniqueQueries,
      avgResults:       this.avgResults,
      clickThroughRate: this.clickThroughRate,
      failedSearches:   this.failedSearches,
      failedRate:       this.failedRate,
      period:           this.period,
    };
  }
}