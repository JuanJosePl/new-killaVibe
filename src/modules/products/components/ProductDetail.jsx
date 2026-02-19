import { useState } from "react";
import {
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Package,
  Eye,
  TrendingUp,
  Star,
  Sparkles,
  AlertCircle,
  Check,
  Zap,
  ShoppingCart,
} from "lucide-react";
import { Link } from "react-router-dom";

// ✅ MIGRADO: Bridges de integración del módulo Products
import { useProductCart } from "@/modules/products/integration/useProductCart";
import { useProductWishlist } from "@/modules/products/integration/useProductWishlist";

// ✅ MIGRADO: useProductStock desde hooks (no desde useProductDetails)
import {
  useProductsRepository,
  useProductStock,
} from "@/modules/products";

// ✅ MIGRADO: Funciones de dominio puras
import {
  formatCOP,
  canPurchase,
  isLowStock,
  getAvailabilityStatus,
  AVAILABILITY_STATUS,
  AVAILABILITY_MESSAGES,
  AVAILABILITY_CLASSES,
} from "@/modules/products";

// Componentes especializados (sin cambios de migración en ellos)
import { ProductGallery } from "./ProductGallery";
import { ProductRating } from "./ProductRating";
import { ProductSpecs, ProductFeatures } from "./ProductSpecs";
import { ProductReviews } from "./ProductReviews";

/**
 * @component ProductDetail
 *
 * CAMBIOS DE MIGRACIÓN:
 * - useProductCart / useProductWishlist → integration bridges (misma interfaz)
 * - useProductStock import: "../hooks/useProductDetails" → @/modules/products
 *   y ahora recibe `repository` como primer argumento
 * - formatPrice(x) → formatCOP(x)
 * - isProductAvailable(product) → canPurchase(product)
 * - isLowStock(product) → isLowStock(product)  [mismo nombre, nueva ubicación]
 * - getAvailabilityText() → AVAILABILITY_MESSAGES[status]  [constante del dominio]
 * - getAvailabilityStatus() → getAvailabilityStatus()  [mismo nombre]
 * - stockBadge.text / availabilityText (campos del backend DTO) →
 *     calculados localmente vía domain si no vienen en el producto
 * - RelatedProducts eliminado del interior: ya viene desde ProductoDetalle.jsx
 */
export function ProductDetail({ product }) {
  const [quantity, setQuantity] = useState(1);

  const repo = useProductsRepository();

  // ✅ Bridges de integración
  const {
    isProductInCart,
    getProductQuantity,
    addProductToCart,
    loading: cartLoading,
  } = useProductCart();

  const {
    isProductInWishlist,
    toggleProductWishlist,
    loading: wishlistLoading,
  } = useProductWishlist();

  // ✅ Stock hook — recibe repo y productId
  const { checkStock, isChecking: checkingStock } = useProductStock(
    repo,
    product?._id
  );

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Producto no encontrado
        </h2>
        <Link to="/productos" className="text-primary hover:underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  // ✅ Extracción de datos del producto (entidad canónica)
  const {
    _id,
    name,
    slug,
    description,
    shortDescription,
    sku,
    price,
    comparePrice,
    images,
    categories,
    mainCategory,
    breadcrumb,
    stock,
    rating,
    brand,
    tags,
    attributes,
    variants,
    seo,
    isFeatured,
    views,
    salesCount,
    createdAt,
    // Campos computados del backend DTO (pueden venir o no)
    hasDiscount: hasDiscountDTO,
    hasRating: hasRatingDTO,
    hasVariants: hasVariantsDTO,
    stockBadge,
    availabilityText: availabilityTextDTO,
  } = product;

  // ✅ Calcular desde dominio si el backend no los provee
  const available = canPurchase(product);
  const lowStock = isLowStock(product);
  const availabilityStatus = getAvailabilityStatus(product);

  // hasDiscount: preferir DTO del backend, fallback a dominio
  const hasDiscountLocal = comparePrice != null && comparePrice > price;
  const hasDiscountFinal = hasDiscountDTO ?? hasDiscountLocal;

  // hasRating: preferir DTO del backend, fallback
  const hasRatingFinal = hasRatingDTO ?? (rating?.count > 0);

  // availabilityText: preferir DTO del backend, fallback a constante del dominio
  const availabilityText =
    availabilityTextDTO ?? AVAILABILITY_MESSAGES[availabilityStatus];

  // stockBadge.text: preferir DTO, fallback
  const stockBadgeText = stockBadge?.text ?? availabilityText;

  // Carrito
  const inCart = isProductInCart(_id);
  const quantityInCart = getProductQuantity(_id);
  const inWishlist = isProductInWishlist(_id);

  // Handlers
  const handleAddToCart = async () => {
    if (available) await addProductToCart(product, quantity);
  };

  const handleToggleWishlist = async () => {
    await toggleProductWishlist(product);
  };

  const handleQuantityChange = (newQuantity) => {
    const max = stock ?? Infinity;
    if (newQuantity >= 1 && newQuantity <= max) setQuantity(newQuantity);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: shortDescription ?? description?.substring(0, 100) ?? "",
          url: window.location.href,
        });
      } catch {
        /* usuario canceló */
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado al portapapeles");
    }
  };

  // ✅ primaryImage: extraído del array de imágenes canónico
  const primaryImage = images?.find((img) => img.isPrimary) ?? images?.[0] ?? null;

  return (
    <div className="bg-gray-50">
      {/* Breadcrumb del backend */}
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-gray-600 hover:text-primary">
                Inicio
              </Link>
              {breadcrumb.map((crumb, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Link to={crumb.url} className="text-gray-600 hover:text-primary">
                    {crumb.name}
                  </Link>
                </div>
              ))}
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 font-medium">{name}</span>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Galería */}
          <ProductGallery images={images} primaryImage={primaryImage} name={name} />

          {/* Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {isFeatured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-primary to-purple-600 text-white">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Destacado
                </span>
              )}
              {salesCount > 10 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {salesCount}+ vendidos
                </span>
              )}
              {views > 100 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <Eye className="h-3 w-3 mr-1" />
                  {views} vistas
                </span>
              )}
            </div>

            {/* Marca */}
            {brand && (
              <div className="flex items-center space-x-2 text-sm">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-gray-600">Marca:</span>
                <span className="font-semibold text-gray-900">{brand}</span>
              </div>
            )}

            {/* Título */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {name}
              </h1>
              {shortDescription && (
                <p className="text-gray-600 text-lg">{shortDescription}</p>
              )}
            </div>

            {/* Rating */}
            {hasRatingFinal && (
              <ProductRating
                average={rating.average}
                count={rating.count}
                distribution={rating.distribution}
              />
            )}

            {/* SKU */}
            <div className="text-sm text-gray-600">
              <span className="font-medium">SKU:</span> {sku}
            </div>

            {/* Precios */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-baseline space-x-4 mb-2">
                {/* ✅ formatPrice → formatCOP */}
                <span className="text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {formatCOP(price)}
                </span>
                {comparePrice > price && (
                  <span className="text-xl line-through text-gray-400">
                    {formatCOP(comparePrice)}
                  </span>
                )}
              </div>
              {hasDiscountFinal && (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-bold">
                    <Zap className="h-4 w-4 mr-1" />
                    {/* ✅ discount viene del DTO; si no, calcularlo */}
                    -{product.discount ?? Math.round((1 - price / comparePrice) * 100)}% OFF
                  </span>
                  <span className="text-green-600 font-semibold">
                    Ahorras {formatCOP(comparePrice - price)}
                  </span>
                </div>
              )}
            </div>

            {/* Estado de stock */}
            <div className="bg-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">
                  Disponibilidad:
                </span>
                <span
                  className={`font-bold ${
                    available ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stockBadgeText}
                </span>
              </div>
              <p className="text-sm text-gray-600">{availabilityText}</p>
            </div>

            {/* Selector de cantidad + CTAs */}
            {available && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Cantidad
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border-2 border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(parseInt(e.target.value) || 1)
                        }
                        min="1"
                        max={stock ?? undefined}
                        className="w-16 text-center border-0 focus:outline-none font-semibold"
                      />
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={stock != null && quantity >= stock}
                        className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        +
                      </button>
                    </div>
                    {stock != null && (
                      <span className="text-sm text-gray-600">
                        {stock} disponibles
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading || !available}
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {inCart ? (
                      <>
                        <Check className="h-5 w-5" />
                        <span>En carrito ({quantityInCart})</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
                        <span>
                          {cartLoading ? "Agregando..." : "Agregar al carrito"}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    className={`px-6 py-4 rounded-xl border-2 transition-all duration-300 ${
                      inWishlist
                        ? "bg-red-50 border-red-500 text-red-600"
                        : "border-gray-300 text-gray-700 hover:border-primary"
                    }`}
                  >
                    <Heart className={`h-6 w-6 ${inWishlist ? "fill-current" : ""}`} />
                  </button>

                  <button
                    onClick={handleShare}
                    className="px-6 py-4 rounded-xl border-2 border-gray-300 text-gray-700 hover:border-primary transition-colors"
                  >
                    <Share2 className="h-6 w-6" />
                  </button>
                </div>
              </div>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Etiquetas:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Garantías */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {[
                { Icon: Truck, color: "blue", title: "Envío Gratis", sub: "En compras +$100.000" },
                { Icon: Shield, color: "green", title: "Garantía", sub: "12 meses" },
                { Icon: RotateCcw, color: "purple", title: "Devolución", sub: "30 días" },
              ].map(({ Icon, color, title, sub }) => (
                <div key={title} className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{title}</p>
                    <p className="text-xs text-gray-600">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secciones de detalle */}
        <div className="space-y-8">
          {/* Descripción */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Descripción</h3>
            </div>
            <div className="p-6">
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          </div>

          <ProductSpecs product={product} />
          <ProductFeatures product={product} />
          <ProductReviews product={product} />
        </div>

        {/* Nota: RelatedProducts se renderiza en ProductoDetalle.jsx (page) */}
      </div>
    </div>
  );
}