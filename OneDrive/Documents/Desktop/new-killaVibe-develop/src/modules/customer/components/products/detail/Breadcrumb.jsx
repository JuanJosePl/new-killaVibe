// src/modules/customer/components/products/detail/Breadcrumb.jsx

import React from 'react';

/**
 * @component Breadcrumb
 * @description Navegación breadcrumb para product detail
 * 
 * Props:
 * - product: Objeto producto completo
 * - navigate: Función de navegación de React Router
 */
const Breadcrumb = ({ product, navigate }) => {
  if (!product) return null;

  const breadcrumbItems = [
    { label: 'Inicio', path: '/customer' },
    { label: 'Productos', path: '/customer/products' },
  ];

  // Agregar categoría si existe
  if (product.category?.name) {
    breadcrumbItems.push({
      label: product.category.name,
      path: `/customer/categories/${product.category.slug || product.category._id}`,
    });
  }

  // Producto actual (sin link)
  breadcrumbItems.push({
    label: product.name,
    path: null,
  });

  return (
    <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
          
          {item.path ? (
            <button
              onClick={() => navigate(item.path)}
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors hover:underline"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-gray-900 font-semibold truncate max-w-xs">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;