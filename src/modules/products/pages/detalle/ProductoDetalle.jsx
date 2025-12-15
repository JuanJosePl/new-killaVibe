// src/modules/products/pages/detalle/ProductoDetalle.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Star,
  Check,
  Truck,
  Shield,
  ArrowLeft,
  Share2,
  Eye,
  Loader2,
  Plus,
  Minus,
} from 'lucide-react';
import { toast } from 'react-toastify';

// ============================================================================
// APIs Y HOOKS
// ============================================================================
import { productsAPI } from '../../api/products.api';
import { useProductCart } from '../../hooks/useProductCart';
import { useProductWishlist } from '../../hooks/useProductWishlist';

// ============================================================================
// UTILIDADES
// ============================================================================
import { formatPrice } from '../../utils/priceHelpers';
import {
  isProductAvailable,
  isLowStock,
  getPrimaryImage,
  getAvailabilityStatus,
  getAvailabilityText,
  isNewProduct,
  getAverageRating,
} from '../../utils/productHelpers';

// ============================================================================
// COMPONENTES
// ============================================================================
import { ProductSpecs } from '../../components/ProductSpecs';
import { ProductReviews } from '../../components/ProductReviews';

/**
 * @component ProductoDetalle
 * @description Página de detalle de producto con Cart y Wishlist integrados
 * 
 * INTEGRACIÃN COMPLETA:
 * ✅ useProductCart → agregar, actualizar cantidad, loading
 * ✅ useProductWishlist → toggle, verificar estado, loading
 * ✅ Validaciones de auth
 * ✅ Validaciones de stock
 * ✅ Estados de loading granulares
 * ✅ Error handling completo
 */
export default function ProductoDetalle() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // ==========================================================================
  // HOOKS DE CART Y WISHLIST
  // ==========================================================================

  const {
    addProductToCart,
    incrementQuantity,
    decrementQuantity,
    isProductInCart,
    getProductQuantity,
    loading: cartLoading,
  } = useProductCart();

  const {
    toggleProductWishlist,
    isProductInWishlist,
    loading: wishlistLoading,
  } = useProductWishlist();

  // ==========================================================================
  // ESTADO LOCAL
  // ==========================================================================

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // ==========================================================================
  // COMPUTED VALUES
  // ==========================================================================

  const inWishlist = product ? isProductInWishlist(product._id) : false;
  const inCart = product ? isProductInCart(product._id) : false;
  const cartQuantity = product ? getProductQuantity(product._id) : 0;

  const primaryImage = product ? getPrimaryImage(product) : null;
  const availabilityStatus = product ? getAvailabilityStatus(product) : null;
  const availabilityText = availabilityStatus
    ? getAvailabilityText(availabilityStatus)
    : '';
  const averageRating = product ? getAverageRating(product) : 0;
  const isAvailable = product ? isProductAvailable(product) : false;
  const isLow = product ? isLowStock(product) : false;
  const isNew = product ? isNewProduct(product) : false;

  // ==========================================================================
  // FETCH PRODUCTO
  // ==========================================================================

  useEffect(() => {
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      setError('Producto no válido');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await productsAPI.getProductBySlug(slug);

        if (response.success && response.data) {
          const prod = response.data;

          if (!prod._id || !prod.name) {
            throw new Error('Estructura de producto inválida');
          }

          setProduct(prod);

          // Cargar productos relacionados
          if (prod._id) {
            fetchRelated(prod._id);
          }
        } else {
          setError(response.message || 'Producto no encontrado');
        }
      } catch (err) {
        console.error('[ProductoDetalle] Error:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Error al cargar el producto'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // ==========================================================================
  // FETCH PRODUCTOS RELACIONADOS
  // ==========================================================================

  const fetchRelated = async (productId) => {
    try {
      setLoadingRelated(true);
      const response = await productsAPI.getRelatedProducts(productId, 4);

      if (response.success) {
        setRelatedProducts(response.data || []);
      }
    } catch (err) {
      console.error('[ProductoDetalle] Error fetching related:', err);
    } finally {
      setLoadingRelated(false);
    }
  };

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  /**
   * Toggle wishlist con loading
   */
  const handleToggleWishlist = useCallback(async () => {
    if (!product) return;
    await toggleProductWishlist(product);
  }, [product, toggleProductWishlist]);

  /**
   * Agregar al carrito o incrementar cantidad
   */
  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    if (inCart) {
      // Si ya está, incrementar
      await incrementQuantity(product);
    } else {
      // Si no está, agregar
      await addProductToCart(product, quantity);
    }
  }, [product, inCart, quantity, addProductToCart, incrementQuantity]);

  /**
   * Manejar cambio de cantidad
   */
  const handleQuantityChange = useCallback(
    (newQty) => {
      if (newQty < 1) return;
      if (product?.trackQuantity && newQty > product.stock) {
        setQuantity(product.stock);
        toast.warning(`Solo hay ${product.stock} unidades disponibles`);
        return;
      }
      setQuantity(newQty);
    },
    [product]
  );

  // ==========================================================================
  // RENDER: LOADING
  // ==========================================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-200 rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-200 rounded-2xl h-96" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-12 bg-gray-200 rounded" />
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================================================
  // RENDER: ERROR
  // ==========================================================================

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-8xl mb-6">😕</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Producto no encontrado
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {error || 'El producto que buscas no existe o fue eliminado.'}
          </p>
          <div className="space-y-3">
            <Link to="/productos">
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Volver a productos
              </button>
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-semibold"
            >
              Atrás
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================================================
  // RENDER: SUCCESS
  // ==========================================================================

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* BREADCRUMB */}
        <Link
          to="/productos"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a productos
        </Link>

        {/* PRODUCT HEADER */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 lg:p-10">
            {/* GALLERY */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative bg-gray-100 dark:bg-slate-700 rounded-2xl overflow-hidden aspect-square group">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Eye className="h-16 w-16" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {isNew && (
                    <span className="inline-flex bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ✨ Nuevo
                    </span>
                  )}
                  {product.comparePrice &&
                    product.comparePrice > product.price && (
                      <span className="inline-flex bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        -
                        {Math.round(
                          ((product.comparePrice - product.price) /
                            product.comparePrice) *
                            100
                        )}
                        %
                      </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className={`absolute top-4 right-4 p-3 rounded-full shadow-md hover:shadow-lg transition-shadow ${
                    inWishlist
                      ? 'bg-red-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200'
                  }`}
                  title={
                    inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'
                  }
                >
                  {wishlistLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart
                      className={`h-5 w-5 ${
                        inWishlist ? 'fill-current' : ''
                      }`}
                    />
                  )}
                </button>
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                        idx === selectedImageIndex
                          ? 'border-blue-600'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${product.name} ${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PRODUCT INFO */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 text-balance">
                  {product.name}
                </h1>
                {product.shortDescription && (
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    {product.shortDescription}
                  </p>
                )}
              </div>

              {/* Rating */}
              {averageRating > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {averageRating.toFixed(1)} ({product.rating?.count || 0}{' '}
                    reseñas)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(product.price)}
                  </span>
                  {product.comparePrice &&
                    product.comparePrice > product.price && (
                      <span className="text-xl text-gray-500 line-through">
                        {formatPrice(product.comparePrice)}
                      </span>
                    )}
                </div>
                {product.comparePrice &&
                  product.comparePrice > product.price && (
                    <p className="text-sm text-green-600 font-semibold">
                      Ahorras{' '}
                      {formatPrice(product.comparePrice - product.price)}
                    </p>
                  )}
              </div>

              {/* Availability */}
              <div
                className={`p-4 rounded-xl ${
                  availabilityStatus === 'available'
                    ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : availabilityStatus === 'low_stock'
                    ? 'bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
                    : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }`}
              >
                <p
                  className={`font-semibold ${
                    availabilityStatus === 'available'
                      ? 'text-green-700 dark:text-green-400'
                      : availabilityStatus === 'low_stock'
                      ? 'text-orange-700 dark:text-orange-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}
                >
                  {availabilityText}
                </p>
                {product.trackQuantity && (
                  <p className="text-sm mt-1 opacity-75">
                    {product.stock} unidades disponibles
                  </p>
                )}
              </div>

              {/* Quantity Selector */}
              {isAvailable && !inCart && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Cantidad:
                    </span>
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-16 text-center border-0 focus:outline-none font-semibold bg-transparent dark:text-white"
                        min="1"
                      />
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading || !isAvailable}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cartLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Agregando...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
                        <span>Agregar al Carrito</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Already in Cart */}
              {inCart && (
                <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold">
                    <Check className="h-5 w-5" />
                    <span>Producto en tu carrito ({cartQuantity})</span>
                  </div>
                  <Link to="/carrito">
                    <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                      Ver Carrito
                    </button>
                  </Link>
                </div>
              )}

              {/* Features */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {isAvailable && (
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">
                      Envío gratis a toda Colombia
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Compra protegida 100%</span>
                </div>
                {isAvailable && (
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Check className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Garantía de 12 meses</span>
                  </div>
                )}
              </div>

              {/* Share */}
              <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-semibold">
                <Share2 className="h-4 w-4" />
                Compartir
              </button>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        {product.description && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Descripción
            </h2>
            <div className="prose prose-sm dark:prose-invert text-gray-700 dark:text-gray-300 max-w-none">
              <p>{product.description}</p>
            </div>
          </div>
        )}

        {/* SPECIFICATIONS */}
        {(product.attributes || product.brand || product.sku) && (
          <ProductSpecs product={product} className="mb-8" />
        )}

        {/* REVIEWS */}
        {product.rating && (
          <ProductReviews
            product={product}
            reviews={product.reviews || []}
            className="mb-8"
          />
        )}

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Productos Relacionados
            </h2>

            {loadingRelated ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-40 mb-3" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((prod) => (
                  <Link key={prod._id} to={`/productos/${prod.slug}`}>
                    <div className="group cursor-pointer">
                      <div className="relative bg-gray-100 dark:bg-slate-700 rounded-xl overflow-hidden aspect-square mb-3 group-hover:shadow-lg transition-shadow">
                        {getPrimaryImage(prod) ? (
                          <img
                            src={getPrimaryImage(prod)}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Eye className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-blue-600">
                        {prod.name}
                      </h3>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                        {formatPrice(prod.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}