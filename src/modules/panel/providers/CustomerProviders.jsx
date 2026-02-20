// src/modules/customer/providers/CustomerProviders.jsx

import React from "react";
import { CustomerProfileProvider } from "../../customer/context/CustomerProfileContext";
import { CustomerCartProvider } from "../../customer/context/CustomerCartContext";
import { CustomerWishlistProvider } from "../../customer/context/CustomerWishlistContext";
import { CustomerActivityProvider } from "../../customer/context/CustomerActivityContext";
import { CustomerProductsProvider } from "../../customer/context/CustomerProductsContext";
import { CustomerCategoriesProvider } from "../../customer/context/CustomerCategoriesContext";
import { CustomerReviewsProvider } from "../../customer/context/CustomerReviewsContext";
import { CustomerOrdersProvider } from "../../orders/CustomerOrdersContext";
import { CustomerContactProvider } from "../../customer/context/CustomerContactContext";

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
