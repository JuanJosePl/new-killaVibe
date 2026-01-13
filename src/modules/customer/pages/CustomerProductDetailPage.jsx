// src/modules/customer/pages/CustomerProductDetailPage.jsx - VERSIÓN FINAL

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomerProducts } from "../context/CustomerProductsContext";
import { useCustomerWishlist } from "../context/CustomerWishlistContext";
import { useCustomerCart } from "../context/CustomerCartContext";
import useWishlistOperations from "../hooks/useWishlistOperations";
import customerProductsApi from "../api/customerProducts.api";
import customerReviewsApi from "../api/customerReviews.api";
import Breadcrumb from "../components/products/detail/Breadcrumb";
import ProductGallery from "../components/products/detail/ProductGallery";
import ProductInfo from "../components/products/detail/ProductInfo";
import PriceSection from "../components/products/detail/PriceSection";
import StockBadge from "../components/products/detail/StockBadge";
import ProductActions from "../components/products/detail/ProductActions";
import BenefitsCards from "../components/products/detail/BenefitsCards";
import ProductTabs from "../components/products/detail/ProductTabs";
import ReviewsSection from "../components/products/detail/ReviewsSection";
import RelatedProducts from "../components/products/detail/RelatedProducts";
import ProductDetailSkeleton from "../components/products/detail/ProductDetailSkeleton";
import ProductDetailError from "../components/products/detail/ProductDetailError";

/**
 * @page CustomerProductDetailPage
 * @description Página de detalle del producto CON INTEGRACIÓN COMPLETA DE REVIEWS
 * 
 * ✅ NUEVO: Sistema completo de reviews
 * ✅ NUEVO: Actualización en tiempo real
 * ✅ NUEVO: Integración con backend reviews
 * ✅ NUEVO: Stats dinámicos
 * ✅ NUEVO: Handlers completos (helpful, report)
 */
const CustomerProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const reviewsSectionRef = useRef(null);

  // ============================================
  // ESTADO - PRODUCTO
  // ============================================
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // ESTADO - REVIEWS (✅ NUEVO)
  // ============================================
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // ============================================
  // ESTADO - UI
  // ============================================
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // ============================================
  // HOOKS
  // ============================================
  const { visitProduct } = useCustomerProducts();
  const { isInWishlist } = useCustomerWishlist();
  const { addItem: addToCart } = useCustomerCart();
  const { handleAddItem, handleRemoveItem, isItemLoading } = useWishlistOperations();

  // ============================================
  // CARGAR DATOS AL MONTAR
  // ============================================
  useEffect(() => {
    loadProductData();
  }, [slug]);

  /**
   * ✅ ACTUALIZADO: Cargar producto + reviews en paralelo
   */
  const loadProductData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Cargar producto
      const productData = await customerProductsApi.getProductBySlug(slug);
      setProduct(productData);
      visitProduct(productData);

      // 2. Cargar datos relacionados en paralelo
      const [related, reviewsData, stats] = await Promise.all([
        customerProductsApi.getRelatedProducts(productData._id, 4).catch(() => []),
        customerReviewsApi.getProductReviews(productData._id, {
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }).catch(() => ({ reviews: [] })),
        customerReviewsApi.getReviewStats(productData._id).catch(() => null)
      ]);

      setRelatedProducts(related);
      setReviews(reviewsData.reviews || []);
      setReviewStats(stats);
    } catch (err) {
      console.error("Error loading product:", err);
      setError(err.message || "Error al cargar el producto");
    } finally {
      setIsLoading(false);
      setReviewsLoading(false);
    }
  };

  /**
   * ✅ NUEVO: Recargar solo reviews (optimización)
   */
  const reloadReviews = useCallback(async () => {
    if (!product?._id) return;

    try {
      setReviewsLoading(true);
      const [reviewsData, stats] = await Promise.all([
        customerReviewsApi.getProductReviews(product._id, {
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }),
        customerReviewsApi.getReviewStats(product._id)
      ]);

      setReviews(reviewsData.reviews || []);
      setReviewStats(stats);
    } catch (err) {
      console.error('Error reloading reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [product]);

  // ============================================
  // HANDLERS - CARRITO Y WISHLIST
  // ============================================

  /**
   * Agregar al carrito
   */
  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    const productInStock = product.stock > 0 || product.allowBackorder;
    if (!productInStock) return;

    try {
      setIsAddingToCart(true);
      await addToCart(product._id, quantity);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  }, [product, quantity, addToCart]);

  /**
   * Toggle wishlist
   */
  const handleToggleWishlist = useCallback(async () => {
    if (!product) return;
    try {
      const inWishlist = isInWishlist(product._id);
      if (inWishlist) {
        await handleRemoveItem(product._id);
      } else {
        await handleAddItem(product._id);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  }, [product, isInWishlist, handleAddItem, handleRemoveItem]);

  /**
   * Comprar ahora
   */
  const handleBuyNow = useCallback(async () => {
    await handleAddToCart();
    setTimeout(() => navigate("/customer/cart"), 500);
  }, [handleAddToCart, navigate]);

  // ============================================
  // HANDLERS - REVIEWS (✅ NUEVO)
  // ============================================

  /**
   * Handler cuando se crea una review
   */
  const handleReviewCreated = useCallback(
    (newReview) => {
      console.log("✅ Review creada, actualizando UI:", newReview);
      
      // 1. Agregar review al inicio de la lista
      setReviews((prev) => [newReview, ...prev]);
      
      // 2. Recargar stats desde el servidor
      if (product?._id) {
        customerReviewsApi.getReviewStats(product._id)
          .then(setReviewStats)
          .catch(err => console.error('Error actualizando stats:', err));
      }
    },
    [product]
  );

  /**
   * ✅ NUEVO: Handler para marcar review como útil
   */
  const handleMarkHelpful = useCallback(async (reviewId) => {
    try {
      await customerReviewsApi.markAsHelpful(reviewId);
      
      // Actualizar contador localmente (optimistic update)
      setReviews(prev => 
        prev.map(r => 
          r._id === reviewId 
            ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 }
            : r
        )
      );
    } catch (error) {
      console.error('Error marking as helpful:', error);
      throw error;
    }
  }, []);

  /**
   * ✅ NUEVO: Handler para reportar review
   */
  const handleReportReview = useCallback(async (reviewId, reason) => {
    try {
      await customerReviewsApi.reportReview(reviewId, reason);
      
      // Actualizar contador localmente
      setReviews(prev => 
        prev.map(r => 
          r._id === reviewId 
            ? { ...r, reportCount: (r.reportCount || 0) + 1 }
            : r
        )
      );
    } catch (error) {
      console.error('Error reporting review:', error);
      throw error;
    }
  }, []);

  /**
   * Scroll suave a reviews
   */
  const scrollToReviews = useCallback(() => {
    reviewsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  // ============================================
  // RENDER - LOADING & ERROR STATES
  // ============================================

  if (isLoading) return <ProductDetailSkeleton />;
  
  if (error || !product) {
    return (
      <ProductDetailError
        error={error}
        onRetry={loadProductData}
        navigate={navigate}
      />
    );
  }

  // ============================================
  // VALORES COMPUTADOS
  // ============================================

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100
        )
      : 0;

  const isInStock = product.stock > 0 || product.allowBackorder;
  const isLowStock =
    product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
  const productIsInWishlist = isInWishlist(product._id);
  const isTogglingWishlist = isItemLoading(product._id);

  // ============================================
  // RENDER - MAIN UI
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* BREADCRUMB */}
        <Breadcrumb product={product} navigate={navigate} />

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* COLUMNA IZQUIERDA - GALERÍA */}
          <div className="space-y-6">
            <ProductGallery
              images={product.images || []}
              productName={product.name}
              discount={discount}
              isFeatured={product.isFeatured}
            />
          </div>

          {/* COLUMNA DERECHA - INFO Y ACCIONES */}
          <div className="space-y-6">
            <ProductInfo
              product={product}
              discount={discount}
              reviewStats={reviewStats}
              onScrollToReviews={scrollToReviews}
            />

            <PriceSection
              product={product}
              quantity={quantity}
              discount={discount}
            />

            <StockBadge
              stock={product.stock}
              isInStock={isInStock}
              isLowStock={isLowStock}
              allowBackorder={product.allowBackorder}
            />

            <ProductActions
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              isInStock={isInStock}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleToggleWishlist}
              onBuyNow={handleBuyNow}
              isAddingToCart={isAddingToCart}
              isInWishlist={productIsInWishlist}
              isTogglingWishlist={isTogglingWishlist}
            />

            <BenefitsCards />
          </div>
        </div>

        {/* TABS DE INFORMACIÓN */}
        <ProductTabs
          product={product}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* ✅ SECCIÓN DE REVIEWS - INTEGRADA */}
        <div ref={reviewsSectionRef}>
          <ReviewsSection
            productId={product._id}
            reviews={reviews}
            stats={reviewStats}
            isLoading={reviewsLoading}
            onReviewCreated={handleReviewCreated}
            onMarkHelpful={handleMarkHelpful}
            onReportReview={handleReportReview}
            onReloadReviews={reloadReviews}
          />
        </div>

        {/* PRODUCTOS RELACIONADOS */}
        {relatedProducts.length > 0 && (
          <RelatedProducts
            products={relatedProducts}
            onAddToCart={(productId) => addToCart(productId, 1)}
            onAddToWishlist={handleAddItem}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerProductDetailPage;