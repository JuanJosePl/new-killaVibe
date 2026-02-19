/**
 * @component ReviewStats
 * @description Estadísticas visuales de reviews de un producto.
 *
 * Consume únicamente ReviewStats (value object de dominio).
 * Sin lógica de cálculo — delega a useReviewStats.
 */

import React from 'react';
import { RATING_BAR_COLOR_CLASS } from '../../domain/review.model.js';

const StarIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

/* ─── Skeleton ───────────────────────────────────────────────────── */

const StatsSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-1/3 mb-4" />
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-4 bg-gray-300 rounded" />
      ))}
    </div>
  </div>
);

/* ─── Empty state ────────────────────────────────────────────────── */

const StatsEmpty = () => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
    <StarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
    <p className="text-gray-500 text-sm">Sin calificaciones aún</p>
  </div>
);

/* ─── Main ───────────────────────────────────────────────────────── */

/**
 * @param {Object} props
 * @param {import('../../domain/review.model.js').ReviewStats} props.stats  - Value object
 * @param {boolean} [props.loading=false]
 */
const ReviewStats = ({ stats, loading = false }) => {
  if (loading)             return <StatsSkeleton />;
  if (!stats || stats.isEmpty) return <StatsEmpty />;

  const percentages = stats.percentages;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Promedio general */}
      <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
        {/* Número grande */}
        <div className="text-center min-w-[80px]">
          <div className="text-5xl font-bold text-gray-900 mb-1">
            {stats.displayAverage}
          </div>
          <div className="flex items-center justify-center mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`w-5 h-5 ${star <= Math.round(stats.average) ? 'text-yellow-400' : 'text-gray-200'}`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {stats.total} {stats.total === 1 ? 'calificación' : 'calificaciones'}
          </p>
        </div>

        {/* Distribución */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count   = stats.distribution[rating] ?? 0;
            const pct     = percentages[rating]         ?? 0;
            const barCls  = RATING_BAR_COLOR_CLASS[rating];

            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 shrink-0">
                  <span className="text-sm text-gray-700 font-medium">{rating}</span>
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                </div>

                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barCls}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center gap-1.5 w-20 text-right shrink-0">
                  <span className="text-xs font-medium text-gray-700">{pct}%</span>
                  <span className="text-xs text-gray-400">({count})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badge verificados */}
      {stats.verifiedPercentage > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
          <ShieldIcon />
          <span>
            <strong>{stats.verifiedPercentage}%</strong> de compras verificadas
          </span>
        </div>
      )}
    </div>
  );
};

export default ReviewStats;