import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { formatPrice, formatAttributes, getStockMessage } from '../utils/cartHelpers';
import { getPrimaryImage } from '../../products/utils/productHelpers';
import { CART_LIMITS } from '../types/cart.types';
import productsAPI from '../../products/api/products.api';

/**
 * @component CartItem
 * @description Tarjeta individual de producto en el carrito
 */
const CartItem = ({
  item,
  onUpdateQuantity,
  onRemove,
  loading = false,
  disabled = false,
}) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  const product = item.product || {};
  const hasDiscount = item.discount > 0;
  const itemTotal = item.price * item.quantity;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Imagen calculada
  const [imageUrl, setImageUrl] = useState(() => getPrimaryImage(product));

  useEffect(() => {
    let isMounted = true;

    const hasLocalImage =
      (Array.isArray(product.images) && product.images.length > 0) ||
      product.image ||
      product.primaryImage ||
      product.mainImage ||
      product.mainImageUrl ||
      product.thumbnail;

    if (hasLocalImage) {
      setImageUrl(getPrimaryImage(product));
      return;
    }

    const fetchFullProduct = async () => {
      try {
        if (!product._id && !product.id && !product.slug) return;

        let response;
        if (product.slug) {
          response = await productsAPI.getProductBySlug(product.slug);
        } else {
          const id = product._id || product.id;
          response = await productsAPI.getProductById(id);
        }

        if (!isMounted || !response?.success || !response.data) return;

        const fullProduct = response.data;
        setImageUrl(getPrimaryImage(fullProduct));
      } catch (error) {
        console.error('[CartItem] Error cargando imagen completa del producto:', error);
      }
    };

    fetchFullProduct();

    return () => {
      isMounted = false;
    };
  }, [product._id, product.id, product.slug]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleQuantityChange = async (newQuantity) => {
    // Validar límites
    if (newQuantity < 1 || newQuantity > CART_LIMITS.MAX_QUANTITY) return;

    // Validar stock disponible
    if (newQuantity > product.stock) {
      toast.error(`Solo hay ${product.stock} unidades disponibles`);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateQuantity(product._id, newQuantity, item.attributes);
      setQuantity(newQuantity);
    } catch (error) {
      console.error('[CartItem] Error actualizando cantidad:', error);
      setQuantity(item.quantity);
      toast.error(error.message || 'Error al actualizar cantidad');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrement = () => {
    handleQuantityChange(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      handleQuantityChange(quantity - 1);
    }
  };

  const handleRemove = async () => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      await onRemove(product._id, item.attributes);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow relative">
      {/* Imagen del Producto */}
      <div className="relative flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            const placeholder = e.target.nextElementSibling;
            if (placeholder) placeholder.style.display = 'flex';
          }}
        />
        <div
          className="absolute inset-0 hidden items-center justify-center text-gray-400 text-xs bg-gray-100"
        >
          Sin imagen
        </div>
      </div>

      {/* Información del Producto */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {product.name}
            </h3>

            {/* Atributos */}
            {item.attributes && Object.keys(item.attributes).length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {formatAttributes(item.attributes)}
              </p>
            )}

            {/* Precio */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(item.price)}
              </span>
              {hasDiscount && item.originalPrice && (
                <>
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(item.originalPrice)}
                  </span>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                    -{item.discount}%
                  </span>
                </>
              )}
            </div>

            {/* Stock Warning */}
            {isLowStock && (
              <p className="text-xs text-orange-600 font-medium mt-1">
                {getStockMessage(product.stock)}
              </p>
            )}
          </div>

          {/* Subtotal del Item */}
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {formatPrice(itemTotal)}
            </p>
          </div>
        </div>

        {/* Controles de Cantidad y Eliminar */}
        <div className="flex items-center justify-between mt-4">
          {/* Selector de Cantidad */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrement}
              disabled={disabled || loading || isUpdating || quantity <= 1}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Disminuir cantidad"
            >
              <span className="text-lg">−</span>
            </button>

            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) {
                  handleQuantityChange(val);
                }
              }}
              disabled={disabled || loading || isUpdating}
              className="w-16 text-center border border-gray-300 rounded-md py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={CART_LIMITS.MIN_QUANTITY}
              max={Math.min(
                CART_LIMITS.MAX_QUANTITY,
                product.stock || CART_LIMITS.MAX_QUANTITY
              )}
            />

            <button
              onClick={handleIncrement}
              disabled={
                disabled || 
                loading || 
                isUpdating || 
                quantity >= product.stock
              }
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Aumentar cantidad"
            >
              <span className="text-lg">+</span>
            </button>
          </div>

          {/* Botón Eliminar */}
          <button
            onClick={handleRemove}
            disabled={disabled || loading}
            className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Eliminar
          </button>
        </div>

        {/* Loading Overlay */}
        {(loading || isUpdating) && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItem;