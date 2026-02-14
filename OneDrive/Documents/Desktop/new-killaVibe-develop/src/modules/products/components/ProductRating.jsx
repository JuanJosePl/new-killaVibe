import { Star } from "lucide-react";

/**
 * @component ProductRating
 * @description Rating con estrellas y distribución visual
 *
 * ✅ USA:
 * - rating.average (0-5)
 * - rating.count (número total de reviews)
 * - rating.distribution._1 a ._5
 */
export function ProductRating({
  average = 0,
  count = 0,
  distribution = null,
  showDistribution = true,
}) {
  // ✅ Validación
  const safeAverage = Math.max(0, Math.min(5, average || 0));
  const safeCount = Math.max(0, count || 0);

  // ✅ Distribución con defaults
  const safeDist = {
    _1: distribution?._1 || 0,
    _2: distribution?._2 || 0,
    _3: distribution?._3 || 0,
    _4: distribution?._4 || 0,
    _5: distribution?._5 || 0,
  };

  // Calcular porcentajes
  const getPercentage = (starLevel) => {
    if (safeCount === 0) return 0;
    return Math.round((safeDist[`_${starLevel}`] / safeCount) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Rating Principal */}
      <div className="flex items-center space-x-4">
        {/* Estrellas */}
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= Math.round(safeAverage)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Average Score */}
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">
            {safeAverage > 0 ? safeAverage.toFixed(1) : "0.0"}
          </span>
          <span className="text-sm text-gray-600">
            ({safeCount} {safeCount === 1 ? "opinión" : "opiniones"})
          </span>
        </div>
      </div>

      {/* ✅ Distribución visual (si se solicita y hay datos) */}
      {showDistribution && safeCount > 0 && (
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const percentage = getPercentage(stars);
            const starCount = safeDist[`_${stars}`];

            return (
              <div key={stars} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-20">
                  <span className="text-sm font-medium text-gray-700">
                    {stars}
                  </span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>

                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <span className="text-sm text-gray-600 w-16 text-right">
                  {starCount} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {safeCount === 0 && (
        <p className="text-sm text-gray-500 italic">
          Este producto aún no tiene opiniones. ¡Sé el primero en valorarlo!
        </p>
      )}
    </div>
  );
}

/**
 * @component ProductRatingStars
 * @description Solo estrellas (versión compacta para cards)
 */
export function ProductRatingStars({ average = 0, count = 0, size = "sm" }) {
  const safeAverage = Math.max(0, Math.min(5, average || 0));
  const safeCount = Math.max(0, count || 0);

  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const iconSize = sizeClasses[size] || sizeClasses.sm;

  return (
    <div className="flex items-center space-x-1.5">
      <div className="flex items-center text-yellow-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= Math.round(safeAverage) ? "fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
      {safeCount > 0 && (
        <span className="text-xs font-medium text-gray-600">({safeCount})</span>
      )}
    </div>
  );
}
