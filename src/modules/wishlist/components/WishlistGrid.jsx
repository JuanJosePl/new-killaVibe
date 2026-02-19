import React from 'react';
import WishlistItem from './WishlistItem';
import WishlistEmptyState from './WishlistEmptyState';

/**
 * @component WishlistGrid
 * @description Componente puramente presentacional.
 * Renderiza la lista de WishlistItems o el estado vacío.
 * No accede al store ni a hooks de wishlist.
 *
 * @param {Object[]}  items            - Items canónicos del dominio (WishlistItem[])
 * @param {Function}  onRemoveItem     - (productId: string) => void
 * @param {Function}  onMoveToCart     - (productId: string) => void
 * @param {string[]}  selectedItems    - IDs de items seleccionados para bulk actions
 * @param {Function}  onToggleSelect   - (productId: string) => void
 * @param {Object}    emptyState       - Props para WishlistEmptyState
 */
const WishlistGrid = ({
  items = [],
  onRemoveItem,
  onMoveToCart,
  selectedItems = [],
  onToggleSelect,
  emptyState,
}) => {
  if (!items || items.length === 0) {
    return <WishlistEmptyState {...emptyState} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {items.map((item, index) => {
        const productId = item.productId;

        if (!productId) {
          return null;
        }

        return (
          <WishlistItem
            key={productId || `wishlist-item-${index}`}
            item={item}
            isSelected={selectedItems.includes(productId)}
            onRemove={onRemoveItem ? () => onRemoveItem(productId) : undefined}
            onMoveToCart={onMoveToCart ? () => onMoveToCart(productId) : undefined}
            onToggleSelect={onToggleSelect ? () => onToggleSelect(productId) : undefined}
          />
        );
      })}
    </div>
  );
};

export default WishlistGrid;