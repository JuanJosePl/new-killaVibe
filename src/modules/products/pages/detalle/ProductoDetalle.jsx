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
 * Versión corregida con validaciones de seguridad para evitar datos Undefined/NaN
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
  // COMPUTED VALUES (CON VALIDACIÓN DE SEGURIDAD)
  // ==========================================================================
  const inWishlist = product?._id ? isProductInWishlist(product._id) : false;
  const inCart = product?._id ? isProductInCart(product._id) : false;
  const cartQuantity = product?._id ? getProductQuantity(product._id) : 0;

  const primaryImage = product ? getPrimaryImage(product) : null;
  const availabilityStatus = product ? getAvailabilityStatus(product) : null;
  const availabilityText = availabilityStatus ? getAvailabilityText(availabilityStatus) : '';
  const averageRating = product ? getAverageRating(product) : 0;
  const isAvailable = product ? isProductAvailable(product) : false;
  const isLow = product ? isLowStock(product) : false;
  const isNew = product ? isNewProduct(product) : false;

  // ==========================================================================
  // FETCH PRODUCTO
  // ==========================================================================
  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productsAPI.getProductBySlug(slug);

        if (response.success && response.data) {
          const prod = response.data;
          if (!prod._id) throw new Error('Datos de producto incompletos');
          
          setProduct(prod);
          fetchRelated(prod._id);
        } else {
          setError(response.message || 'Producto no encontrado');
        }
      } catch (err) {
        console.error('[ProductoDetalle] Error:', err);
        setError(err.message || 'Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const fetchRelated = async (productId) => {
    try {
      setLoadingRelated(true);
      const response = await productsAPI.getRelatedProducts(productId, 4);
      if (response.success) setRelatedProducts(response.data || []);
    } catch (err) {
      console.error('[ProductoDetalle] Error fetching related:', err);
    } finally {
      setLoadingRelated(false);
    }
  };

  // ==========================================================================
  // HANDLERS CORREGIDOS
  // ==========================================================================
  const handleToggleWishlist = useCallback(async () => {
    if (!product?._id) return;
    await toggleProductWishlist(product);
  }, [product, toggleProductWishlist]);

  const handleAddToCart = useCallback(async () => {
    // 🛡️ 1. Validación de existencia del producto
    if (!product || !product._id) {
      toast.error("Error: Información del producto no disponible");
      return;
    }

    try {
      // 🛡️ 2. Verificación de stock real
      if (product.trackQuantity && (product.stock <= 0 || !product.stock)) {
        toast.error("Este producto se encuentra agotado");
        return;
      }

      if (inCart) {
        // Si ya está en el carrito, usamos la función de incremento
        // Pasamos el producto completo para que el Context tenga todos los datos
        await incrementQuantity(product);
        toast.success("Cantidad actualizada en el carrito");
      } else {
        // 🛡️ 3. Agregado limpio: Enviamos producto, cantidad y un objeto de atributos vacío
        // para evitar que en el carrito se reciban propiedades undefined
        await addProductToCart(product, quantity, {});
        toast.success("Producto añadido al carrito");
      }
    } catch (error) {
      console.error("Error al manejar el carrito:", error);
      // El error de "Debe iniciar sesión" suele venir del interceptor de la API o del Hook
    }
  }, [product, inCart, quantity, addProductToCart, incrementQuantity]);

  const handleQuantityChange = useCallback(
    (newQty) => {
      const stockAvailable = product?.stock ?? 0;
      if (newQty < 1) return;
      if (product?.trackQuantity && newQty > stockAvailable) {
        setQuantity(stockAvailable);
        toast.warning(`Solo hay ${stockAvailable} unidades disponibles`);
        return;
      }
      setQuantity(newQty);
    },
    [product]
  );

  // ==========================================================================
  // RENDERS (LOADING / ERROR / SUCCESS)
  // ==========================================================================
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold mb-4">Lo sentimos, producto no encontrado</h1>
          <Link to="/productos" className="text-blue-600 hover:underline">Volver a la tienda</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/productos" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-semibold">
          <ArrowLeft className="h-4 w-4" /> Volver a productos
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 lg:p-10">
            {/* GALERÍA */}
            <div className="space-y-4">
              <div className="relative bg-gray-100 dark:bg-slate-700 rounded-2xl overflow-hidden aspect-square group">
                {primaryImage ? (
                  <img src={primaryImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><Eye className="h-16 w-16" /></div>
                )}
                
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className={`absolute top-4 right-4 p-3 rounded-full shadow-md ${inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-700'}`}
                >
                  {wishlistLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />}
                </button>
              </div>
            </div>

            {/* INFORMACIÓN */}
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
              
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                {product.comparePrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">{formatPrice(product.comparePrice)}</span>
                )}
              </div>

              <div className={`p-4 rounded-xl border ${isAvailable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`font-semibold ${isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                  {availabilityText} {product.trackQuantity && `(${product.stock} disponibles)`}
                </p>
              </div>

              {isAvailable && !inCart && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">Cantidad:</span>
                    <div className="flex items-center border rounded-lg">
                      <button onClick={() => handleQuantityChange(quantity - 1)} className="p-2 hover:bg-gray-100"><Minus className="h-4 w-4" /></button>
                      <input type="number" value={quantity} readOnly className="w-12 text-center bg-transparent" />
                      <button onClick={() => handleQuantityChange(quantity + 1)} className="p-2 hover:bg-gray-100"><Plus className="h-4 w-4" /></button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {cartLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
                    <span>{cartLoading ? 'Agregando...' : 'Agregar al Carrito'}</span>
                  </button>
                </div>
              )}

              {inCart && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 text-blue-700 font-semibold flex flex-col gap-3">
                  <div className="flex items-center gap-2"><Check /> Producto en carrito ({cartQuantity})</div>
                  <Link to="/carrito" className="w-full py-3 bg-blue-600 text-white text-center rounded-lg">Ver Carrito</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECCIONES ADICIONALES */}
        {product.description && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 mb-8 border">
            <h2 className="text-2xl font-bold mb-4">Descripción</h2>
            <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
          </div>
        )}

        <ProductSpecs product={product} className="mb-8" />
        
        {relatedProducts.length > 0 && (
          <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border">
            <h2 className="text-2xl font-bold mb-6">Productos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(prod => (
                <Link key={prod._id} to={`/productos/${prod.slug}`} className="group">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2">
                    <img src={getPrimaryImage(prod)} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h3 className="text-sm font-semibold line-clamp-1">{prod.name}</h3>
                  <p className="font-bold">{formatPrice(prod.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}