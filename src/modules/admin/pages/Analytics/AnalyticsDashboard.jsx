// src/modules/admin/pages/Analytics/AnalyticsDashboard.jsx

import { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function AnalyticsDashboard() {
  const { getAnalyticsDashboard, getMonthlyRevenue, loading } = useAdmin();
  
  const [analytics, setAnalytics] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [dateRange, setDateRange] = useState('last30days');

  useEffect(() => {
    loadAnalytics();
    loadMonthlyRevenue();
  }, [dateRange]);

  const loadAnalytics = async () => {
    const options = getDateRangeOptions(dateRange);
    await getAnalyticsDashboard(
      options,
      (data) => {
        setAnalytics(data);
        console.log('[ANALYTICS] Data loaded:', data);
      },
      (err) => console.error('Error cargando analytics:', err)
    );
  };

  const loadMonthlyRevenue = async () => {
    await getMonthlyRevenue(
      12,
      (data) => {
        // Formatear datos para recharts
        const formatted = data.monthlyRevenue.map(item => ({
          month: new Date(item._id).toLocaleDateString('es-ES', { month: 'short' }),
          revenue: item.totalRevenue,
          orders: item.orderCount
        }));
        setMonthlyData(formatted);
      },
      (err) => console.error('Error cargando revenue mensual:', err)
    );
  };

  const getDateRangeOptions = (range) => {
    const now = new Date();
    const options = {};

    switch (range) {
      case 'last7days':
        options.startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last30days':
        options.startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last90days':
        options.startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'thisYear':
        options.startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    options.endDate = now;
    return options;
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Colores para gráficos
  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  // Datos para gráfico de órdenes por estado
  const orderStatusData = Object.entries(analytics.orders?.statusDistribution || {}).map(([status, count]) => ({
    name: statusLabels[status] || status,
    value: count
  }));

  // Datos para top productos
  const topProductsData = (analytics.products?.topSelling || []).slice(0, 5).map(product => ({
    name: product.name.slice(0, 20) + '...',
    sales: product.soldCount
  }));

  // Datos para distribución de ratings
  const ratingsData = Object.entries(analytics.reviews?.ratingDistribution || {}).map(([rating, count]) => ({
    rating: `${rating}⭐`,
    count
  }));

  const statusLabels = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };

  return (
    <div className="p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Período: {new Date(analytics.period?.startDate).toLocaleDateString('es-ES')} - {new Date(analytics.period?.endDate).toLocaleDateString('es-ES')}
          </p>
        </div>

        {/* Date Range Selector */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="last7days">Últimos 7 días</option>
          <option value="last30days">Últimos 30 días</option>
          <option value="last90days">Últimos 90 días</option>
          <option value="thisYear">Este año</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Revenue Total"
          value={`$${(analytics.revenue?.totalRevenue || 0).toLocaleString()}`}
          subtitle={`${analytics.revenue?.totalOrders || 0} órdenes`}
          trend={analytics.revenue?.revenueGrowth}
          icon="💰"
          color="green"
        />
        <KPICard
          title="Valor Promedio"
          value={`$${(analytics.revenue?.avgOrderValue || 0).toFixed(2)}`}
          subtitle="Por orden"
          icon="📊"
          color="blue"
        />
        <KPICard
          title="Nuevos Usuarios"
          value={analytics.users?.newUsers || 0}
          subtitle={`${analytics.users?.userGrowth || 0}% vs anterior`}
          icon="👥"
          color="purple"
        />
        <KPICard
          title="Rating Promedio"
          value={(analytics.reviews?.avgRating || 0).toFixed(1)}
          subtitle={`${analytics.reviews?.totalReviews || 0} reviews`}
          icon="⭐"
          color="yellow"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Revenue Mensual */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Revenue Mensual (12 meses)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Órdenes por Estado */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Órdenes por Estado
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 Productos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Top 5 Productos Más Vendidos
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="sales" fill="#8B5CF6" name="Ventas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución de Ratings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Distribución de Calificaciones
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="rating" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#F59E0B" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Productos Bajo Stock */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Productos Bajo Stock
          </h2>
          <div className="space-y-2">
            {(analytics.products?.lowStockProducts || []).slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {product.name}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Stock: {product.stock}
                  </p>
                </div>
              </div>
            ))}
            {(!analytics.products?.lowStockProducts || analytics.products.lowStockProducts.length === 0) && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No hay productos con bajo stock
              </p>
            )}
          </div>
        </div>

        {/* Productos Más Vistos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Productos Más Vistos
          </h2>
          <div className="space-y-2">
            {(analytics.products?.mostViewed || []).slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {product.views} vistas
                  </p>
                </div>
              </div>
            ))}
            {(!analytics.products?.mostViewed || analytics.products.mostViewed.length === 0) && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No hay datos de vistas
              </p>
            )}
          </div>
        </div>

        {/* Crecimiento de Usuarios */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Estadísticas de Usuarios
          </h2>
          <div className="space-y-4">
            <StatRow label="Total usuarios" value={analytics.users?.totalUsers || 0} />
            <StatRow label="Usuarios activos" value={analytics.users?.activeUsers || 0} />
            <StatRow label="Nuevos usuarios" value={analytics.users?.newUsers || 0} />
            <StatRow 
              label="Crecimiento" 
              value={`${(analytics.users?.userGrowth || 0).toFixed(1)}%`}
              trend={analytics.users?.userGrowth}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// HELPER COMPONENTS
// ==============================================================================

function KPICard({ title, value, subtitle, trend, icon, color }) {
  const colors = {
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-2xl mb-4`}>
        {icon}
      </div>
      <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="flex items-center gap-2">
        <div className="text-gray-500 dark:text-gray-500 text-sm">{subtitle}</div>
        {trend !== undefined && (
          <span className={`text-xs font-medium ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value, trend }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600 dark:text-gray-400 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-900 dark:text-white">{value}</span>
        {trend !== undefined && (
          <span className={`text-xs ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend >= 0 ? '↑' : '↓'}
          </span>
        )}
      </div>
    </div>
  );
}