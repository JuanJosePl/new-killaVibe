// wishlist/components/WishlistGrid.jsx
import React from "react";
import WishlistItem from "./WishlistItem";
import WishlistEmptyState from "./WishlistEmptyState";

const WishlistGrid = ({
  items = [],
  onRemoveItem,
  onMoveToCart,
  loading = false,
  emptyState,
}) => {
  if (!items || items.length === 0) {
    return <WishlistEmptyState {...emptyState} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {items.map((item, index) => {
        // Obtenemos el ID real para la key y las acciones
        const productData = item?.product || item;
        const safeId = productData?._id || productData?.id || item?.productId;

        // Si no hay ID válido, usar índice como fallback (pero loguear advertencia)
        if (!safeId) {
          console.warn('[WishlistGrid] Item sin ID válido:', item);
        }

        return (
          <WishlistItem
            key={safeId || `wishlist-item-${index}`}
            item={item}
            onRemove={onRemoveItem ? () => onRemoveItem(safeId) : undefined}
            onMoveToCart={onMoveToCart ? () => onMoveToCart(safeId) : undefined}
            loading={loading}
          />
        );
      })}
    </div>
  );
};

export default WishlistGrid;