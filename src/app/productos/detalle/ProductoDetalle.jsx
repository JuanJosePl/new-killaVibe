// pages/product-detail-page.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Clock,
  Minus,
  Plus,
  Star,
  Zap,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { ProductCard } from "../../../components/product-card";
import { useCart } from "../../../hooks/use-cart";
import { useAuth } from "../../../src/contexts/AuthContext";
import { useToast } from "../../../hooks/use-toast";
import { productService } from "../../../src/services/productService";
import { formatPrice } from "../../../lib/utils";
import { useScrollToTop } from "../../../hooks/use-scroll-to-top";
import { PageLayout } from "../../../components/page-layout";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const { addItem, toggleWishlist, isInWishlist } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useScrollToTop();

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Fetch main product
        const productResponse = await productService.getProductBySlug(id);
        if (productResponse.success) {
          const productData = productResponse.data;
          setProduct(productData);

          // Fetch related products
          const relatedResponse = await productService.getRelatedProducts(
            productData._id, 
            productData.categories?.[0]?._id
          );
          if (relatedResponse.success) {
            setRelatedProducts(relatedResponse.data.slice(0, 4));
          }
        } else {
          setError("Producto no encontrado");
        }
      } catch (err) {
        setError("Error al cargar el producto");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar productos al carrito.",
        type: "warning",
      });
      return;
    }

    try {
      for (let i = 0; i < quantity; i++) {
        await addItem(product, 1);
      }

      toast({
        title: "¡Producto agregado!",
        description: `${product.name} se agregó al carrito.`,
        type: "success",
      });
    } catch (error) {
      // Error handling is done in the useCart hook
    }
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar productos a favoritos.",
        type: "warning",
      });
      return;
    }

    toggleWishlist({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      slug: product.slug,
    });

    toast({
      title: isInWishlist(product._id)
        ? "Eliminado de favoritos"
        : "Agregado a favoritos",
      description: isInWishlist(product._id)
        ? `${product.name} se eliminó de tu lista de deseos.`
        : `${product.name} se agregó a tu lista de deseos.`,
      type: "success",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado",
        description: "El enlace del producto se copió al portapapeles.",
        type: "success",
      });
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            {/* Breadcrumb skeleton */}
            <div className="flex space-x-2">
              <div className="h-4 w-20 bg-muted rounded"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
              <div className="h-4 w-32 bg-muted rounded"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Image skeleton */}
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-2xl"></div>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-muted rounded-md"></div>
                  ))}
                </div>
              </div>

              {/* Info skeleton */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                </div>
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-12 bg-muted rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !product) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-8xl mb-6">😕</div>
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <p className="text-muted-foreground mb-6">
            El producto que buscas no existe o ha sido removido.
          </p>
          <Link to="/productos">
            <Button className="btn-primary">Volver a productos</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const isAvailable =
    product.status === "active" &&
    product.isPublished &&
    (product.stock > 0 || product.allowBackorder);

  const images = product.images || [];
  const mainImage = images[selectedImage] || images[0];
  const discountPercentage = product.comparePrice && product.comparePrice > product.price 
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Mejorado */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link to="/productos" className="hover:text-primary transition-colors">
            Productos
          </Link>
          {product.categories?.[0] && (
            <>
              <span>/</span>
              <Link 
                to={`/categorias/${product.categories[0].slug || product.categories[0]._id}`}
                className="hover:text-primary transition-colors"
              >
                {product.categories[0].name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground truncate max-w-xs font-medium">
            {product.name}
          </span>
        </div>

        {/* Back Button */}
        <Link
          to="/productos"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Volver a productos
        </Link>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images Mejorado */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted relative group">
              <img
                src={mainImage?.url || "/placeholder-product.jpg"}
                alt={mainImage?.altText || product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Badges Mejorados */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {discountPercentage > 0 && (
                  <Badge className="bg-red-500 text-white border-0 text-sm font-bold py-1 px-3">
                    -{discountPercentage}%
                  </Badge>
                )}
                {product.isFeatured && (
                  <Badge className="bg-primary text-white border-0 text-sm font-bold py-1 px-3">
                    <Star className="h-3 w-3 mr-1" />
                    Destacado
                  </Badge>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                  <Badge className="bg-orange-500 text-white border-0 text-sm font-bold py-1 px-3">
                    ¡Últimas {product.stock} unidades!
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnails Mejorados */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === index
                        ? "border-primary scale-105 shadow-lg"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={image.url || "/placeholder-product.jpg"}
                      alt={image.altText || `${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Mejorado */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {product.brand && (
                  <Badge variant="outline" className="text-sm">
                    {product.brand}
                  </Badge>
                )}
                <Badge variant={product.status === "active" ? "default" : "secondary"}>
                  {product.status === "active" ? "Disponible" : "No disponible"}
                </Badge>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-balance leading-tight">
                {product.name}
              </h1>

              <p className="text-lg text-muted-foreground text-pretty mb-4 leading-relaxed">
                {product.shortDescription || product.description}
              </p>
            </div>

            {/* Price Section Mejorado */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <>
                    <span className="text-xl line-through text-muted-foreground">
                      {formatPrice(product.comparePrice)}
                    </span>
                    <Badge className="bg-red-500 text-white border-0 text-sm font-bold">
                      Ahorras {formatPrice(product.comparePrice - product.price)}
                    </Badge>
                  </>
                )}
              </div>
              
              {/* Stock Info */}
              {product.stock > 0 ? (
                product.stock <= 10 ? (
                  <p className="text-sm text-orange-500 font-medium">
                    <Zap className="h-4 w-4 inline mr-1" />
                    ¡Solo {product.stock} disponibles en stock!
                  </p>
                ) : (
                  <p className="text-sm text-green-500 font-medium">
                    ✓ En stock - Listo para enviar
                  </p>
                )
              ) : (
                <p className="text-sm text-red-500 font-medium">
                  ✗ Producto agotado
                </p>
              )}
            </div>

            {/* Quantity and Actions Mejorado */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Cantidad:</label>
                <div className="flex items-center border-2 border-border rounded-xl overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || !isAvailable}
                    className="h-12 w-12 rounded-none hover:bg-muted"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-6 py-3 min-w-[80px] text-center font-bold text-lg border-x border-border">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!isAvailable || (product.stock > 0 && quantity >= product.stock)}
                    className="h-12 w-12 rounded-none hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!isAvailable || !isAuthenticated}
                  className="flex-1 btn-primary py-4 text-base font-semibold"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {!isAuthenticated
                    ? "Inicia sesión para comprar"
                    : !isAvailable
                    ? "Producto agotado"
                    : `Agregar al carrito - ${formatPrice(product.price * quantity)}`}
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="py-4 px-4"
                    onClick={handleWishlist}
                    disabled={!isAuthenticated}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isInWishlist(product._id)
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="py-4 px-4"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Features Mejoradas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <Truck className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Envío Gratis</p>
                  <p className="text-xs text-muted-foreground">Barranquilla y Soledad</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Garantía</p>
                  <p className="text-xs text-muted-foreground">12 meses incluida</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <Clock className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Soporte 24/7</p>
                  <p className="text-xs text-muted-foreground">Atención garantizada</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section Mejorada */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-12">
          {/* Tabs Header */}
          <div className="border-b border-border">
            <div className="flex space-x-8 px-8">
              {[
                { id: 'description', label: 'Descripción' },
                { id: 'features', label: 'Características' },
                { id: 'specifications', label: 'Especificaciones' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs Content */}
          <div className="p-8">
            {activeTab === 'description' && (
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {product.description}
                </p>
                {product.longDescription && (
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    {product.longDescription}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'features' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.attributes && Object.entries(product.attributes).map(([key, values]) => (
                  values.length > 0 && (
                    <div key={key} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                      <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-semibold capitalize">{key}</p>
                        <p className="text-sm text-muted-foreground">
                          {Array.isArray(values) ? values.join(', ') : values}
                        </p>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Especificaciones técnicas detalladas del producto.
                </p>
                {/* Aquí puedes agregar más especificaciones específicas */}
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold">
                Productos Relacionados
              </h2>
              <Link 
                to={`/categorias/${product.categories?.[0]?.slug || product.categories?.[0]?._id}`}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard
                  key={relatedProduct._id}
                  product={relatedProduct}
                  className="animate-slide-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Additional Call to Action */}
        <div className="text-center p-8 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-border/50">
          <h3 className="text-2xl font-bold mb-4">¿Tienes dudas sobre este producto?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Nuestro equipo de soporte está listo para ayudarte con cualquier pregunta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/message/O4FKBMAABGC5L1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all duration-300"
            >
              💬 Consultar por WhatsApp
            </a>
            <Link to="/productos">
              <Button variant="outline" className="px-6 py-3">
                Seguir Explorando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}