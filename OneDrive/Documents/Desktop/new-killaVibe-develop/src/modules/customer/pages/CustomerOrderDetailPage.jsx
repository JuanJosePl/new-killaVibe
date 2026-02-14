// src/modules/customer/pages/CustomerOrderDetailPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useCustomerActivity } from "../context/CustomerActivityContext";
import customerOrdersApi from "../api/customerOrders.api";
import {
  OrderTracking,
  OrderSummary,
  AddressCard,
  ReturnModal,
  OrderItemCard,
} from "../components/orders";
import { LoadingSpinner, ConfirmDialog } from "../components/common";

/**
 * @page CustomerOrderDetailPage
 * @description Página de detalle completo de una orden
 */
const CustomerOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { trackPageView } = useCustomerActivity();

  // State
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Actions state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  useEffect(() => {
    trackPageView("OrderDetail");
    loadOrderData();

    if (searchParams.get("return") === "true") {
      setShowReturnModal(true);
    }
  }, [orderId, trackPageView]);

  /**
   * Cargar datos de la orden
   */
  const loadOrderData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [orderData, trackingData] = await Promise.all([
        customerOrdersApi.getOrderById(orderId),
        customerOrdersApi.getOrderTracking(orderId).catch(() => null),
      ]);

      setOrder(orderData);
      setTracking(trackingData);
    } catch (err) {
      console.error("Error loading order:", err);
      setError(err.message || "Error al cargar la orden");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cancelar orden
   */
  const handleCancelOrder = async () => {
    setIsCanceling(true);

    try {
      await customerOrdersApi.cancelOrder(orderId);
      await loadOrderData();
      setShowCancelConfirm(false);
      alert("✓ Orden cancelada exitosamente");
    } catch (error) {
      console.error("Error canceling order:", error);
      alert(error.message || "No se puede cancelar esta orden");
    } finally {
      setIsCanceling(false);
    }
  };

  /**
   * Solicitar devolución
   */
  const handleRequestReturn = async () => {
    if (!returnReason.trim() || returnReason.length < 10) {
      alert(
        "Por favor describe la razón de la devolución (mínimo 10 caracteres)"
      );
      return;
    }

    setIsSubmittingReturn(true);

    try {
      await customerOrdersApi.requestReturn(orderId, returnReason);
      setShowReturnModal(false);
      setReturnReason("");
      await loadOrderData();
      alert("✓ Solicitud de devolución enviada. Te contactaremos pronto.");
    } catch (error) {
      console.error("Error requesting return:", error);
      alert(error.message || "Error al solicitar devolución");
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // Loading
  if (isLoading) {
    return <LoadingSpinner fullScreen size="xl" text="Cargando orden..." />;
  }

  // Error
  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Orden no encontrada
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "No pudimos cargar esta orden"}
          </p>
          <button
            onClick={() => navigate("/customer/orders")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Ver todas las órdenes
          </button>
        </div>
      </div>
    );
  }

  const canCancel = ["pending", "confirmed"].includes(order.status);
  const canReturn = order.status === "delivered";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/customer/orders")}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-2"
          >
            ← Volver a órdenes
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Orden #{order.orderNumber}
              </h1>
              <p className="text-gray-600">
                Realizada el{" "}
                {new Date(order.createdAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {canCancel && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isCanceling}
                  className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 transition-colors"
                >
                  Cancelar Orden
                </button>
              )}

              {canReturn && (
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="bg-yellow-600 text-white px-6 py-2.5 rounded-lg hover:bg-yellow-700 font-semibold transition-colors"
                >
                  Solicitar Devolución
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tracking */}
            {tracking && (
              <OrderTracking
                timeline={tracking.timeline}
                currentStatus={order.status}
                trackingNumber={tracking.trackingNumber}
              />
            )}

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                📦 Productos
              </h3>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <OrderItemCard key={index} item={item} />
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <AddressCard
                  address={order.shippingAddress}
                  title="📍 Dirección de Envío"
                />
              </div>
            )}

            {/* Customer Notes */}
            {order.customerNotes && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📝 Notas del Cliente
                </h3>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-gray-800">{order.customerNotes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - 1/3 */}
          <div className="lg:col-span-1">
            <OrderSummary order={order} showPaymentStatus />
          </div>
        </div>

        {/* Cancel Confirmation */}
        <ConfirmDialog
          isOpen={showCancelConfirm}
          title="¿Cancelar orden?"
          message="Esta acción no se puede deshacer. ¿Estás seguro?"
          confirmText="Sí, cancelar"
          cancelText="No, mantener"
          onConfirm={handleCancelOrder}
          onCancel={() => setShowCancelConfirm(false)}
          isLoading={isCanceling}
          type="danger"
        />

        {/* Return Modal */}
        {showReturnModal && (
          <ReturnModal
            onClose={() => {
              setShowReturnModal(false);
              setReturnReason("");
            }}
            onSubmit={handleRequestReturn}
            returnReason={returnReason}
            setReturnReason={setReturnReason}
            isSubmitting={isSubmittingReturn}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerOrderDetailPage;
