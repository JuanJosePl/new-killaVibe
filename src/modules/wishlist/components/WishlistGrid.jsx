import React from 'react';
import WishlistItem from './WishlistItem';
import WishlistEmptyState from './WishlistEmptyState';

/**
 * @component WishlistGrid
 * @description Grid de items de wishlist
 * 
 * @param {Array} items - Array de items
 * @param {Function} onRemoveItem - Callback para eliminar
 * @param {Function} onMoveToCart - Callback para mover a carrito
 * @param {boolean} loading - Estado de carga
 * @param {Object} emptyState - Configuración de estado vacío
 */
const WishlistGrid = ({
  items = [],
  onRemoveItem,
  onMoveToCart,
  loading = false,
  emptyState
}) => {
  // Si no hay items, mostrar estado vacío
  if (!items || items.length === 0) {
    return <WishlistEmptyState {...emptyState} />;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <WishlistItem
          key={item.product?._id || item._id}
          item={item}
          onRemove={onRemoveItem}
          onMoveToCart={onMoveToCart}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default WishlistGrid;