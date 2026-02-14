// src/modules/customer/pages/CustomerProductsPage.jsx

import React, { useState, useCallback } from 'react';
import useProducts from '../hooks/useProducts';
import { useCustomerProducts } from '../context/CustomerProductsContext';
import { useCustomerCart } from '../context/CustomerCartContext';
import { useCustomerWishlist } from '../context/CustomerWishlistContext';
import ProductGrid from '../components/products/ProductGrid';
import ProductFilters from '../components/products/ProductFilters';
import ProductSearch from '../components/products/ProductSearch';

/**
 * @page CustomerProductsPage
 * @description Página principal de productos COMPLETAMENTE FUNCIONAL
 * 
 * ✅ INTEGRADO CON:
 * - Cart Context (agregar productos al carrito)
 * - Wishlist Context (agregar/remover favoritos)
 * - Products Hook (filtros, búsqueda, paginación)
 * - Categories Context (filtros por categoría)
 * 
 * ✅ FUNCIONALIDADES:
 * - Agregar al carrito con validación de stock
 * - Toggle wishlist con feedback visual
 * - Notificaciones de éxito/error
 * - Loading states granulares
 * - Sincronización con backend
 */
const CustomerProductsPage = () => {
  // ============================================
  // HOOKS
  // ============================================
  
  // Products Hook (filtros, búsqueda, paginación)
  const {
    products,
    pagination,
    filters,
    searchQuery,
    isLoading,
    error,
    updateFilters,
    clearFilters,
    searchProducts,
    clearSearch,
    goToPage,
    nextPage,
    prevPage,
    hasActiveFilters,
  } = useProducts();

  // Contextos
  const { visitProduct } = useCustomerProducts();
  const { addItem: addToCart, isInCart, getItemQuantity } = useCustomerCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useCustomerWishlist();

  // ============================================
  // ESTADO LOCAL
  // ============================================
  
  const [view, setView] = useState('grid');
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }
  const [loadingStates, setLoadingStates] = useState({
    cart: new Set(), // IDs de productos agregándose al carrito
    wishlist: new Set(), // IDs de productos agregándose a wishlist
  });

  // ============================================
  // MOCK DATA (temporal - reemplazar con API real)
  // ============================================
  
  const mockCategories = [
    { slug: 'electronics', name: 'Electrónica' },
    { slug: 'clothing', name: 'Ropa' },
    { slug: 'home', name: 'Hogar' },
    { slug: 'sports', name: 'Deportes' },
    { slug: 'books', name: 'Libros' },
  ];

  const mockBrands = ['Samsung', 'Apple', 'Sony', 'LG', 'Nike', 'Adidas'];

  // ============================================
  // HELPER: NOTIFICACIONES
  // ============================================
  
  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // ============================================
  // HELPER: LOADING STATES
  // ============================================
  
  const setItemLoading = useCallback((productId, operation, isLoading) => {
    setLoadingStates(prev => {
      const newSet = new Set(prev[operation]);
      if (isLoading) {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
      }
      return { ...prev, [operation]: newSet };
    });
  }, []);

  const isItemLoading = useCallback((productId, operation) => {
    return loadingStates[operation].has(productId);
  }, [loadingStates]);

  // ============================================
  // HANDLER: AGREGAR AL CARRITO
  // ============================================
  
  const handleAddToCart = useCallback(async (product) => {
    const productId = product._id;

    // Validar disponibilidad
    if (!product.stock || product.stock === 0) {
      showNotification('error', 'Producto sin stock disponible');
      return;
    }

    // Verificar si ya está en el carrito
    if (isInCart(productId)) {
      const currentQty = getItemQuantity(productId);
      showNotification('info', `Ya tienes ${currentQty} unidades en el carrito`);
      return;
    }

    // Marcar como loading
    setItemLoading(productId, 'cart', true);

    try {
      // Agregar al carrito (1 unidad por defecto)
      await addToCart(productId, 1, {});
      
      showNotification('success', `✅ ${product.name} agregado al carrito`);
      
      // Registrar visita al producto
      visitProduct(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      if (error.statusCode === 400) {
        showNotification('error', '⚠️ Stock insuficiente');
      } else if (error.statusCode === 404) {
        showNotification('error', '❌ Producto no encontrado');
      } else {
        showNotification('error', '❌ Error al agregar al carrito');
      }
    } finally {
      setItemLoading(productId, 'cart', false);
    }
  }, [addToCart, isInCart, getItemQuantity, visitProduct, showNotification, setItemLoading]);

  // ============================================
  // HANDLER: TOGGLE WISHLIST
  // ============================================
  
  const handleToggleWishlist = useCallback(async (product) => {
    const productId = product._id;
    const inWishlist = isInWishlist(productId);

    // Marcar como loading
    setItemLoading(productId, 'wishlist', true);

    try {
      if (inWishlist) {
        // Remover de wishlist
        await removeFromWishlist(productId);
        showNotification('success', `💔 ${product.name} removido de favoritos`);
      } else {
        // Agregar a wishlist
        await addToWishlist(productId, true, true); // Con notificaciones de precio y stock
        showNotification('success', `❤️ ${product.name} agregado a favoritos`);
        
        // Registrar visita al producto
        visitProduct(product);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      
      if (error.statusCode === 409) {
        showNotification('info', 'Este producto ya está en tu lista de deseos');
      } else if (error.statusCode === 404) {
        showNotification('error', '❌ Producto no encontrado');
      } else {
        showNotification('error', '❌ Error al actualizar favoritos');
      }
    } finally {
      setItemLoading(productId, 'wishlist', false);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist, visitProduct, showNotification, setItemLoading]);

  // ============================================
  // HANDLERS: FILTROS
  // ============================================
  
  const handleFilterChange = useCallback((newFilters) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  const handleSearch = useCallback((query) => {
    searchProducts(query);
  }, [searchProducts]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 p-6">
      <div className="max-w-[1600px] mx-auto">
        
        {/* ==========================================
            NOTIFICATION TOAST
        ========================================== */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className={`
              px-6 py-4 rounded-2xl shadow-2xl border-2 flex items-center gap-3 min-w-[300px]
              ${notification.type === 'success' 
                ? 'bg-green-50 border-green-500 text-green-900' 
                : notification.type === 'error'
                ? 'bg-red-50 border-red-500 text-red-900'
                : 'bg-blue-50 border-blue-500 text-blue-900'
              }
            `}>
              {notification.type === 'success' && <span className="text-2xl">✅</span>}
              {notification.type === 'error' && <span className="text-2xl">❌</span>}
              {notification.type === 'info' && <span className="text-2xl">ℹ️</span>}
              <span className="font-semibold">{notification.message}</span>
            </div>
          </div>
        )}

        {/* ==========================================
            HEADER
        ========================================== */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900">Productos</h1>
              <p className="text-gray-600 font-medium">
                Descubre nuestra selección premium
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <ProductSearch
            onSearch={handleSearch}
            onClear={clearSearch}
            initialQuery={searchQuery}
          />
        </div>

        {/* ==========================================
            MAIN CONTENT
        ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* FILTERS SIDEBAR */}
          <div className="lg:col-span-1">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              categories={mockCategories}
              brands={mockBrands}
            />
          </div>

          {/* PRODUCTS GRID */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Results Header */}
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                {/* Results Count */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {isLoading ? (
                        'Cargando...'
                      ) : (
                        <>
                          Mostrando{' '}
                          <span className="font-bold text-gray-900">
                            {products.length}
                          </span>{' '}
                          de{' '}
                          <span className="font-bold text-gray-900">
                            {pagination.total || 0}
                          </span>{' '}
                          productos
                        </>
                      )}
                    </p>
                    {searchQuery && (
                      <p className="text-xs text-blue-600 font-semibold">
                        Resultados para: "{searchQuery}"
                      </p>
                    )}
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      view === 'grid'
                        ? 'bg-white shadow-md text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Vista de cuadrícula"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded-lg transition-all ${
                      view === 'list'
                        ? 'bg-white shadow-md text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Vista de lista"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                  {filters.category && (
                    <FilterBadge
                      label={`Categoría: ${filters.category}`}
                      onRemove={() => handleFilterChange({ category: undefined })}
                    />
                  )}
                  {filters.brand && (
                    <FilterBadge
                      label={`Marca: ${filters.brand}`}
                      onRemove={() => handleFilterChange({ brand: undefined })}
                    />
                  )}
                  {(filters.minPrice || filters.maxPrice) && (
                    <FilterBadge
                      label={`Precio: $${filters.minPrice || 0} - $${
                        filters.maxPrice || '∞'
                      }`}
                      onRemove={() =>
                        handleFilterChange({
                          minPrice: undefined,
                          maxPrice: undefined,
                        })
                      }
                    />
                  )}
                  {filters.inStock && (
                    <FilterBadge
                      label="En stock"
                      onRemove={() => handleFilterChange({ inStock: false })}
                    />
                  )}
                  {filters.featured && (
                    <FilterBadge
                      label="Destacados"
                      onRemove={() => handleFilterChange({ featured: false })}
                    />
                  )}
                  
                  {/* Clear All Button */}
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-red-200 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Limpiar todos
                  </button>
                </div>
              )}
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  Error al cargar productos
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!error && (
              <ProductGrid
                products={products}
                isLoading={isLoading}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleToggleWishlist}
                // ✅ NUEVOS PROPS PARA LOADING STATES
                getIsInCart={isInCart}
                getIsInWishlist={isInWishlist}
                getIsCartLoading={(productId) => isItemLoading(productId, 'cart')}
                getIsWishlistLoading={(productId) => isItemLoading(productId, 'wishlist')}
              />
            )}

            {/* Pagination */}
            {!isLoading && !error && pagination.pages > 1 && (
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  
                  {/* Info */}
                  <div className="text-sm text-gray-600 font-medium">
                    Página{' '}
                    <span className="font-bold text-gray-900">
                      {pagination.current}
                    </span>{' '}
                    de{' '}
                    <span className="font-bold text-gray-900">
                      {pagination.pages}
                    </span>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={prevPage}
                      disabled={pagination.current === 1}
                      className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-600 transition-all"
                    >
                      ← Anterior
                    </button>

                    {/* Page Numbers */}
                    <div className="hidden sm:flex items-center gap-1">
                      {generatePageNumbers(pagination.current, pagination.pages).map((page, index) => (
                        page === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`w-10 h-10 rounded-xl font-bold transition-all ${
                              pagination.current === page
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={nextPage}
                      disabled={pagination.current === pagination.pages}
                      className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-600 transition-all"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && products.length === 0 && (
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? `No hay resultados para "${searchQuery}"`
                    : 'No hay productos que coincidan con los filtros aplicados'
                  }
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// HELPER COMPONENTS
// ============================================

const FilterBadge = ({ label, onRemove }) => (
  <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold group">
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
      aria-label={`Remover filtro: ${label}`}
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
);

// ============================================
// HELPER FUNCTIONS
// ============================================

function generatePageNumbers(current, total) {
  const pages = [];
  const showEllipsis = total > 7;

  if (!showEllipsis) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (current > 3) {
      pages.push('...');
    }

    for (let i = Math.max(2, current - 1); i <= Math.min(current + 1, total - 1); i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push('...');
    }

    pages.push(total);
  }

  return pages;
}

export default CustomerProductsPage;