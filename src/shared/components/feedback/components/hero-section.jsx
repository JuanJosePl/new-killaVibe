// src/shared/components/sections/HeroSection.jsx
import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Truck,
  Shield,
  Clock,
  ArrowRight,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Award,
  Package,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ============================================================================
// HOOKS Y APIS DEL PROYECTO
// ============================================================================
import { productsAPI } from '../../../../modules/products/api/products.api';
import { formatPrice } from '../../../../modules/products/utils/priceHelpers';
import { getPrimaryImage } from '../../../../modules/products/utils/productHelpers';

/**
 * @component HeroSection
 * @description Sección hero principal con carrusel de productos destacados
 * 
 * INTEGRACIÃN:
 * ✅ productsAPI.getProducts() con filtro featured
 * ✅ formatPrice() para precios
 * ✅ getPrimaryImage() para imágenes
 * ✅ React Router Link
 * ✅ Carrusel automático
 * ✅ Animaciones y parallax
 * ✅ Responsive design
 */
export function HeroSection() {
  // ==========================================================================
  // ESTADO
  // ==========================================================================
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);

  // ==========================================================================
  // SCROLL PARALLAX EFFECT
  // ==========================================================================
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ==========================================================================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // ==========================================================================
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

// ============================================================================
// FETCH FEATURED PRODUCTS - ✅ CORREGIDO
// ============================================================================

useEffect(() => {
  let isMounted = true;
  const controller = new AbortController();

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ CORRECCIÓN: Usar getFeaturedProducts() directamente
      const response = await productsAPI.getFeaturedProducts(4);

      if (!isMounted) return;

      // ✅ CORRECCIÓN: Manejar respuesta correctamente
      if (response.success && response.data) {
        setFeaturedProducts(response.data.slice(0, 4));
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback si viene array directo
        setFeaturedProducts(response.data.slice(0, 4));
      } else {
        throw new Error('No se encontraron productos destacados');
      }

    } catch (err) {
      // ✅ Ignorar si fue abort
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        return;
      }

      console.error('[HeroSection] Error fetching featured products:', err);
      
      if (isMounted) {
        setError(err.message || 'Error al cargar productos destacados');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  fetchFeaturedProducts();

  return () => {
    isMounted = false;
    controller.abort();
  };
}, []); // ✅ Sin dependencias, solo se ejecuta una vez

  // ==========================================================================
  // AUTO-SLIDE CAROUSEL
  // ==========================================================================
  
  useEffect(() => {
    if (featuredProducts.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  // ==========================================================================
  // CAROUSEL CONTROLS
  // ==========================================================================
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // ==========================================================================
  // PARALLAX TRANSFORMATIONS
  // ==========================================================================
  
  const logoTransform = `translateY(${scrollY * 0.15}px) rotate(${
    scrollY * 0.05
  }deg)`;
  const contentTransform = `translateY(${scrollY * 0.1}px)`;
  const backgroundTransform = `translateY(${scrollY * 0.3}px)`;

  // ==========================================================================
  // RENDER: LOADING
  // ==========================================================================
  
  if (loading) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-[90vh] flex items-center justify-center">
        <div className="space-y-6 text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping" />
            <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-3">
            <div className="h-8 w-64 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-full mx-auto animate-pulse" />
            <div
              className="h-4 w-96 max-w-full bg-gradient-to-r from-muted via-muted/50 to-muted rounded-full mx-auto animate-pulse"
              style={{ animationDelay: '0.2s' }}
            />
          </div>
        </div>
      </section>
    );
  }

  // ==========================================================================
  // RENDER: ERROR (fallback gracioso si no hay productos)
  // ==========================================================================
  
  if (error && featuredProducts.length === 0) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-[90vh] flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <div className="text-6xl mb-4">🎵</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            ¡Pronto tendremos productos destacados!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Estamos preparando las mejores ofertas para ti
          </p>
          <Link to="/productos">
            <button className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              Ver Todos los Productos
              <ArrowRight className="inline-block ml-2 h-5 w-5" />
            </button>
          </Link>
        </div>
      </section>
    );
  }

  // ==========================================================================
  // RENDER: SUCCESS
  // ==========================================================================
  
  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-[90vh] transition-colors duration-300"
    >
      {/* Animated Background Elements with Parallax */}
      <div
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ transform: backgroundTransform }}
      >
        {/* Floating gradient orbs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-accent/20 to-primary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '4s' }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      <div className="container mx-auto px-4 py-12 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ================================================================ */}
          {/* LEFT CONTENT SECTION */}
          {/* ================================================================ */}
          
          <div
            className={`space-y-8 transition-all duration-1000 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
            style={{ transform: contentTransform }}
          >
            {/* Premium Badge */}
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary/10 to-accent/10 px-5 py-3 rounded-full backdrop-blur-sm border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm font-semibold uppercase tracking-wide bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                KillaVibes Premium
              </span>
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>

            {/* Main Heading with Gradient Text */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                Tecnología que{' '}
                <span className="relative inline-block">
                  <span
                    className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                    style={{ backgroundSize: '200% auto' }}
                  >
                    vibra
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="12"
                    viewBox="0 0 200 12"
                    fill="none"
                  >
                    <path
                      d="M0 6 Q50 0, 100 6 T200 6"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-primary opacity-50"
                    />
                  </svg>
                </span>{' '}
                <br className="hidden sm:block" />
                contigo
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Descubre los mejores productos tecnológicos en{' '}
                <span className="text-primary font-semibold">Barranquilla</span>
                . Audífonos, parlantes, compresores y más con{' '}
                <span className="text-accent font-semibold">envíos gratis</span>{' '}
                y garantía total.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/productos">
                <button className="group relative px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden w-full sm:w-auto">
                  <span className="relative z-10 flex items-center justify-center">
                    Explorar Productos
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </Link>

              <Link to="/ofertas">
                <button className="group px-8 py-4 bg-background border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105 shadow-md hover:shadow-xl w-full sm:w-auto">
                  <span className="flex items-center justify-center">
                    <Tag className="mr-2 h-5 w-5" />
                    Ver Ofertas
                    <Sparkles className="ml-2 h-4 w-4 group-hover:animate-pulse" />
                  </span>
                </button>
              </Link>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {[
                {
                  icon: Truck,
                  title: 'Envío Gratis',
                  desc: 'Barranquilla',
                  color: 'from-blue-500/20 to-blue-600/20',
                  iconColor: 'text-blue-500',
                },
                {
                  icon: Shield,
                  title: '100% Original',
                  desc: 'Garantizado',
                  color: 'from-green-500/20 to-green-600/20',
                  iconColor: 'text-green-500',
                },
                {
                  icon: Clock,
                  title: 'Soporte 24/7',
                  desc: 'Siempre activos',
                  color: 'from-orange-500/20 to-orange-600/20',
                  iconColor: 'text-orange-500',
                },
                {
                  icon: Zap,
                  title: 'Vibra Killa',
                  desc: 'Únete ya',
                  color: 'from-purple-500/20 to-purple-600/20',
                  iconColor: 'text-purple-500',
                },
              ].map((feature, index) => (
                <div
                  key={`feature-${feature.title}-${index}`}
                  className={`group relative flex flex-col items-center text-center space-y-3 p-4 rounded-2xl bg-gradient-to-br ${feature.color} backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer overflow-hidden`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.6s ease-out',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-300" />

                  <div
                    className={`relative h-14 w-14 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center ${feature.iconColor} group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <div className="relative">
                    <span className="text-sm font-bold text-foreground block">
                      {feature.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {feature.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-between p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
              <div className="text-center flex-1">
                <div className="flex items-center justify-center space-x-1">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">500+</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Clientes Felices
                </p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center flex-1">
                <div className="flex items-center justify-center space-x-1">
                  <Package className="h-5 w-5 text-accent" />
                  <span className="text-2xl font-bold text-accent">1000+</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Productos</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center flex-1">
                <div className="flex items-center justify-center space-x-1">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-500">98%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Satisfacción
                </p>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* RIGHT CONTENT - PRODUCT CAROUSEL */}
          {/* ================================================================ */}
          
          <div
            className={`relative transition-all duration-1000 delay-300 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
            style={{ transform: logoTransform }}
          >
            <div className="relative h-[450px] lg:h-[550px] rounded-3xl overflow-hidden shadow-2xl group">
              {/* Carousel Items */}
              {featuredProducts.map((product, index) => {
                const primaryImage = getPrimaryImage(product);
                const discountPercent = product.comparePrice
                  ? Math.round(
                      ((product.comparePrice - product.price) /
                        product.comparePrice) *
                        100
                    )
                  : 0;

                return (
                  <div
                    key={`product-slide-${product._id}-${index}`}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      index === currentSlide
                        ? 'opacity-100 scale-100 z-10'
                        : index < currentSlide
                        ? 'opacity-0 -translate-x-full scale-95 z-0'
                        : 'opacity-0 translate-x-full scale-95 z-0'
                    }`}
                  >
                    <div className="relative h-full">
                      {/* Product Image */}
                      <div className="absolute inset-0 overflow-hidden">
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                        />
                        {/* Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent mix-blend-overlay" />
                      </div>

                      {/* Product Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-white space-y-4">
                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {product.isFeatured && (
                            <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              Destacado
                            </div>
                          )}
                          {discountPercent > 0 && (
                            <div className="bg-red-500 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                              -{discountPercent}% OFF
                            </div>
                          )}
                          {product.mainCategory && (
                            <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold border border-white/30">
                              {product.mainCategory.name}
                            </div>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-2">
                          <h3 className="text-2xl lg:text-3xl font-bold line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-white/90 line-clamp-2">
                            {product.shortDescription || product.description}
                          </p>
                        </div>

                        {/* Price & CTA */}
                        <div className="flex items-end justify-between pt-2">
                          <div className="space-y-1">
                            <div className="text-3xl font-bold">
                              {formatPrice(product.price)}
                            </div>
                            {product.comparePrice > product.price && (
                              <div className="text-sm line-through text-white/60">
                                {formatPrice(product.comparePrice)}
                              </div>
                            )}
                          </div>
                          <Link to={`/productos/${product.slug}`}>
                            <button className="group/btn px-6 py-3 bg-white text-primary rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                              <span className="flex items-center">
                                Ver Detalles
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                              </span>
                            </button>
                          </Link>
                        </div>
                      </div>

                      {/* Corner decoration */}
                      <div className="absolute top-6 right-6 h-16 w-16 border-t-2 border-r-2 border-white/30 rounded-tr-2xl" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Carousel Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 z-20 flex items-center justify-center hover:scale-110 shadow-lg"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 z-20 flex items-center justify-center hover:scale-110 shadow-lg"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Carousel Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
              {featuredProducts.map((product, index) => (
                <button
                  key={`slide-indicator-${product._id}-${index}`}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-white w-10 shadow-lg'
                      : 'bg-white/40 w-2 hover:w-6 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Floating decorative elements */}
            <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-2xl animate-pulse pointer-events-none" />
            <div
              className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent/30 to-primary/30 blur-2xl animate-pulse pointer-events-none"
              style={{ animationDelay: '1.5s' }}
            />
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none">
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64 C360,20 720,20 1080,64 C1440,108 1440,108 1440,120 L0,120 Z"
            fill="var(--background)"
            opacity="0.5"
          />
          <path
            d="M0,80 C360,40 720,40 1080,80 C1440,120 1440,120 1440,120 L0,120 Z"
            fill="var(--background)"
          />
        </svg>
      </div>
    </section>
  );
}