// modules/orders/domain/order.entity.js

/**
 * @class OrderEntity
 * @description Entidad pura del dominio Order.
 * 
 * SOURCE OF TRUTH del dominio en frontend.
 * Espeja exactamente la estructura del backend (order.model.js).
 * 
 * Reglas:
 * - Sin dependencias de React, Zustand, Router o API
 * - Inmutable después de construcción (usa métodos que retornan nuevas instancias)
 * - Virtuals replicados desde el modelo de Mongoose
 * - Totales calculados por backend — el frontend NUNCA recalcula totales
 */

export class OrderEntity {
  /**
   * @param {Object} raw - Datos crudos desde API (ya parseados)
   */
  constructor(raw) {
    // Identificación
    this._id          = raw._id;
    this.orderNumber  = raw.orderNumber;

    // Relación usuario
    this.user         = raw.user;

    // Snapshot cliente (inmutable)
    this.customerInfo = Object.freeze({
      email:     raw.customerInfo?.email     ?? '',
      firstName: raw.customerInfo?.firstName ?? '',
      lastName:  raw.customerInfo?.lastName  ?? '',
      phone:     raw.customerInfo?.phone     ?? '',
    });

    // Items (snapshot inmutable)
    this.items = Object.freeze(
      (raw.items ?? []).map(item => Object.freeze({
        product:      item.product,
        productName:  item.productName  ?? '',
        productImage: item.productImage ?? '',
        sku:          item.sku          ?? '',
        quantity:     item.quantity     ?? 1,
        unitPrice:    item.unitPrice    ?? 0,
        attributes:   Object.freeze(item.attributes ?? {}),
        variant:      item.variant      ?? null,
      }))
    );

    // Montos — calculados por backend, frontend solo los muestra
    this.subtotal       = raw.subtotal       ?? 0;
    this.shippingCost   = raw.shippingCost   ?? 0;
    this.taxAmount      = raw.taxAmount      ?? 0;
    this.discountAmount = raw.discountAmount ?? 0;
    this.totalAmount    = raw.totalAmount    ?? 0;
    this.refundAmount   = raw.refundAmount   ?? 0;

    // Direcciones (snapshot)
    this.shippingAddress = raw.shippingAddress ? Object.freeze({ ...raw.shippingAddress }) : null;
    this.billingAddress  = raw.billingAddress  ? Object.freeze({ ...raw.billingAddress })  : null;

    // Métodos
    this.shippingMethod = raw.shippingMethod ?? 'standard';
    this.paymentMethod  = raw.paymentMethod  ?? null;

    // Estados (máquina de estados backend)
    this.status        = raw.status        ?? 'pending';
    this.paymentStatus = raw.paymentStatus ?? 'pending';

    // Fulfillment
    this.trackingNumber = raw.trackingNumber ?? null;

    // Notas
    this.customerNotes = raw.customerNotes ?? '';
    this.adminNotes    = raw.adminNotes    ?? '';

    // Cupón (snapshot)
    this.coupon = raw.coupon ? Object.freeze({ ...raw.coupon }) : null;

    // Timestamps de auditoría
    this.paidAt      = raw.paidAt      ? new Date(raw.paidAt)      : null;
    this.shippedAt   = raw.shippedAt   ? new Date(raw.shippedAt)   : null;
    this.deliveredAt = raw.deliveredAt ? new Date(raw.deliveredAt) : null;
    this.cancelledAt = raw.cancelledAt ? new Date(raw.cancelledAt) : null;
    this.refundedAt  = raw.refundedAt  ? new Date(raw.refundedAt)  : null;
    this.createdAt   = raw.createdAt   ? new Date(raw.createdAt)   : null;
    this.updatedAt   = raw.updatedAt   ? new Date(raw.updatedAt)   : null;

    // Virtuals del backend replicados (solo lectura)
    // Virtual: itemsCount
    this.itemsCount = this.items.reduce((total, item) => total + item.quantity, 0);

    // Virtual: totalRefundable
    this.totalRefundable = this.totalAmount - this.refundAmount;

    // Virtual: canBeCancelled
    this.canBeCancelled = (
      ['pending', 'confirmed'].includes(this.status) &&
      this.paymentStatus !== 'refunded'
    );

    // Virtual: canBeRefunded
    this.canBeRefunded = (
      this.paymentStatus === 'paid' &&
      this.refundAmount < this.totalAmount
    );

    Object.freeze(this);
  }

  // =========================================
  // MÉTODOS DE CONSULTA (PURE)
  // =========================================

  /**
   * ¿La orden puede ser devuelta?
   * Regla de negocio: status = 'delivered' y < 30 días desde entrega.
   * Espeja lógica de order.service.js#requestReturn
   */
  canBeReturned() {
    if (this.status !== 'delivered') return false;
    if (!this.deliveredAt) return false;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.deliveredAt > thirtyDaysAgo;
  }

  /**
   * ¿La orden está en un estado terminal?
   */
  isTerminal() {
    return ['cancelled', 'returned', 'delivered'].includes(this.status);
  }

  /**
   * ¿La orden está activa (en tránsito)?
   */
  isActive() {
    return ['confirmed', 'processing', 'shipped'].includes(this.status);
  }

  /**
   * Retorna un plain object serializable (para Zustand, localStorage, etc.)
   */
  toPlain() {
    return {
      _id:            this._id,
      orderNumber:    this.orderNumber,
      user:           this.user,
      customerInfo:   { ...this.customerInfo },
      items:          this.items.map(i => ({ ...i, attributes: { ...i.attributes } })),
      subtotal:       this.subtotal,
      shippingCost:   this.shippingCost,
      taxAmount:      this.taxAmount,
      discountAmount: this.discountAmount,
      totalAmount:    this.totalAmount,
      refundAmount:   this.refundAmount,
      shippingAddress: this.shippingAddress ? { ...this.shippingAddress } : null,
      billingAddress:  this.billingAddress  ? { ...this.billingAddress }  : null,
      shippingMethod:  this.shippingMethod,
      paymentMethod:   this.paymentMethod,
      status:          this.status,
      paymentStatus:   this.paymentStatus,
      trackingNumber:  this.trackingNumber,
      customerNotes:   this.customerNotes,
      adminNotes:      this.adminNotes,
      coupon:          this.coupon ? { ...this.coupon } : null,
      itemsCount:      this.itemsCount,
      totalRefundable: this.totalRefundable,
      canBeCancelled:  this.canBeCancelled,
      canBeRefunded:   this.canBeRefunded,
      paidAt:          this.paidAt?.toISOString()      ?? null,
      shippedAt:       this.shippedAt?.toISOString()   ?? null,
      deliveredAt:     this.deliveredAt?.toISOString() ?? null,
      cancelledAt:     this.cancelledAt?.toISOString() ?? null,
      refundedAt:      this.refundedAt?.toISOString()  ?? null,
      createdAt:       this.createdAt?.toISOString()   ?? null,
      updatedAt:       this.updatedAt?.toISOString()   ?? null,
    };
  }
}