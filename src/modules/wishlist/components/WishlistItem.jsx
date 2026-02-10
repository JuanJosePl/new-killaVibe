import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Trash2 } from 'lucide-react';
import { useCartContext } from '../../cart/context/CartContext';
import { toast } from 'react-hot-toast';
import {
  formatPrice,
  formatPriceChange,
  formatPriceChangePercentage,
  getPriceChangeMessage,
  getPriceChangeBadgeClass,
  formatAddedDate,
  canMoveToCart
} from '../utils/wishlistHelpers';

/**
 * @component WishlistItem
 * @description Item de wishlist con layout horizontal perfectamente alineado
 * 
 * ✅ FIXES FINALES:
 * - Altura del contenedor = altura de la imagen (192px)
 * - Todo el contenido dentro de esa altura
 * - No pide autenticación al agregar al carrito
 */
const WishlistItem = ({
  item,
  onRemove,
  onMoveToCart,
  loading = false,
  disabled = false
}) => {
  const { addItem: addToCart } = useCartContext();

  // ============================================================================
  // EXTRACCIÓN DE DATOS
  // ============================================================================
  
  const product = item?.product || item || {};
  
  const productId = product._id || product.id || item?.productId;
  const name = product.name || "Producto sin nombre";
  const price = product.price || 0;
  const comparePrice = product.comparePrice || product.originalPrice || 0;
  const stock = product.stock ?? 0;
  const slug = product.slug || productId;
  
  // ✅ EXTRACCIÓN DE IMAGEN
  let imageUrl = null;
  if (Array.isArray(product.images) && product.images.length > 0) {
    const primaryImage = product.images.find(img => img.isPrimary === true);
    if (primaryImage?.url) {
      imageUrl = primaryImage.url;
    } else {
      const firstImage = product.images.find(img => img.url);
      imageUrl = firstImage?.url || null;
    }
  } else if (product.image && typeof product.image === 'string') {
    imageUrl = product.image;
  } else if (product.thumbnail) {
    imageUrl = product.thumbnail;
  }

  const categoryName = product.mainCategory?.name || product.category?.name || null;
  const averageRating = product.rating?.average || product.rating || 0;
  const ratingCount = product.rating?.count || product.numReviews || 0;
  const isFeatured = product.isFeatured || product.featured || false;

  if (!productId) {
    console.error("[WishlistItem] Producto sin ID válido:", item);
    return null;
  }

  // ============================================================================
  // LÓGICA DE NEGOCIO
  // ============================================================================
  
  const safeItem = {
    ...item,
    product: product,
    isAvailable: item.isAvailable ?? (stock > 0)
  };

  const moveToCartStatus = canMoveToCart(safeItem);
  const priceChangeMessage = getPriceChangeMessage(safeItem);
  const priceChangeBadgeClass = getPriceChangeBadgeClass(safeItem);

  const hasDiscount = comparePrice > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onRemove && !loading && !disabled) {
      onRemove(productId);
    }
  };

  // ✅ CRÍTICO: Prevenir propagación para evitar navegación
  const handleMoveToCart = async (e) => {
    e.preventDefault(); // ⬅️ EVITA QUE SE DISPARE NAVEGACIÓN
    e.stopPropagation(); // ⬅️ EVITA BUBBLING
    
    if (!moveToCartStatus.canMove || loading || disabled) {
      toast.error(moveToCartStatus.reason || 'No se puede agregar al carrito');
      return;
    }

    try {
      // Agregar al carrito directamente (modo guest)
      await addToCart(product, 1, {});
      
      toast.success(`${name} agregado al carrito`, {
        icon: '🛒',
        duration: 2000
      });
      
      // NO ejecutar callback que podría causar navegación
      // if (onMoveToCart) {
      //   onMoveToCart(productId);
      // }
    } catch (error) {
      console.error('[WishlistItem] Error agregando al carrito:', error);
      toast.error(error.message || 'Error al agregar al carrito');
    }
  };

  // ============================================================================
  // RENDER - LAYOUT HORIZONTAL COMPACTO (192px altura fija)
  // ============================================================================

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300">
      {/* ✅ Contenedor con altura FIJA = 192px (igual a la imagen) */}
      <div className="flex flex-row h-48">
        
        {/* ============================================================ */}
        {/* COLUMNA 1: IMAGEN (192px x 192px) */}
        {/* ============================================================ */}
        <Link 
          to={`/productos/${slug}`}
          className="relative w-48 h-48 flex-shrink-0 bg-gray-100 dark:bg-gray-900 group overflow-hidden"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          {/* Placeholder */}
          <div 
            className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-900"
            style={{ display: imageUrl ? 'none' : 'flex' }}
          >
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Badges sobre la imagen */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {hasDiscount && (
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                -{discountPercentage}%
              </div>
            )}
            {isFeatured && (
              <div className="bg-gradient-to-r from-primary to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Destacado
              </div>
            )}
          </div>
        </Link>

        {/* ============================================================ */}
        {/* COLUMNA 2: INFO + PRECIO + BOTONES (altura 192px fija) */}
        {/* ============================================================ */}
        <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
          
          {/* SECCIÓN SUPERIOR: Info compacta */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {/* Categoría */}
            {categoryName && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70 dark:text-primary/50 mb-0.5">
                {categoryName}
              </p>
            )}

            {/* Nombre - máximo 2 líneas */}
            <Link 
              to={`/productos/${slug}`}
              className="block group/link mb-1"
            >
              <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover/link:text-primary transition-colors line-clamp-2 leading-tight">
                {name}
              </h3>
            </Link>

            {/* Rating compacto */}
            {averageRating > 0 && (
              <div className="flex items-center gap-1 mb-1">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.round(averageRating)
                          ? 'fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-gray-600 dark:text-gray-400">
                  ({ratingCount})
                </span>
              </div>
            )}

            {/* Badge de disponibilidad (solo 1, el más relevante) */}
            <div className="mb-1">
              {!safeItem.isAvailable ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800">
                  No disponible
                </span>
              ) : stock <= 5 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                  Solo {stock} disponibles
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800">
                  Disponible
                </span>
              )}
            </div>

            {/* Fecha (opcional, muy pequeña) */}
            {item.addedAt && (
              <p className="text-[9px] text-gray-500 dark:text-gray-400">
                Agregado {formatAddedDate(item.addedAt)}
              </p>
            )}
          </div>

          {/* SECCIÓN INFERIOR: Precio + Botones (altura fija) */}
          <div className="flex-shrink-0 pt-2 border-t border-gray-200 dark:border-gray-700">
            {/* Precio compacto */}
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

            {/* Botones compactos */}
            <div className="flex gap-1.5">
              {/* Botón: Agregar al carrito */}
              <button
                onClick={handleMoveToCart}
                disabled={loading || disabled || !moveToCartStatus.canMove}
                type="button"
                className={`
                  flex-1 px-3 py-1.5 rounded-lg font-bold text-xs
                  transition-all duration-300 flex items-center justify-center gap-1.5
                  ${moveToCartStatus.canMove
                    ? 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:scale-[1.02] disabled:opacity-50'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }
                `}
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

              {/* Botón: Eliminar */}
              <button
                onClick={handleRemove}
                disabled={loading || disabled}
                type="button"
                className="px-3 py-1.5 rounded-lg font-bold text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:text-red-300 dark:disabled:text-red-800 disabled:cursor-not-allowed transition-all duration-300 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;

// ok