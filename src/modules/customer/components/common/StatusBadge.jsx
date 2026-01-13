// src/modules/customer/components/common/StatusBadge.jsx

import React from "react";

/**
 * @component StatusBadge
 * @description Badge de estado reutilizable
 *
 * @props {string} status - Estado del item
 * @props {string} type - Tipo (order, payment, review)
 * @props {string} size - Tamaño (sm, md, lg)
 */
const StatusBadge = ({ status, type = "order", size = "sm" }) => {
  const configs = {
    order: {
      pending: {
        label: "Pendiente",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: "⏳",
      },
      confirmed: {
        label: "Confirmada",
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: "✓",
      },
      processing: {
        label: "En Proceso",
        color: "bg-purple-100 text-purple-800 border-purple-300",
        icon: "⚙️",
      },
      shipped: {
        label: "Enviada",
        color: "bg-indigo-100 text-indigo-800 border-indigo-300",
        icon: "🚚",
      },
      delivered: {
        label: "Entregada",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: "✓",
      },
      cancelled: {
        label: "Cancelada",
        color: "bg-red-100 text-red-800 border-red-300",
        icon: "✕",
      },
      returned: {
        label: "Devuelta",
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: "↩️",
      },
    },
    payment: {
      pending: {
        label: "Pendiente",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: "⏳",
      },
      paid: {
        label: "Pagado",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: "✓",
      },
      failed: {
        label: "Fallido",
        color: "bg-red-100 text-red-800 border-red-300",
        icon: "✕",
      },
      refunded: {
        label: "Reembolsado",
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: "↩️",
      },
    },
    review: {
      pending: {
        label: "Pendiente",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: "⏳",
      },
      approved: {
        label: "Aprobada",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: "✓",
      },
      rejected: {
        label: "Rechazada",
        color: "bg-red-100 text-red-800 border-red-300",
        icon: "✕",
      },
    },
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const config = configs[type]?.[status] || {
    label: status,
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: "•",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-semibold
        ${config.color}
        ${sizeClasses[size]}
      `}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
