// src/modules/customer/layout/CustomerLayout.jsx - VERSIÓN PREMIUM MODULAR

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useCustomerProfile } from "../../customer/context/CustomerProfileContext";
import { useCustomerCart } from "../../customer/context/CustomerCartContext";
import { useCustomerWishlist } from "../../customer/context/CustomerWishlistContext";

// ✅ Componentes modulares
import SidebarDesktop from "./components/SidebarDesktop";
import SidebarMobile from "./components/SidebarMobile";
import TopNavbar from "./components/TopNavbar";
import Footer from "./components/Footer";
import MobileOverlay from "./components/MobileOverlay";

/**
 * ============================================
 * 🎨 CUSTOMER LAYOUT PREMIUM
 * ============================================
 * 
 * Layout modular con:
 * ✅ Sidebar Desktop/Mobile separados
 * ✅ TopNavbar con dropdown de usuario
 * ✅ Footer moderno e interactivo
 * ✅ Animaciones avanzadas
 * ✅ Componentes reutilizables
 * ✅ Badges dinámicos
 * ✅ Modal de logout con confirmación
 */
const CustomerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile } = useCustomerProfile();
  const { itemCount: cartItems } = useCustomerCart();
  const { itemCount: wishlistItems } = useCustomerWishlist();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // ============================================
  // 📋 CONFIGURACIÓN DE MENÚ
  // ============================================
  const menuSections = [
    {
      title: "Principal",
      items: [
        { path: "/customer", icon: "📊", label: "Dashboard", end: true },
        { path: "/customer/products", icon: "🛍️", label: "Productos" },
        {
          path: "/customer/categories",
          icon: "📂",
          label: "Categorías",
          badge: "Nuevo",
          badgeType: "new",
        },
      ],
    },
    {
      title: "Mis Compras",
      items: [
        {
          path: "/customer/cart",
          icon: "🛒",
          label: "Carrito",
          badge: cartItems,
          badgeType: "danger",
        },
        {
          path: "/customer/wishlist",
          icon: "❤️",
          label: "Favoritos",
          badge: wishlistItems,
          badgeType: "danger",
        },
        { path: "/customer/orders", icon: "📦", label: "Mis Órdenes" },
      ],
    },
    {
      title: "Mi Cuenta",
      items: [
        { path: "/customer/profile", icon: "👤", label: "Perfil" },
        { path: "/customer/reviews", icon: "⭐", label: "Reseñas" },
        { path: "/customer/contact", icon: "📧", label: "Contacto" },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ============================================
          SIDEBAR DESKTOP
          ============================================ */}
      <SidebarDesktop 
        menuSections={menuSections}
        profile={profile}
      />

      {/* ============================================
          MOBILE OVERLAY
          ============================================ */}
      <MobileOverlay 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* ============================================
          SIDEBAR MOBILE
          ============================================ */}
      <SidebarMobile
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        menuSections={menuSections}
        profile={profile}
      />

      {/* ============================================
          MAIN CONTENT AREA
          ============================================ */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* TOP NAVBAR */}
        <TopNavbar
          onToggleSidebar={toggleSidebar}
          profile={profile}
          cartItems={cartItems}
          wishlistItems={wishlistItems}
        />

        {/* PAGE CONTENT (Outlet de React Router) */}
        <div className="flex-1">
          <Outlet />
        </div>

        {/* FOOTER */}
        <Footer />
      </main>
    </div>
  );
};

export default CustomerLayout;