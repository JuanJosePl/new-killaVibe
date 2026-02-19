/**
 * @component ReviewForm
 * @description Formulario para crear/editar reviews.
 *
 * - Usa validateCreatePayload / validateUpdatePayload del dominio (sin Yup)
 * - No importa Context ni store — recibe callbacks de los hooks de acción
 * - Controlado completamente: el padre decide qué hacer con el submit
 */

import React, { useState, useCallback, useEffect } from 'react';
import { validateCreatePayload, validateUpdatePayload } from '../../domain/review.validators.js';
import { TEXT_LIMITS } from '../../domain/review.model.js';

/* ─── Íconos ─────────────────────────────────────────────────────── */

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const StarIcon = ({ filled, size = 10 }) => (
  <svg className={`w-${size} h-${size} ${filled ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

/* ─── RatingSelector ─────────────────────────────────────────────── */

const RATING_LABELS = { 1: 'Muy malo', 2: 'Malo', 3: 'Regular', 4: 'Bueno', 5: 'Excelente' };

const RatingSelector = ({ value, onChange, error }) => {
  const [hover, setHover] = useState(0);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Calificación <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <StarIcon filled={star <= (hover || value)} size={10} />
          </button>
        ))}
        {(hover || value) > 0 && (
          <span className="ml-2 text-sm text-gray-600 font-medium">
            {RATING_LABELS[hover || value]}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

/* ─── ReviewForm ─────────────────────────────────────────────────── */

/**
 * @param {Object} props
 * @param {import('../../domain/review.entity.js').ReviewEntity|null} [props.initialData]
 * @param {Function}  props.onSubmit   - async (formData) => void
 * @param {Function}  props.onCancel   - () => void
 * @param {boolean}  [props.isLoading=false]
 */
const ReviewForm = ({ initialData = null, onSubmit, onCancel, isLoading = false }) => {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    rating  : initialData?.rating  ?? 0,
    title   : initialData?.title   ?? '',
    comment : initialData?.comment ?? '',
    images  : initialData?.images  ?? [],
  });

  const [errors,      setErrors]      = useState({});
  const [submitting,  setSubmitting]  = useState(false);

  // Reset al cambiar initialData (por ejemplo al editar otra review)
  useEffect(() => {
    setFormData({
      rating  : initialData?.rating  ?? 0,
      title   : initialData?.title   ?? '',
      comment : initialData?.comment ?? '',
      images  : initialData?.images  ?? [],
    });
    setErrors({});
  }, [initialData]);

  /* ── Field update ───────────────────────────────────────────────── */

  const update = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  }, [errors]);

  /* ── Validación ─────────────────────────────────────────────────── */

  const validate = useCallback(() => {
    const result = isEditMode
      ? validateUpdatePayload(formData)
      : validateCreatePayload(formData);
    setErrors(result.errors);
    return result.valid;
  }, [formData, isEditMode]);

  /* ── Submit ─────────────────────────────────────────────────────── */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        rating  : formData.rating,
        comment : formData.comment.trim(),
        ...(formData.title.trim()  && { title  : formData.title.trim() }),
        ...(formData.images.length && { images : formData.images }),
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Imágenes ───────────────────────────────────────────────────── */

  const addImage = () => {
    const url = window.prompt('URL de la imagen:');
    if (!url) return;
    if (formData.images.length >= 5) return;
    update('images', [...formData.images, { url, alt: '' }]);
  };

  const removeImage = (i) => {
    update('images', formData.images.filter((_, idx) => idx !== i));
  };

  /* ── Contadores ─────────────────────────────────────────────────── */

  const commentLen  = formData.comment.length;
  const remaining   = TEXT_LIMITS.COMMENT_MAX - commentLen;
  const countColor  = commentLen < TEXT_LIMITS.COMMENT_MIN
    ? 'text-red-500'
    : remaining < 100 ? 'text-orange-500' : 'text-gray-400';

  const busy = submitting || isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Rating */}
      <RatingSelector
        value={formData.rating}
        onChange={(v) => update('rating', v)}
        error={errors.rating}
      />

      {/* Título (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Título <span className="text-gray-400 text-xs">(opcional)</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Resume tu experiencia en pocas palabras"
          maxLength={TEXT_LIMITS.TITLE_MAX}
          className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-400' : 'border-gray-300'}`}
        />
        <div className="flex justify-between mt-0.5">
          <span className="text-xs text-gray-400">{formData.title.length}/{TEXT_LIMITS.TITLE_MAX}</span>
          {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
        </div>
      </div>

      {/* Comentario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Tu opinión <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.comment}
          onChange={(e) => update('comment', e.target.value)}
          placeholder="Comparte tu experiencia. ¿Qué te gustó? ¿Qué mejorarías?"
          rows={5}
          maxLength={TEXT_LIMITS.COMMENT_MAX}
          className={`w-full px-3.5 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.comment ? 'border-red-400' : 'border-gray-300'}`}
        />
        <div className="flex justify-between mt-0.5">
          <span className={`text-xs ${countColor}`}>
            {commentLen < TEXT_LIMITS.COMMENT_MIN
              ? `Faltan ${TEXT_LIMITS.COMMENT_MIN - commentLen} caracteres`
              : `${commentLen} / ${TEXT_LIMITS.COMMENT_MAX}`}
          </span>
          {errors.comment && <p className="text-xs text-red-600">{errors.comment}</p>}
        </div>
      </div>

      {/* Imágenes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Imágenes <span className="text-gray-400 text-xs">(opcional, máx. 5)</span>
        </label>

        {formData.images.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {formData.images.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img.url} alt={`Preview ${i + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {formData.images.length < 5 && (
          <button
            type="button"
            onClick={addImage}
            className="px-4 py-2 text-sm border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            + Agregar imagen
          </button>
        )}

        {errors.images && <p className="mt-1 text-xs text-red-600">{errors.images}</p>}
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="px-5 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={busy}
          className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {busy ? <><Spinner /><span>Guardando…</span></> : (
            <span>{isEditMode ? 'Actualizar review' : 'Publicar review'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;