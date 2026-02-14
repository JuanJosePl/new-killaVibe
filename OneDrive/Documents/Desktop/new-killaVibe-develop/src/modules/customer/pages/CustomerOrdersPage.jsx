// src/modules/customer/pages/CustomerOrdersPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerActivity } from "../context/CustomerActivityContext";
import customerOrdersApi from "../api/customerOrders.api";
import { OrderCard, EmptyOrders } from "../components/orders";
import { LoadingSpinner } from "../components/common";

/**
 * @page CustomerOrdersPage
 * @description Página de lista de órdenes del usuario
 */
const CustomerOrdersPage = () => {
  const navigate = useNavigate();
  const { trackPageView } = useCustomerActivity();

  // State
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelingOrderId, setCancelingOrderId] = useState(null);

  useEffect(() => {
    trackPageView("Orders");
    loadOrders();
  }, [trackPageView, statusFilter, currentPage]);

  /**
   * Cargar órdenes
   */
  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters = {
        page: currentPage,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }

      const data = await customerOrdersApi.getUserOrders(filters);
      setOrders(data.orders || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error loading orders:", err);
      setError(err.message || "Error al cargar las órdenes");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cancelar orden
   */
  const handleCancelOrder = async (orderId) => {
    setCancelingOrderId(orderId);

    try {
      await customerOrdersApi.cancelOrder(orderId);
      await loadOrders();
      alert("✓ Orden cancelada exitosamente");
    } catch (error) {
      console.error("Error canceling order:", error);
      alert(error.message || "Error al cancelar la orden");
    } finally {
      setCancelingOrderId(null);
    }
  };

  /**
   * Ver detalles de orden
   */
  const handleViewDetails = (orderId) => {
    navigate(`/customer/orders/${orderId}`);
  };

  /**
   * Verificar si se puede cancelar
   */
  const canCancelOrder = (order) => {
    return ["pending", "confirmed"].includes(order.status);
  };

  // Loading inicial
  if (isLoading && orders.length === 0) {
    return (
      <LoadingSpinner fullScreen size="xl" text="Cargando tus órdenes..." />
    );
  }

  // Empty state
  if (!isLoading && orders.length === 0 && statusFilter === "all") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyOrders />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            📦 Mis Órdenes
          </h1>
          <p className="text-gray-600 text-lg">
            Gestiona y revisa todas tus compras
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <FilterTab
            active={statusFilter === "all"}
            onClick={() => {
              setStatusFilter("all");
              setCurrentPage(1);
            }}
            label="Todas"
            count={pagination?.total}
          />
          <FilterTab
            active={statusFilter === "pending"}
            onClick={() => {
              setStatusFilter("pending");
              setCurrentPage(1);
            }}
            label="Pendientes"
            icon="⏳"
          />
          <FilterTab
            active={statusFilter === "processing"}
            onClick={() => {
              setStatusFilter("processing");
              setCurrentPage(1);
            }}
            label="En Proceso"
            icon="⚙️"
          />
          <FilterTab
            active={statusFilter === "shipped"}
            onClick={() => {
              setStatusFilter("shipped");
              setCurrentPage(1);
            }}
            label="Enviadas"
            icon="🚚"
          />
          <FilterTab
            active={statusFilter === "delivered"}
            onClick={() => {
              setStatusFilter("delivered");
              setCurrentPage(1);
            }}
            label="Entregadas"
            icon="✓"
          />
          <FilterTab
            active={statusFilter === "cancelled"}
            onClick={() => {
              setStatusFilter("cancelled");
              setCurrentPage(1);
            }}
            label="Canceladas"
            icon="✕"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Orders Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay órdenes{" "}
              {statusFilter !== "all" && `con estado "${statusFilter}"`}
            </h3>
            <button
              onClick={() => {
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas las órdenes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onViewDetails={() => handleViewDetails(order._id)}
                onCancel={() => handleCancelOrder(order._id)}
                canCancel={canCancelOrder(order)}
                isLoading={cancelingOrderId === order._id}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <Pagination
            current={currentPage}
            total={pagination.pages}
            onChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Filter Tab Component
 */
const FilterTab = ({ active, onClick, label, icon, count }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2
      ${
        active
          ? "bg-blue-600 text-white shadow-lg"
          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
      }
    `}
  >
    {icon && <span>{icon}</span>}
    <span>{label}</span>
    {count !== undefined && (
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          active ? "bg-white bg-opacity-20" : "bg-gray-100"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

/**
 * Pagination Component
 */
const Pagination = ({ current, total, onChange }) => {
  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    )
      pages.push(i);
    if (current < total - 2) pages.push("...");
    if (total > 1) pages.push(total);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        ← Anterior
      </button>

      {pages.map((page, index) =>
        page === "..." ? (
          <span key={index} className="px-2 text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={index}
            onClick={() => onChange(page)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              page === current
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        Siguiente →
      </button>
    </div>
  );
};

export default CustomerOrdersPage;
