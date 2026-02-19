import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../index';
import { useWishlistActions } from '../index';
import { formatPrice, calculateTotalSavings } from '../utils/wishlistHelpers';
import WishlistGrid from '../components/WishlistGrid';
import WishlistEmptyState from '../components/WishlistEmptyState';

/**
 * @page WishlistPage
 * @description Página completa de lista de deseos.
 *
 * Consume únicamente useWishlist (lectura) y useWishlistActions (escritura).
 * No accede al store, repository ni API directamente.
 */
const WishlistPage = () => {
  const navigate = useNavigate();

  // ── LECTURA ────────────────────────────────────────────────────────────────
  const {
    items,
    loading,
    error,
    initialized,
    isEmpty,
    summary,
    availableItems,
    unavailableItems,
    itemsWithPriceDrop,
  } = useWishlist();

  // ── ESCRITURA ──────────────────────────────────────────────────────────────
  const {
    removeFromWishlist,
    moveMultipleToCart,
    clearWishlist,
    refreshWishlist,
  } = useWishlistActions(
    (message) => { /* toast.success(message) — conectar según sistema de toast del proyecto */ },
    (message) => { /* toast.error(message)   — conectar según sistema de toast del proyecto */ }
  );

  // ── ESTADO LOCAL ───────────────────────────────────────────────────────────
  const [selectedItems, setSelectedItems]     = useState([]);
  const [filter, setFilter]                   = useState('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing]           = useState(false);
  const [isMovingSelected, setIsMovingSelected] = useState(false);

  // ── CARGA INICIAL ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialized) {
      refreshWishlist();
    }
  }, [initialized]);

  // ── FILTRADO ───────────────────────────────────────────────────────────────
  const filteredItems = (() => {
    switch (filter) {
      case 'available':   return availableItems;
      case 'unavailable': return unavailableItems;
      case 'priceDrops':  return itemsWithPriceDrop;
      default:            return items;
    }
  })();

  const totalSavings = calculateTotalSavings(itemsWithPriceDrop);

  // ── HANDLERS ───────────────────────────────────────────────────────────────

  const handleRemoveItem = async (productId) => {
    await removeFromWishlist(productId);
    setSelectedItems(prev => prev.filter(id => id !== productId));
  };

  const handleMoveToCart = async (productId) => {
    await moveMultipleToCart([productId]);
  };

  const handleMoveSelectedToCart = async () => {
    if (selectedItems.length === 0) return;
    setIsMovingSelected(true);
    try {
      await moveMultipleToCart(selectedItems);
      setSelectedItems([]);
    } finally {
      setIsMovingSelected(false);
    }
  };

  const handleClearWishlist = async () => {
    setIsClearing(true);
    try {
      await clearWishlist();
      setShowClearConfirm(false);
      setSelectedItems([]);
    } finally {
      setIsClearing(false);
    }
  };

  const handleToggleSelect = (productId) => {
    if (!productId) return;
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    const ids = availableItems.map(item => item.productId).filter(Boolean);
    setSelectedItems(ids);
  };

  const handleDeselectAll = () => setSelectedItems([]);

  // ── LOADING INICIAL ────────────────────────────────────────────────────────
  if (loading.global && !initialized) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <svg
              className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-600">Cargando tu lista de deseos...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mi Lista de Deseos
          </h1>
          <p className="text-gray-600">
            {summary.itemCount}{' '}
            {summary.itemCount === 1 ? 'producto' : 'productos'} guardados
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Banner de ahorros */}
        {totalSavings > 0 && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-green-900">¡Ahorros potenciales!</p>
                <p className="text-sm text-green-700">
                  Podrías ahorrar {formatPrice(totalSavings)} comprando ahora
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        {isEmpty ? (
          <WishlistEmptyState
            title="Tu lista de deseos está vacía"
            message="Explora nuestros productos y guarda tus favoritos aquí"
            actionText="Explorar productos"
            onAction={() => navigate('/products')}
            icon="heart"
          />
        ) : (
          <>
            {/* Filtros y acciones bulk */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Filtros */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all',         label: `Todos (${summary.itemCount})` },
                  { key: 'available',   label: `Disponibles (${summary.availableCount})` },
                  { key: 'unavailable', label: `No disponibles (${summary.unavailableCount})` },
                  ...(summary.priceDropsCount > 0
                    ? [{ key: 'priceDrops', label: `Con descuento (${summary.priceDropsCount})` }]
                    : []),
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === key
                        ? 'bg-blue-600 text-white'
                        : key === 'priceDrops'
                          ? 'bg-white text-green-700 border border-green-300 hover:bg-green-50'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Acciones bulk */}
              <div className="flex gap-2">
                {selectedItems.length > 0 ? (
                  <>
                    <button
                      onClick={handleMoveSelectedToCart}
                      disabled={isMovingSelected}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-2"
                    >
                      {isMovingSelected && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      Mover {selectedItems.length} al carrito
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      className="px-4 py-2 rounded-lg bg-white text-gray-700 text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Deseleccionar
                    </button>
                  </>
                ) : (
                  availableItems.length > 0 && (
                    <button
                      onClick={handleSelectAll}
                      className="px-4 py-2 rounded-lg bg-white text-gray-700 text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Seleccionar disponibles
                    </button>
                  )
                )}
                <button
                  onClick={() => setShowClearConfirm(true)}
                  disabled={loading.global}
                  className="px-4 py-2 rounded-lg bg-white text-red-600 text-sm font-medium border border-red-300 hover:bg-red-50 disabled:text-red-300 transition-colors"
                >
                  Vaciar lista
                </button>
              </div>
            </div>

            {/* Grid */}
            <WishlistGrid
              items={filteredItems}
              onRemoveItem={handleRemoveItem}
              onMoveToCart={handleMoveToCart}
              selectedItems={selectedItems}
              onToggleSelect={handleToggleSelect}
              emptyState={{
                title: filter === 'all'
                  ? 'Tu lista de deseos está vacía'
                  : 'No hay productos en este filtro',
                message: filter === 'all'
                  ? 'Explora nuestros productos y guarda tus favoritos aquí'
                  : 'Intenta cambiar el filtro para ver otros productos',
                actionText: filter === 'all' ? 'Explorar productos' : 'Ver todos',
                onAction: filter === 'all'
                  ? () => navigate('/products')
                  : () => setFilter('all'),
              }}
            />
          </>
        )}

        {/* Modal de confirmación — vaciar wishlist */}
        {showClearConfirm && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
              onClick={() => !isClearing && setShowClearConfirm(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
              <div
                className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl pointer-events-auto animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  ¿Vaciar lista de deseos?
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  Esta acción eliminará todos los productos de tu lista.
                  <strong className="block mt-2 text-red-600">
                    Esta acción no se puede deshacer.
                  </strong>
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    disabled={isClearing}
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleClearWishlist}
                    disabled={isClearing}
                    className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isClearing && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {isClearing ? 'Vaciando...' : 'Sí, vaciar lista'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;