// src/modules/customer/providers/CustomerProviders.jsx

import React from "react";
import { CustomerProfileProvider } from "../context/CustomerProfileContext";
import { CustomerCartProvider } from "../context/CustomerCartContext";
import { CustomerWishlistProvider } from "../context/CustomerWishlistContext";
import { CustomerActivityProvider } from "../context/CustomerActivityContext";
import { CustomerProductsProvider } from "../context/CustomerProductsContext";
import { CustomerCategoriesProvider } from "../context/CustomerCategoriesContext";
import { CustomerReviewsProvider } from "../context/CustomerReviewsContext";
import { CustomerOrdersProvider } from "../context/CustomerOrdersContext";
import { CustomerContactProvider } from "../context/CustomerContactContext"; // ✅ NUEVO

/**
 * ============================================
 * 🔌 CUSTOMER PROVIDERS
 * ============================================
 * 
 * ✅ ORDEN DE PROVIDERS (por dependencia):
 * 1. CustomerProfileProvider - Base (autenticación)
 * 2. CustomerActivityProvider - Tracking
 * 3. CustomerCategoriesProvider - Categorías
 * 4. CustomerProductsProvider - Productos
 * 5. CustomerReviewsProvider - Reviews
 * 6. CustomerOrdersProvider - Órdenes
 * 7. CustomerCartProvider - Carrito
 * 8. CustomerWishlistProvider - Wishlist
 * 9. CustomerContactProvider - Contact ✅ AGREGADO
 */
const CustomerProviders = ({ children }) => {
  return (
    <CustomerProfileProvider>
      <CustomerActivityProvider>
        <CustomerCategoriesProvider>
          <CustomerProductsProvider>
            <CustomerReviewsProvider>
              <CustomerOrdersProvider>
                <CustomerCartProvider>
                  <CustomerWishlistProvider>
                    <CustomerContactProvider>
                      {children}
                    </CustomerContactProvider>
                  </CustomerWishlistProvider>
                </CustomerCartProvider>
              </CustomerOrdersProvider>
            </CustomerReviewsProvider>
          </CustomerProductsProvider>
        </CustomerCategoriesProvider>
      </CustomerActivityProvider>
    </CustomerProfileProvider>
  );
};

export default CustomerProviders;