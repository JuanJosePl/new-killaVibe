import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../../components/ProductCard";
import { Badge } from "../../../../shared/components/ui/badge";
import { Button } from "../../../../shared/components/ui/button";
import { useScrollToTop } from "../../../../core/hooks/useScroll";
import { PageLayout } from "../../../../shared/components/marketing/page-layout";

// ✅ MIGRADO: Hook del módulo Products — reemplaza productsAPI directo
import {
  useProductsRepository,
  useProductList,
  hasDiscount,
  getDiscountPercentage,
} from "@/modules/products";

/**
 * @page OffersPage (Ofertas)
 *
 * CAMBIOS DE MIGRACIÓN:
 * - productsAPI.getProducts() + useState/useEffect manual → useProductList(repo, filters)
 * - Filtrado de discountProducts: product.comparePrice > product.price
 *   → hasDiscount(product)  [regla del dominio, fuente única de verdad]
 * - Porcentaje de descuento inline Math.round(...)
 *   → getDiscountPercentage(product)
 * - Loading state provistos por el hook
 * - Timer de cuenta regresiva: sin cambios (UI pura)
 */
export default function OffersPage() {
  useScrollToTop();

  const repo = useProductsRepository();
  const { products: allProducts, isLoading, reload } = useProductList(repo);

  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  // ✅ Carga inicial con filtros de backend
  useEffect(() => {
    reload({
      limit: 48,
      status: "active",
      visibility: "public",
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ hasDiscount(product) reemplaza comparación manual de campos
  const discountProducts = allProducts.filter((p) => hasDiscount(p));

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-64 mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                <div className="h-10 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 pt-4 pb-8">
        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 mb-6 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <span className="text-4xl">🔥</span>
            <h2 className="text-2xl font-bold mb-2">¡Ofertas por Tiempo Limitado!</h2>
            <p className="text-lg opacity-90 mb-4">Termina en:</p>
            <div className="flex justify-center space-x-4 text-2xl font-mono font-bold">
              {[
                [timeLeft.hours, "h"],
                [timeLeft.minutes, "m"],
                [timeLeft.seconds, "s"],
              ].map(([value, unit]) => (
                <div
                  key={unit}
                  className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm"
                >
                  {String(value).padStart(2, "0")}
                  <span className="text-sm font-normal ml-1">{unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Productos en oferta */}
        {discountProducts.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">
                Productos en Oferta ({discountProducts.length})
              </h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Ordenar por:</span>
                <select className="bg-transparent border-0 focus:outline-none">
                  <option>Mayor descuento</option>
                  <option>Precio más bajo</option>
                  <option>Precio más alto</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {discountProducts.map((product, index) => {
                // ✅ getDiscountPercentage reemplaza Math.round inline
                const discountPct = getDiscountPercentage(product);

                return (
                  <div key={product._id} className="relative group">
                    <div className="absolute top-3 left-3 z-20">
                      <Badge className="bg-red-500 text-white border-0 font-bold text-sm py-1 px-3 shadow-lg">
                        -{discountPct}%
                      </Badge>
                    </div>

                    {discountPct > 50 && (
                      <div className="absolute top-3 right-3 z-20">
                        <Badge className="bg-orange-500 text-white border-0 font-bold text-xs py-1 px-2">
                          🔥 HOT
                        </Badge>
                      </div>
                    )}

                    <ProductCard
                      product={product}
                      className="animate-slide-in-up border-2 border-transparent group-hover:border-primary/30 transition-all duration-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">😔</div>
            <h3 className="text-2xl font-semibold mb-4">No hay ofertas activas</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Actualmente no tenemos productos en oferta. ¡Vuelve pronto para no
              perderte nuestras promociones especiales!
            </p>
            <Link to="/productos">
              <Button className="btn-primary px-6 py-3">
                Explorar Todos los Productos
              </Button>
            </Link>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-16 p-8 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border border-border/50 backdrop-blur-sm">
          <h3 className="text-2xl font-bold mb-4">¿No encuentras lo que buscas?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Contáctanos por WhatsApp y te ayudamos a encontrar el producto perfecto
            para ti. También podemos informarte sobre próximas ofertas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/message/O4FKBMAABGC5L1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="mr-2">💬</span>
              Contactar por WhatsApp
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