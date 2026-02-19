/**
 * @module wishlist.model
 * @description Entidades canónicas del dominio Wishlist.
 *
 * Este archivo es la única fuente de verdad sobre la forma de los datos.
 * Todo el sistema (store, repository, hooks) habla en estos términos.
 *
 * NO importa nada de React, Zustand, axios, ni localStorage.
 * Es JavaScript puro, testeable en aislamiento.
 */

// ============================================================================
// CONSTANTES DE DOMINIO
// ============================================================================

/**
 * Modos de persistencia disponibles.
 * El repository usa esto para saber qué adapter activar.
 */
export const WishlistMode = Object.freeze({
  GUEST: 'guest',
  AUTHENTICATED: 'authenticated',
});

/**
 * Estados posibles del proceso de sincronización guest → auth.
 */
export const SyncStatus = Object.freeze({
  IDLE: 'idle',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
});

// ============================================================================
// RESOLUCIÓN DE ID
// ============================================================================

/**
 * Extrae el ID de producto de cualquier forma que pueda venir un item.
 *
 * Problema que resuelve: este lookup estaba duplicado en 3 archivos distintos
 * con la cadena: item.product?._id || item.product?.id || item.productId || ...
 *
 * @param {Object} rawItem - Item en cualquier formato (API response, localStorage, etc.)
 * @returns {string|null} ID normalizado como string, o null si no se puede resolver
 */
export const resolveProductId = (rawItem) => {
  if (!rawItem) return null;

  const id =
    rawItem.product?._id ||
    rawItem.product?.id ||
    rawItem.productId ||
    rawItem._id ||
    rawItem.id ||
    null;

  return id ? String(id) : null;
};

// ============================================================================
// CONSTRUCTORES / NORMALIZADORES
// ============================================================================

/**
 * Crea un WishlistItem canónico a partir de cualquier fuente de datos.
 *
 * Acepta tanto el formato de la API (con `product` populado)
 * como el formato del localStorage (con solo `productId`).
 *
 * @param {Object} raw - Dato crudo de cualquier fuente
 * @returns {WishlistItem} Entidad normalizada
 *
 * @typedef {Object} WishlistItem
 * @property {string} productId           - ID del producto (siempre resuelto)
 * @property {Object|null} product        - Datos del producto populados (o null si no disponible)
 * @property {boolean} notifyPriceChange  - Notificar cambios de precio
 * @property {boolean} notifyAvailability - Notificar disponibilidad
 * @property {string} addedAt            - ISO timestamp de cuándo fue agregado
 * @property {boolean} isAvailable       - Si el producto está disponible (stock + publicado)
 * @property {boolean} priceChanged      - Si el precio cambió desde que se agregó
 * @property {boolean} priceDropped      - Si el precio bajó (subconjunto de priceChanged)
 * @property {number|null} priceWhenAdded - Precio al momento de agregar
 * @property {number|null} priceDifference - Diferencia de precio (negativo = bajó)
 */
export const createWishlistItem = (raw) => {
  if (!raw) throw new Error('[WishlistItem] No se puede crear item desde valor nulo');

  const productId = resolveProductId(raw);
  if (!productId) throw new Error('[WishlistItem] No se pudo resolver productId');

  // El producto puede venir populado (API) o no existir (localStorage)
  const product = (typeof raw.product === 'object' && raw.product !== null)
    ? raw.product
    : null;

  return {
    productId,
    product,

    // Preferencias de notificación
    notifyPriceChange: Boolean(raw.notifyPriceChange ?? false),
    notifyAvailability: Boolean(raw.notifyAvailability ?? false),

    // Timestamps
    addedAt: raw.addedAt || new Date().toISOString(),

    // Estado de disponibilidad (solo disponible si viene populado del backend)
    isAvailable: raw.isAvailable ?? null,

    // Price tracking (solo disponible en modo authenticated con backend)
    priceChanged: Boolean(raw.priceChanged ?? false),
    priceDropped: Boolean(raw.priceDropped ?? false),
    priceWhenAdded: raw.priceWhenAdded ?? null,
    priceDifference: raw.priceDifference ?? null,
  };
};

/**
 * Crea una Wishlist canónica a partir de cualquier fuente de datos.
 *
 * @param {Object} raw - Dato crudo de API o estado interno
 * @returns {Wishlist} Entidad normalizada
 *
 * @typedef {Object} Wishlist
 * @property {WishlistItem[]} items    - Lista de items normalizados
 * @property {number} itemCount        - Cantidad de items (calculado, no confiamos en el backend)
 * @property {string|null} userId      - ID del usuario dueño (null en modo guest)
 */
export const createWishlist = (raw) => {
  // Acepta null/undefined → wishlist vacía
  if (!raw) {
    return { items: [], itemCount: 0, userId: null };
  }

  const rawItems = Array.isArray(raw.items) ? raw.items : [];

  // Normalizamos cada item, descartando los que fallen silenciosamente
  const items = rawItems.reduce((acc, rawItem) => {
    try {
      acc.push(createWishlistItem(rawItem));
    } catch (err) {
      console.warn('[Wishlist] Item descartado en normalización:', rawItem, err.message);
    }
    return acc;
  }, []);

  return {
    items,
    itemCount: items.length, // Siempre calculado localmente, nunca confiamos en raw.itemCount
    userId: raw.user?._id || raw.user?.id || raw.userId || null,
  };
};

/**
 * Crea un item mínimo para persistir en localStorage (modo guest).
 * Solo guarda lo estrictamente necesario para poder sincronizar luego.
 *
 * @param {string} productId
 * @param {Object} options
 * @returns {Object} Payload minimal para localStorage
 */
export const createGuestItem = (productId, options = {}) => {
  if (!productId) throw new Error('[GuestItem] productId es requerido');

  return {
    productId: String(productId),
    notifyPriceChange: Boolean(options.notifyPriceChange ?? false),
    notifyAvailability: Boolean(options.notifyAvailability ?? false),
    addedAt: new Date().toISOString(),
  };
};

/**
 * Convierte los items de guest al formato que espera el endpoint de sync.
 * Permite transformar la estructura si el contrato del backend cambia
 * en un único lugar.
 *
 * @param {WishlistItem[]} items - Items canónicos del dominio
 * @returns {Object[]} Payload para POST /wishlist/sync
 */
export const toSyncPayload = (items) => {
  return items.map(item => ({
    productId: item.productId,
    notifyPriceChange: item.notifyPriceChange,
    notifyAvailability: item.notifyAvailability,
    addedAt: item.addedAt,
  }));
};

// ============================================================================
// ESTADO INICIAL DEL STORE
// ============================================================================

/**
 * Estado inicial canónico para el Zustand store.
 * Centralizado aquí para que el store y los tests usen exactamente el mismo shape.
 *
 * @returns {Object} Estado inicial
 */
export const createInitialState = () => ({
  wishlist: createWishlist(null),
  mode: WishlistMode.GUEST,
  loading: {
    global: false,
    items: new Set(), // Set de productIds con loading individual
  },
  error: null,
  initialized: false,
  syncStatus: SyncStatus.IDLE,
  syncResult: null, // { migratedCount, failedCount } después de sync
});