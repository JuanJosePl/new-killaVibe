// src/modules/customer/api/customerWishlist
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import customerWishlistApi from "../api/customerWishlist.api";

/**
 * @context CustomerWishlistContext
 * @description Estado global de lista de deseos
 *
 * Responsabilidades:
 * - CRUD completo de wishlist
 * - Price tracking (cambios de precio)
 * - Notificaciones de disponibilidad
 * - Mover items a carrito
 *
 * Contrato Backend:
 * - GET /api/wishlist
 * - POST /api/wishlist/items
 * - DELETE /api/wishlist/items/:productId
 * - DELETE /api/wishlist
 * - GET /api/wishlist/check/:productId
 * - POST /api/wishlist/move-to-cart
 * - GET /api/wishlist/price-changes
 *
 * Reglas:
 * - Un usuario solo puede tener 1 review por producto
 * - Backend previene duplicados automáticamente
 * - Price tracking opcional por item
 */

const CustomerWishlistContext = createContext(null);

export const CustomerWishlistProvider = ({ children }) => {
  // Estado principal
  const [wishlist, setWishlist] = useState(null);
  const [priceChanges, setPriceChanges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Inicializar wishlist al montar
  useEffect(() => {
    if (!initialized) {
      loadWishlist();
      loadPriceChanges();
      setInitialized(true);
    }
  }, [initialized]);

  /**
   * Cargar wishlist del backend
   */
  const loadWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customerWishlistApi.getWishlist();
      setWishlist(data);
    } catch (err) {
      setError(err);
      console.error("Error loading wishlist:", err);

      // Si el error es 404, crear wishlist vacía local
      if (err.statusCode === 404) {
        setWishlist({
          items: [],
          itemCount: 0,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cargar cambios de precio
   */
  const loadPriceChanges = useCallback(async () => {
    try {
      const data = await customerWishlistApi.getPriceChanges();
      setPriceChanges(data);
    } catch (err) {
      console.error("Error loading price changes:", err);
    }
  }, []);

  /**
   * Agregar producto a wishlist
   *
   * @param {string} productId - ID del producto
   * @param {boolean} notifyPriceChange - Notificar cambios de precio
   * @param {boolean} notifyAvailability - Notificar disponibilidad
   * @returns {Promise<Object>} Wishlist actualizada
   *
   * @throws {409} Producto ya está en wishlist
   * @throws {404} Producto no encontrado
   */
  const addItem = useCallback(
    async (
      productId,
      notifyPriceChange = false,
      notifyAvailability = false
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await customerWishlistApi.addToWishlist(
          productId,
          notifyPriceChange,
          notifyAvailability
        );
        setWishlist(data);

        return data;
      } catch (err) {
        setError(err);
        console.error("Error adding to wishlist:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Eliminar producto de wishlist
   *
   * @param {string} productId - ID del producto
   * @returns {Promise<Object>} Wishlist actualizada
   */
  const removeItem = useCallback(async (productId) => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await customerWishlistApi.removeFromWishlist(productId);
      setWishlist(data);

      return data;
    } catch (err) {
      setError(err);
      console.error("Error removing from wishlist:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Vaciar wishlist completa
   *
   * @returns {Promise<Object>} Wishlist vacía
   */
  const clearWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await customerWishlistApi.clearWishlist();
      setWishlist(data);
      setPriceChanges([]);

      return data;
    } catch (err) {
      setError(err);
      console.error("Error clearing wishlist:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verificar si un producto está en wishlist
   *
   * @param {string} productId - ID del producto
   * @returns {boolean}
   */
  const isInWishlist = useCallback(
    (productId) => {
      if (!wishlist || !wishlist.items) return false;
      return wishlist.items.some(
        (item) => item.product?._id === productId || item.product === productId
      );
    },
    [wishlist]
  );

  /**
   * Alias semántico para UI
   * Mantiene compatibilidad con componentes
   */
  const isItemInWishlist = useCallback(
    (productId) => isInWishlist(productId),
    [isInWishlist]
  );

  /**
   * Mover productos de wishlist a carrito
   *
   * @param {Array<string>} productIds - IDs de productos a mover
   * @returns {Promise<Object>} { movedItems, movedCount }
   */
  const moveToCart = useCallback(
    async (productIds) => {
      if (!productIds || productIds.length === 0) {
        throw new Error("Debe seleccionar al menos un producto");
      }

      try {
        setIsLoading(true);
        setError(null);

        const result = await customerWishlistApi.moveToCart(productIds);

        // Recargar wishlist después de mover items
        await loadWishlist();

        return result;
      } catch (err) {
        setError(err);
        console.error("Error moving to cart:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loadWishlist]
  );

  /**
   * Mover todos los items disponibles a carrito
   *
   * @returns {Promise<Object>}
   */
  const moveAllToCart = useCallback(async () => {
    if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
      throw new Error("La wishlist está vacía");
    }

    const productIds = wishlist.items
      .filter((item) => item.isAvailable)
      .map((item) => item.product._id || item.product);

    return moveToCart(productIds);
  }, [wishlist, moveToCart]);

  /**
   * Obtener items con cambios de precio
   *
   * @returns {Array} Items con cambios
   */
  const getItemsWithPriceChanges = useCallback(() => {
    if (!wishlist || !wishlist.items) return [];

    return wishlist.items.filter((item) => item.priceChanged);
  }, [wishlist]);

  /**
   * Obtener items con descuento
   *
   * @returns {Array} Items con precio reducido
   */
  const getItemsWithDiscount = useCallback(() => {
    if (!wishlist || !wishlist.items) return [];

    return wishlist.items.filter((item) => item.priceDropped);
  }, [wishlist]);

  /**
   * Obtener items sin stock
   *
   * @returns {Array} Items no disponibles
   */
  const getUnavailableItems = useCallback(() => {
    if (!wishlist || !wishlist.items) return [];

    return wishlist.items.filter((item) => !item.isAvailable);
  }, [wishlist]);

  /**
   * Recargar wishlist (útil después de cambios externos)
   */
  const refreshWishlist = useCallback(() => {
    return Promise.all([loadWishlist(), loadPriceChanges()]);
  }, [loadWishlist, loadPriceChanges]);

  /**
   * Toggle notificación de cambio de precio
   */
  const togglePriceNotification = useCallback(
    async (productId, enabled) => {
      // Primero remover
      await removeItem(productId);

      // Luego agregar con nueva configuración
      return addItem(productId, enabled, false);
    },
    [removeItem, addItem]
  );

  // Valores computados
  const itemCount = wishlist?.itemCount || 0;
  const isEmpty = !wishlist || !wishlist.items || wishlist.items.length === 0;
  const hasPriceChanges = priceChanges.length > 0;
  const hasDiscounts = getItemsWithDiscount().length > 0;
  const hasUnavailable = getUnavailableItems().length > 0;

  const value = {
    // Estado
    wishlist,
    priceChanges,
    isLoading,
    error,
    initialized,

    // Valores computados
    itemCount,
    isEmpty,
    hasPriceChanges,
    hasDiscounts,
    hasUnavailable,

    // Métodos
    loadWishlist,
    loadPriceChanges,
    addItem,
    removeItem,
    clearWishlist,

    // 👇 AQUÍ
    isInWishlist,
    isItemInWishlist,

    moveToCart,
    moveAllToCart,
    getItemsWithPriceChanges,
    getItemsWithDiscount,
    getUnavailableItems,
    refreshWishlist,
    togglePriceNotification,
  };

  return (
    <CustomerWishlistContext.Provider value={value}>
      {children}
    </CustomerWishlistContext.Provider>
  );
};

/**
 * Hook para consumir el contexto
 */
export const useCustomerWishlist = () => {
  const context = useContext(CustomerWishlistContext);
  if (!context) {
    throw new Error(
      "useCustomerWishlist must be used within CustomerWishlistProvider"
    );
  }
  return context;
};

export default CustomerWishlistContext;
