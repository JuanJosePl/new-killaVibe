import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useProducts } from "../../src/hooks/useProducts";
import { useCart } from "../../hooks/use-cart";
import { useAuth } from "../../src/contexts/AuthContext";
import { useToast } from "../../hooks/use-toast";
import { cartService } from "../../src/services/cartService";
import { formatPrice, calculateDiscountPercentage } from "../../lib/utils";
import {
  ShoppingCart,
  Heart,
  Eye,
  Star,
  Zap,
  Truck,
  Shield,
  Filter,
  Grid,
  List,
  Search,
  SortAsc,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const [filters, setFilters] = useState({
    category,
    search,
    page: 1,
    limit: 12,
    sort: "newest",
  });

  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  const { products, loading, error, pagination } = useProducts(filters);
  const { addItem, isInWishlist, toggleWishlist } = useCart();
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category,
      search,
    }));
  }, [category, search]);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar productos al carrito.",
        type: "warning",
      });
      return;
    }

    try {
      await cartService.addToCart(
        {
          productId: product._id,
          quantity: 1,
        },
        token
      );

      addItem({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0]?.url,
        slug: product.slug,
      });

      toast({
        title: "🎉 ¡Agregado!",
        description: `${product.name} se agregó al carrito.`,
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito.",
        type: "error",
      });
    }
  };

  const handleWishlist = (product) => {
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
      image: product.images[0]?.url,
      slug: product.slug,
    });

    toast({
      title: isInWishlist(product._id) ? "❤️ Removido" : "💖 Agregado",
      description: isInWishlist(product._id)
        ? `${product.name} se eliminó de favoritos.`
        : `${product.name} se agregó a favoritos.`,
      type: "success",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gradient-to-br from-muted to-muted/50 rounded-2xl h-64 mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-12 bg-muted rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Error al cargar productos
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <span className="text-3xl">🛍️</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {search ? `"${search}"` : "Nuestros Productos"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {search
              ? `Encontramos ${products.length} producto${
                  products.length !== 1 ? "s" : ""
                } para ti`
              : "Descubre nuestra colección exclusiva de productos tecnológicos"}
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>

            <div className="flex items-center gap-2 bg-background rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex items-center gap-2"
              >
                <Grid className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                Lista
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={filters.sort}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sort: e.target.value }))
              }
              className="bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="newest">Más recientes</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
              <option value="name">Nombre A-Z</option>
              <option value="featured">Destacados</option>
            </select>
          </div>
        </div>

        {/* Products Grid/List */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              No se encontraron productos
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {search
                ? "No encontramos productos que coincidan con tu búsqueda. Intenta con otros términos."
                : "Pronto agregaremos más productos a nuestra colección."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/productos">
                <Button className="btn-primary">Ver Todos los Productos</Button>
              </Link>
              <Link to="/categorias">
                <Button variant="outline">Explorar Categorías</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced Products Display */}
            <div
              className={`
              ${
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  : "space-y-6"
              }
            `}
            >
              {products.map((product, index) => {
                const discountPercentage = calculateDiscountPercentage(
                  product.comparePrice,
                  product.price
                );
                const isNew =
                  product.createdAt &&
                  Date.now() - new Date(product.createdAt).getTime() <
                    7 * 24 * 60 * 60 * 1000;
                const isLowStock = product.stock > 0 && product.stock <= 5;
                const averageRating = product.ratings?.length
                  ? (
                      product.ratings.reduce(
                        (acc, rating) => acc + rating.rating,
                        0
                      ) / product.ratings.length
                    ).toFixed(1)
                  : null;

                return (
                  <div
                    key={product._id}
                    className={`
                      group bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl 
                      border-2 border-border/50 hover:border-primary/30 transition-all duration-500
                      hover:shadow-2xl hover:scale-105 overflow-hidden
                      ${viewMode === "list" ? "flex" : ""}
                      animate-slide-in-up
                    `}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Product Image */}
                    <div
                      className={`relative overflow-hidden ${
                        viewMode === "list"
                          ? "w-48 flex-shrink-0"
                          : "aspect-square"
                      }`}
                    >
                      <Link to={`/productos/${product.slug}`}>
                        <img
                          src={
                            product.images[0]?.url || "/placeholder-product.jpg"
                          }
                          alt={product.images[0]?.altText || product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </Link>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col space-y-2">
                        {discountPercentage > 0 && (
                          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 font-bold text-sm py-1 px-3 shadow-lg">
                            -{discountPercentage}%
                          </Badge>
                        )}
                        {product.isFeatured && (
                          <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white border-0 font-bold text-sm py-1 px-3 shadow-lg">
                            <Star className="h-3 w-3 mr-1" />
                            Destacado
                          </Badge>
                        )}
                        {isNew && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 font-bold text-sm py-1 px-3 shadow-lg">
                            NUEVO
                          </Badge>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <Button
                        size="icon"
                        variant="secondary"
                        className={`
                          absolute top-3 right-3 h-9 w-9 rounded-full backdrop-blur-sm border-0 shadow-lg 
                          transition-all duration-300
                          ${
                            isInWishlist(product._id)
                              ? "bg-red-500 text-white hover:bg-red-600 scale-110"
                              : "bg-white/90 text-gray-700 hover:bg-white hover:scale-110"
                          }
                        `}
                        onClick={() => handleWishlist(product)}
                        title={
                          isInWishlist(product._id)
                            ? "Quitar de favoritos"
                            : "Agregar a favoritos"
                        }
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isInWishlist(product._id) ? "fill-current" : ""
                          }`}
                        />
                      </Button>

                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Link to={`/productos/${product.slug}`}>
                          <Button className="bg-white text-foreground hover:bg-white/90">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div
                      className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}
                    >
                      <div className="space-y-3">
                        {/* Category */}
                        {product.category && (
                          <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                            {product.category}
                          </div>
                        )}

                        {/* Title */}
                        <Link to={`/productos/${product.slug}`}>
                          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {product.shortDescription || product.description}
                        </p>

                        {/* Rating */}
                        {averageRating && (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= Math.round(averageRating)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              ({averageRating})
                            </span>
                          </div>
                        )}

                        {/* Price Section */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-baseline space-x-2">
                              <span className="text-2xl font-bold text-primary">
                                {formatPrice(product.price)}
                              </span>
                              {product.comparePrice &&
                                product.comparePrice > product.price && (
                                  <span className="text-sm line-through text-muted-foreground">
                                    {formatPrice(product.comparePrice)}
                                  </span>
                                )}
                            </div>

                            {/* Stock Status */}
                            {isLowStock && (
                              <Badge
                                variant="outline"
                                className="text-orange-500 border-orange-200 text-xs"
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                Últimas {product.stock}
                              </Badge>
                            )}
                          </div>

                          {/* Savings */}
                          {discountPercentage > 0 && (
                            <div className="text-xs text-green-600 font-semibold">
                              Ahorras{" "}
                              {formatPrice(
                                product.comparePrice - product.price
                              )}
                            </div>
                          )}
                        </div>

                        {/* Features Icons */}
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Truck className="h-4 w-4" />
                              <span>Envío gratis</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Shield className="h-4 w-4" />
                              <span>Garantía</span>
                            </div>
                          </div>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={
                            !product.stock ||
                            product.stock <= 0 ||
                            !isAuthenticated
                          }
                          className={`
                            w-full py-3 font-semibold transition-all duration-300 mt-4
                            ${
                              !product.stock || product.stock <= 0
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "btn-primary hover:scale-105"
                            }
                          `}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {!isAuthenticated
                            ? "Iniciar sesión"
                            : !product.stock
                            ? "Agotado"
                            : "Agregar al Carrito"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Enhanced Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50">
                <div className="text-sm text-muted-foreground">
                  Mostrando {(filters.page - 1) * filters.limit + 1} -{" "}
                  {Math.min(filters.page * filters.limit, pagination.total)} de{" "}
                  {pagination.total} productos
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                    }
                    disabled={pagination.current === 1}
                    className="px-6 py-2 border-2 border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Anterior
                  </Button>

                  <div className="flex items-center space-x-2">
                    {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pagination.current === pageNum
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, page: pageNum }))
                          }
                          className="w-10 h-10 rounded-lg"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                    }
                    disabled={pagination.current === pagination.pages}
                    className="px-6 py-2 border-2 border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
