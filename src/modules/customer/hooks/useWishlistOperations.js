// src/modules/customer/hooks/useWishlistOperations.js

import { useState, useCallback } from "react";
import { useCustomerWishlist } from "../context/CustomerWishlistContext";

export const useWishlistOperations = () => {
  const {
    wishlist,
    isLoading,
    isInWishlist, // ✅ SOLUCIÓN: Importar del contexto
    addItem,
    removeItem,
    clearWishlist,
    moveToCart,
    moveAllToCart,
    getItemsWithDiscount,
    getUnavailableItems,
  } = useCustomerWishlist();

  const [loadingItems, setLoadingItems] = useState(new Set());
  const [isMovingAll, setIsMovingAll] = useState(false);
  const [isClearingWishlist, setIsClearingWishlist] = useState(false);

  const handleAddItem = useCallback(
    async (
      productId,
      notifyPriceChange = false,
      notifyAvailability = false
    ) => {
      setLoadingItems((prev) => new Set(prev).add(productId));

      try {
        await addItem(productId, notifyPriceChange, notifyAvailability);
        return {
          success: true,
          message: "❤️ Producto agregado a tu lista de deseos",
        };
      } catch (error) {
        console.error("Error adding to wishlist:", error);
        return {
          success: false,
          error: error.message || "Error al agregar a wishlist",
        };
      } finally {
        setLoadingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    },
    [addItem]
  );

  const handleRemoveItem = useCallback(
    async (productId) => {
      setLoadingItems((prev) => new Set(prev).add(productId));

      try {
        await removeItem(productId);
        return {
          success: true,
          message: "Producto eliminado de tu lista de deseos",
        };
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        return {
          success: false,
          error: error.message || "Error al eliminar de wishlist",
        };
      } finally {
        setLoadingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    },
    [removeItem]
  );

  // ✅ NUEVO: Toggle wishlist (agregar o eliminar según estado)
  const toggleWishlist = useCallback(
    async (productId) => {
      if (isInWishlist(productId)) {
        return handleRemoveItem(productId);
      } else {
        return handleAddItem(productId);
      }
    },
    [isInWishlist, handleAddItem, handleRemoveItem]
  );

  const handleMoveToCart = useCallback(
    async (productId) => {
      setLoadingItems((prev) => new Set(prev).add(productId));

      try {
        await moveToCart([productId]);
        return {
          success: true,
          message: "✓ Producto agregado al carrito",
        };
      } catch (error) {
        console.error("Error moving to cart:", error);
        return {
          success: false,
          error: error.message || "Error al mover al carrito",
        };
      } finally {
        setLoadingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    },
    [moveToCart]
  );

  const handleMoveMultipleToCart = useCallback(
    async (productIds) => {
      if (!productIds || productIds.length === 0) {
        return {
          success: false,
          error: "No hay productos seleccionados",
        };
      }

      setLoadingItems((prev) => {
        const newSet = new Set(prev);
        productIds.forEach((id) => newSet.add(id));
        return newSet;
      });

      try {
        const result = await moveToCart(productIds);
        return {
          success: true,
          message: `✓ ${result.movedCount} productos movidos al carrito`,
          movedCount: result.movedCount,
        };
      } catch (error) {
        console.error("Error moving multiple to cart:", error);
        return {
          success: false,
          error: error.message || "Error al mover productos",
        };
      } finally {
        setLoadingItems((prev) => {
          const newSet = new Set(prev);
          productIds.forEach((id) => newSet.delete(id));
          return newSet;
        });
      }
    },
    [moveToCart]
  );

  const handleMoveAllToCart = useCallback(async () => {
    setIsMovingAll(true);

    try {
      const result = await moveAllToCart();
      return {
        success: true,
        message: `✓ ${result.movedCount} productos movidos al carrito`,
        movedCount: result.movedCount,
      };
    } catch (error) {
      console.error("Error moving all to cart:", error);
      return {
        success: false,
        error: error.message || "Error al mover todos los productos",
      };
    } finally {
      setIsMovingAll(false);
    }
  }, [moveAllToCart]);

  const handleClearWishlist = useCallback(async () => {
    setIsClearingWishlist(true);

    try {
      await clearWishlist();
      return {
        success: true,
        message: "Lista de deseos vaciada",
      };
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      return {
        success: false,
        error: error.message || "Error al vaciar lista de deseos",
      };
    } finally {
      setIsClearingWishlist(false);
    }
  }, [clearWishlist]);

  const filterItems = useCallback(
    (filter) => {
      if (!wishlist?.items) return [];

      switch (filter) {
        case "available":
          return wishlist.items.filter((item) => item.isAvailable);
        case "discount":
          return getItemsWithDiscount();
        case "unavailable":
          return getUnavailableItems();
        case "all":
        default:
          return wishlist.items;
      }
    },
    [wishlist, getItemsWithDiscount, getUnavailableItems]
  );

  const isItemLoading = useCallback(
    (productId) => {
      return loadingItems.has(productId);
    },
    [loadingItems]
  );

  const getStats = useCallback(() => {
    if (!wishlist?.items) {
      return {
        total: 0,
        available: 0,
        unavailable: 0,
        withDiscount: 0,
      };
    }

    const available = wishlist.items.filter((item) => item.isAvailable).length;
    const unavailable = getUnavailableItems().length;
    const withDiscount = getItemsWithDiscount().length;

    return {
      total: wishlist.items.length,
      available,
      unavailable,
      withDiscount,
    };
  }, [wishlist, getItemsWithDiscount, getUnavailableItems]);

  return {
    // Operaciones
    handleAddItem,
    handleRemoveItem,
    toggleWishlist, // ✅ NUEVO: Función toggle conveniente
    handleMoveToCart,
    handleMoveMultipleToCart,
    handleMoveAllToCart,
    handleClearWishlist,
    filterItems,

    // Estados de loading
    isItemLoading,
    isMovingAll,
    isClearingWishlist,
    isGlobalLoading: isLoading,

    // Utilidades
    isInWishlist, // ✅ SOLUCIÓN: Exportar isInWishlist
    getStats,

    // Data de wishlist (pass-through)
    wishlist,
  };
};

export default useWishlistOperations;
