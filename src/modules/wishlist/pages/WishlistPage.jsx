import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useWishlist,
  useWishlistActions,
  WishlistGrid,
  formatPrice
} from '../modules/wishlist';

/**
 * @page WishlistPage
 * @description Página completa de Wishlist
 * 
 * Características:
 * - Muestra todos los items
 * - Filtros por disponibilidad y cambios de precio
 * - Acciones bulk (mover múltiples a carrito)
 * - Resumen de ahorros
 * - Estados de carga y error
 */
const WishlistPage = () => {
  const navigate = useNavigate();
  
  // Hooks de Wishlist
  const {
    items,
    loading,
    error,
    isEmpty,
    summary,
    availableItems,
    unavailableItems,
    itemsWithPriceDrop
  } = useWishlist();

  const {
    removeFromWishlist,
    moveToCart,
    clearWishlist,
    loading: actionLoading
  } = useWishlistActions(
    // onSuccess
    (message) => {
      // Aquí podrías mostrar una notificación toast
      console.log('Éxito:', message);
    },
    // onError
    (error) => {
      console.error('Error:', error);
    }
  );

  // Estado local
  const [selectedItems, setSelectedItems] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'available', 'unavailable', 'priceDrops'
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filtrar items según el filtro activo
  const getFilteredItems = () => {
    switch (filter) {
      case 'available':
        return availableItems;
      case 'unavailable':
        return unavailableItems;
      case 'priceDrops':
        return itemsWithPriceDrop;
      default:
        return items;
    }
  };

  const filteredItems = getFilteredItems();

  // Handlers
  const handleRemoveItem = async (productId) => {
    try {
      await removeFromWishlist(productId);
      // Limpiar selección si el item estaba seleccionado
      setSelectedItems(prev => prev.filter(id => id !== productId));
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await moveToCart([productId]);
    } catch (err) {
      console.error('Error moving to cart:', err);
    }
  };

  const handleMoveSelectedToCart = async () => {
    if (selectedItems.length === 0) return;

    try {
      await moveToCart(selectedItems);
      setSelectedItems([]);
    } catch (err) {
      console.error('Error moving selected items:', err);
    }
  };

  const handleClearWishlist = async () => {
    try {
      await clearWishlist();
      setShowClearConfirm(false);
      setSelectedItems([]);
    } catch (err) {
      console.error('Error clearing wishlist:', err);
    }
  };

  const handleToggleSelect = (productId) => {
    setSelectedItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    const availableItemIds = availableItems.map(item => item.product._id);
    setSelectedItems(availableItemIds);
  };

  const handleDeselectAll = () => {
    setSelectedItems([]);
  };

  // Estados de carga
  if (loading && !items) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-600">Cargando tu lista de deseos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mi Lista de Deseos
          </h1>
          <p className="text-gray-600">
            {summary.itemCount} {summary.itemCount === 1 ? 'producto' : 'productos'} guardados
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Resumen de ahorros */}
        {summary.totalSavings > 0 && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-green-900">
                    ¡Ahorros potenciales!
                  </p>
                  <p className="text-sm text-green-700">
                    Podrías ahorrar {formatPrice(summary.totalSavings)} comprando ahora
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isEmpty && (
          <>
            {/* Filtros y acciones */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Filtros */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Todos ({summary.itemCount})
                </button>
                <button
                  onClick={() => setFilter('available')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'available'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Disponibles ({summary.availableCount})
                </button>
                <button
                  onClick={() => setFilter('unavailable')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'unavailable'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  No disponibles ({summary.unavailableCount})
                </button>
                {summary.priceDropsCount > 0 && (
                  <button
                    onClick={() => setFilter('priceDrops')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'priceDrops'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-green-700 border border-green-300 hover:bg-green-50'
                    }`}
                  >
                    Con descuento ({summary.priceDropsCount})
                  </button>
                )}
              </div>

              {/* Acciones bulk */}
              <div className="flex gap-2">
                {selectedItems.length > 0 && (
                  <>
                    <button
                      onClick={handleMoveSelectedToCart}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                    >
                      Mover {selectedItems.length} al carrito
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      className="px-4 py-2 rounded-lg bg-white text-gray-700 text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Deseleccionar
                    </button>
                  </>
                )}
                {selectedItems.length === 0 && availableItems.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="px-4 py-2 rounded-lg bg-white text-gray-700 text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Seleccionar disponibles
                  </button>
                )}
                <button
                  onClick={() => setShowClearConfirm(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-white text-red-600 text-sm font-medium border border-red-300 hover:bg-red-50 disabled:text-red-300 transition-colors"
                >
                  Vaciar lista
                </button>
              </div>
            </div>

            {/* Grid de items */}
            <WishlistGrid
              items={filteredItems}
              onRemoveItem={handleRemoveItem}
              onMoveToCart={handleMoveToCart}
              loading={actionLoading}
              emptyState={{
                title: filter === 'all' ? 'Tu lista de deseos está vacía' : 'No hay productos en este filtro',
                message: filter === 'all'
                  ? 'Explora nuestros productos y guarda tus favoritos aquí'
                  : 'Intenta cambiar el filtro para ver otros productos',
                actionText: filter === 'all' ? 'Explorar productos' : 'Ver todos',
                onAction: filter === 'all' ? () => navigate('/products') : () => setFilter('all')
              }}
            />
          </>
        )}

        {/* Estado vacío */}
        {isEmpty && (
          <WishlistGrid
            items={[]}
            emptyState={{
              title: 'Tu lista de deseos está vacía',
              message: 'Explora nuestros productos y guarda tus favoritos aquí',
              actionText: 'Explorar productos',
              onAction: () => navigate('/products'),
              icon: 'heart'
            }}
          />
        )}

        {/* Modal de confirmación para vaciar */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Vaciar lista de deseos?
              </h3>
              <p className="text-gray-600 mb-6">
                Esta acción eliminará todos los productos de tu lista. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClearWishlist}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:bg-red-300 transition-colors"
                >
                  {actionLoading ? 'Vaciando...' : 'Sí, vaciar lista'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;