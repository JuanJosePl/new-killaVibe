"use client"
import { useState } from "react"
import { X, Star, AlertCircle, CheckCircle2, Loader2, PenLine } from "lucide-react"
import { useCustomerReviews } from "../../../context/CustomerReviewsContext"

/**
 * @component ReviewFormModal
 * @description Modal para crear/editar reseñas con validaciones
 *
 * @param {string} productId - ID del producto
 * @param {Function} onClose - Handler para cerrar modal
 * @param {Function} onSuccess - Handler para éxito
 */
const ReviewFormModal = ({ productId, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const { createReview } = useCustomerReviews()

  const validateForm = () => {
    const newErrors = {}

    if (rating === 0) newErrors.rating = "Selecciona una calificación"
    if (comment.trim().length < 10) newErrors.comment = "El comentario debe tener al menos 10 caracteres"
    if (comment.length > 1000) newErrors.comment = "El comentario no puede exceder 1000 caracteres"
    if (title.length > 100) newErrors.title = "El título no puede exceder 100 caracteres"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setIsSubmitting(true)

      const reviewData = {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        images: images.map((img) => ({ url: img, alt: `Review image` })),
      }

      const newReview = await createReview(productId, reviewData)
      onSuccess(newReview)
    } catch (error) {
      console.error("Error creating review:", error)
      alert(error.message || "Error al enviar la reseña")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PenLine className="w-6 h-6 text-blue-600" />
            Escribe tu Reseña
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating Selector */}
          <div className="space-y-2">
            <label className="label">
              Calificación <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-lg font-bold text-gray-900">
                  {rating === 5 && "¡Excelente!"}
                  {rating === 4 && "Muy bueno"}
                  {rating === 3 && "Bueno"}
                  {rating === 2 && "Regular"}
                  {rating === 1 && "Malo"}
                </span>
              )}
            </div>
            {errors.rating && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.rating}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="label">Título (opcional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resume tu experiencia..."
              maxLength={100}
              className="input-base"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Máximo 100 caracteres</span>
              <span>{title.length}/100</span>
            </div>
            {errors.title && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="label">
              Comentario <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos sobre tu experiencia con este producto..."
              minLength={10}
              maxLength={1000}
              className="textarea"
              rows={6}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Mínimo 10 caracteres</span>
              <span className={comment.length > 1000 ? "text-red-600 font-bold" : ""}>{comment.length}/1000</span>
            </div>
            {errors.comment && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.comment}
              </p>
            )}
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Pautas para una buena reseña:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1 ml-7">
              <li>• Sé honesto y específico sobre tu experiencia</li>
              <li>• Describe cómo usaste el producto</li>
              <li>• Menciona pros y contras de manera equilibrada</li>
              <li>• Evita lenguaje ofensivo o inapropiado</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 btn btn-outline">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 btn btn-gradient flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Publicar Reseña
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReviewFormModal
