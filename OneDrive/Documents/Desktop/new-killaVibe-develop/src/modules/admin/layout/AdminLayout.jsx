// src/modules/admin/layout/AdminLayout.jsx

import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/hooks/useAuth';

/**
 * @component AdminLayout
 * @description Layout principal del panel admin con sidebar y topbar
 */
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      
      {/* ====================================================================== */}
      {/* SIDEBAR */}
      {/* ====================================================================== */}
      
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64`}
      >
        <div className="h-full flex flex-col">
          
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                K
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  KillaVibes
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            
            <NavItem
              to="/admin"
              icon="📊"
              label="Dashboard"
              active={location.pathname === '/admin'}
            />
            
            <NavItem
              to="/admin/products"
              icon="📦"
              label="Productos"
              active={location.pathname.startsWith('/admin/products')}
            />
            
            <NavItem
              to="/admin/categories"
              icon="🏷️"
              label="Categorías"
              active={location.pathname.startsWith('/admin/categories')}
            />
            
            <NavItem
              to="/admin/orders"
              icon="🛒"
              label="Órdenes"
              active={location.pathname.startsWith('/admin/orders')}
            />
            
            <NavItem
              to="/admin/users"
              icon="👥"
              label="Usuarios"
              active={location.pathname.startsWith('/admin/users')}
            />

            <NavItem
              to="/admin/contact"
              icon="📧"
              label="Mensajes"
              active={location.pathname.startsWith('/admin/contact')}
            />
            
            <NavItem
              to="/admin/analytics"
              icon="📈"
              label="Analytics"
              active={location.pathname.startsWith('/admin/analytics')}
            />
            
            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
            
            <NavItem
              to="/admin/settings"
              icon="⚙️"
              label="Configuración"
              active={location.pathname.startsWith('/admin/settings')}
            />
            
          </nav>

          {/* User info + Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.profile?.firstName?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.profile?.firstName || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                  {user?.role}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition text-sm font-medium"
            >
              <span>🚪</span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ====================================================================== */}
      {/* MAIN CONTENT */}
      {/* ====================================================================== */}
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all`}>
        
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-sm font-medium"
              >
                <span>🏠</span>
                <span>Ver tienda</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>
          <Outlet />
        </main>
        
      </div>

      {/* ====================================================================== */}
      {/* MOBILE OVERLAY */}
      {/* ====================================================================== */}
      
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}

// ==============================================================================
// NAV ITEM COMPONENT
// ==============================================================================

function NavItem({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
        active
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}