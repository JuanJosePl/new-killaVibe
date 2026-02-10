// wishlist/components/WishlistGrid.jsx

import React from "react";
import WishlistItem from "./WishlistItem";
import WishlistEmptyState from "./WishlistEmptyState";

/**
 * @component WishlistGrid
 * @description Grid de items de wishlist
 *
 * 🆕 CORREGIDO: Key único agregado
 */
const WishlistGrid = ({
  items = [],
  onRemoveItem,
  onMoveToCart,
  loading = false,
  emptyState,
}) => {
  // Si no hay items, mostrar estado vacío
  if (!items || items.length === 0) {
    return <WishlistEmptyState {...emptyState} />;
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        // 🆕 GENERAR KEY ÚNICO
        const productId =
          item.product?._id ||
          item.product?.id ||
          item.productId ||
          `item-${index}`;
        const key = `wishlist-item-${productId}`;

        return (
          <WishlistItem
            key={key}
            item={item}
            onRemove={onRemoveItem}
            onMoveToCart={onMoveToCart}
            loading={loading}
          />
        );
      })}
    </div>
  );
};

export default WishlistGrid;
