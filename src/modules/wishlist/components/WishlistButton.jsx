import React, { useState } from 'react';
import { useWishlist } from '../index';
import { useWishlistActions } from '../index';

/**
 * @component WishlistButton
 * @description Botón de corazón para agregar/quitar de wishlist.
 * Reutilizable en ProductCard y cualquier contexto de producto.
 *
 * Usa useWishlist para leer estado (isInWishlist, isItemLoading).
 * Usa useWishlistActions para disparar toggleWishlist.
 * No accede al store, repository ni API directamente.
 *
 * @param {string}   productId            - ID del producto (MongoDB ObjectId)
 * @param {boolean}  [notifyPriceChange]  - Activar notificación de precio al agregar
 * @param {boolean}  [notifyAvailability] - Activar notificación de disponibilidad al agregar
 * @param {'sm'|'md'|'lg'} [size]         - Tamaño del botón
 * @param {'icon'|'button'} [variant]     - Estilo: solo icono o botón con texto
 * @param {Function} [onSuccess]          - Callback externo de éxito (opcional)
 * @param {Function} [onError]            - Callback externo de error (opcional)
 */
const WishlistButton = ({
  productId,
  notifyPriceChange = false,
  notifyAvailability = false,
  size = 'md',
  variant = 'icon',
  onSuccess,
  onError,
}) => {
  // ── ESTADO DEL STORE (solo lectura) ────────────────────────────────────────
  const { isInWishlist, isItemLoading } = useWishlist();

  const inWishlist = isInWishlist(productId);
  const loading    = isItemLoading(productId);

  // ── ACCIONES ───────────────────────────────────────────────────────────────
  const { toggleWishlist } = useWishlistActions(onSuccess, onError);

  // ── ANIMACIÓN LOCAL ────────────────────────────────────────────────────────
  const [isAnimating, setIsAnimating] = useState(false);

  // ── HANDLER ────────────────────────────────────────────────────────────────

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    await toggleWishlist(productId, { notifyPriceChange, notifyAvailability });

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };

  // ── TAMAÑOS ────────────────────────────────────────────────────────────────

  const containerSize = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' }[size];
  const iconSize      = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' }[size];

  // ── SVG COMPARTIDOS ────────────────────────────────────────────────────────

  const SpinnerIcon = ({ className }) => (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  const HeartIcon = ({ className }) => (
    <svg
      className={className}
      fill={inWishlist ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={inWishlist ? 0 : 2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );

  // ── RENDER: VARIANTE ICON ──────────────────────────────────────────────────

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        type="button"
        className={`
          ${containerSize}
          rounded-full flex items-center justify-center
          transition-all duration-200 shadow-sm hover:shadow-md
          ${inWishlist
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isAnimating ? 'scale-125' : 'scale-100'}
        `}
        title={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        aria-label={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        {loading
          ? <SpinnerIcon className={iconSize} />
          : <HeartIcon className={`${iconSize} transition-transform ${isAnimating ? 'scale-110' : ''}`} />
        }
      </button>
    );
  }

  // ── RENDER: VARIANTE BUTTON ────────────────────────────────────────────────

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      type="button"
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg
        font-medium text-sm transition-all duration-200
        ${inWishlist
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-white text-gray-700 border border-gray-300 hover:border-red-500 hover:text-red-500'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isAnimating ? 'scale-105' : 'scale-100'}
      `}
    >
      {loading ? (
        <>
          <SpinnerIcon className="w-5 h-5" />
          <span>Procesando...</span>
        </>
      ) : (
        <>
          <HeartIcon className={`w-5 h-5 ${isAnimating ? 'scale-110' : ''}`} />
          <span>{inWishlist ? 'En favoritos' : 'Agregar a favoritos'}</span>
        </>
      )}
    </button>
  );
};

export default WishlistButton;