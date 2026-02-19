import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Trash2 } from 'lucide-react';
import { useCartContext } from '../../cart/context/CartContext';
import { toast } from 'react-hot-toast';
import { useWishlist } from '../index';
import { canMoveItemToCart } from '../domain/wishlist.validators';
import {
  formatPrice,
  formatAddedDate,
  getPriceChangeMessage,
  getPriceChangeBadgeClass,
} from '../utils/wishlistHelpers';
import { getPrimaryImage } from '../../products/utils/productHelpers';

/**
 * @component WishlistItem
 * @description Item de wishlist con layout horizontal compacto.
 *
 * Usa useWishlist para loading granular por producto.
 * Las acciones (remove, moveToCart) vienen por props desde WishlistGrid
 * para mantener el flujo de datos unidireccional.
 *
 * @param {Object}   item            - WishlistItem canónico del dominio
 * @param {boolean}  isSelected      - Si el item está seleccionado para bulk actions
 * @param {Function} onRemove        - () => void — disparado por WishlistGrid
 * @param {Function} onMoveToCart    - () => void — disparado por WishlistGrid
 * @param {Function} onToggleSelect  - () => void — para selección bulk
 */
const WishlistItem = ({
  item,
  isSelected = false,
  onRemove,
  onMoveToCart,
  onToggleSelect,
}) => {
  const { addItem: addToCart } = useCartContext();

  // Loading granular: solo el ítem específico muestra spinner
  const { isItemLoading } = useWishlist();
  const loading = isItemLoading(item?.productId);

  // ── EXTRACCIÓN DE DATOS ────────────────────────────────────────────────────

  const product     = item?.product || {};
  const productId   = item?.productId;
  const name        = product.name  || 'Producto sin nombre';
  const price       = product.price || 0;
  const comparePrice = product.comparePrice || product.originalPrice || 0;
  const stock       = product.stock ?? 0;
  const slug        = product.slug  || productId;
  const imageUrl    = getPrimaryImage(product);

  const categoryName   = product.mainCategory?.name || product.category?.name || null;
  const averageRating  = product.rating?.average || product.rating || 0;
  const ratingCount    = product.rating?.count || product.numReviews || 0;
  const isFeatured     = product.isFeatured || product.featured || false;

  if (!productId) return null;

  // ── LÓGICA DE NEGOCIO ──────────────────────────────────────────────────────

  const moveToCartStatus   = canMoveItemToCart(item);
  const priceChangeMessage = getPriceChangeMessage(item);
  const badgeClass         = getPriceChangeBadgeClass(item);
  const hasDiscount        = comparePrice > price;
  const discountPct        = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  // ── HANDLERS ───────────────────────────────────────────────────────────────

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove && !loading) onRemove();
  };

  const handleMoveToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!moveToCartStatus.canMove || loading) {
      toast.error(moveToCartStatus.reason || 'No se puede agregar al carrito');
      return;
    }

    try {
      await addToCart(product, 1, {});
      toast.success(`${name} agregado al carrito`, { icon: '🛒', duration: 2000 });
    } catch (error) {
      toast.error(error.message || 'Error al agregar al carrito');
    }
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 overflow-hidden hover:shadow-xl transition-all duration-300 ${
      isSelected
        ? 'border-blue-400 dark:border-blue-500'
        : 'border-gray-200 dark:border-gray-700 hover:border-primary/30'
    }`}>
      <div className="flex flex-row h-48">

        {/* IMAGEN */}
        <Link
          to={`/productos/${slug}`}
          className="relative w-48 h-48 flex-shrink-0 bg-gray-100 dark:bg-gray-900 group overflow-hidden"
        >
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              const placeholder = e.target.nextElementSibling;
              if (placeholder) placeholder.style.display = 'flex';
            }}
          />

          {/* Placeholder imagen */}
          <div
            className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-900"
            style={{ display: imageUrl ? 'none' : 'flex' }}
          >
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {hasDiscount && (
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                -{discountPct}%
              </div>
            )}
            {isFeatured && (
              <div className="bg-gradient-to-r from-primary to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Destacado
              </div>
            )}
          </div>

          {/* Checkbox de selección */}
          {onToggleSelect && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSelect(); }}
              className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full border-2 border-white bg-white/80 flex items-center justify-center shadow-sm transition-colors hover:bg-blue-50"
            >
              {isSelected && (
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
        </Link>

        {/* CONTENIDO */}
        <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">

          {/* Sección superior */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {categoryName && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70 dark:text-primary/50 mb-0.5">
                {categoryName}
              </p>
            )}

            <Link to={`/productos/${slug}`} className="block group/link mb-1">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover/link:text-primary transition-colors line-clamp-2 leading-tight">
                {name}
              </h3>
            </Link>

            {averageRating > 0 && (
              <div className="flex items-center gap-1 mb-1">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.round(averageRating) ? 'fill-current' : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-gray-600 dark:text-gray-400">({ratingCount})</span>
              </div>
            )}

            {/* Badge de disponibilidad */}
            <div className="mb-1">
              {item.isAvailable === false ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800">
                  No disponible
                </span>
              ) : stock <= 5 && stock > 0 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                  Solo {stock} disponibles
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800">
                  Disponible
                </span>
              )}
            </div>

            {/* Badge de cambio de precio */}
            {priceChangeMessage && (
              <div className="mb-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${badgeClass}`}>
                  {priceChangeMessage}
                </span>
              </div>
            )}

            {item.addedAt && (
              <p className="text-[9px] text-gray-500 dark:text-gray-400">
                Agregado {formatAddedDate(item.addedAt)}
              </p>
            )}
          </div>

          {/* Sección inferior: precio + botones */}
          <div className="flex-shrink-0 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {formatPrice(price)}
                </span>
                {hasDiscount && (
                  <span className="text-xs line-through text-gray-500 dark:text-gray-400">
                    {formatPrice(comparePrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-1.5">
              {/* Agregar al carrito */}
              <button
                onClick={handleMoveToCart}
                disabled={loading || !moveToCartStatus.canMove}
                type="button"
                className={`flex-1 px-3 py-1.5 rounded-lg font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  moveToCartStatus.canMove
                    ? 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:scale-[1.02] disabled:opacity-50'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
                title={!moveToCartStatus.canMove ? moveToCartStatus.reason : 'Agregar al carrito'}
              >
                {loading ? (
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Agregar al carrito</span>
                  </>
                )}
              </button>

              {/* Eliminar */}
              <button
                onClick={handleRemove}
                disabled={loading}
                type="button"
                className="px-3 py-1.5 rounded-lg font-bold text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:text-red-300 dark:disabled:text-red-800 disabled:cursor-not-allowed transition-all duration-300 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;