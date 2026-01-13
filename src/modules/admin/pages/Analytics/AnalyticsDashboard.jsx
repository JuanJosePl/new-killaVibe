// src/modules/admin/pages/Analytics/AnalyticsDashboard.jsx

import { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { useNavigate, Link } from 'react-router-dom';
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
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

// Paleta profesional enterprise
const COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6', 
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#A78BFA',
  pink: '#EC4899'
};

const CHART_COLORS = [
  COLORS.primary, 
  COLORS.secondary, 
  COLORS.success, 
  COLORS.warning, 
  COLORS.danger
];

const statusLabels = {
  pending: 'Pendiente',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado'
};

// Custom Tooltip Enterprise
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl p-4 min-w-[180px]">
      <p className="text-gray-300 text-xs font-medium mb-2 uppercase tracking-wider">
        {label}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4 mt-1">
          <span className="text-gray-400 text-sm flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}:
          </span>
          <span className="text-white font-bold text-sm">
            {typeof entry.value === 'number' 
              ? entry.value.toLocaleString() 
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
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
      (res) => {
        const dataToProcess = res.data || res; 

        if (!Array.isArray(dataToProcess)) {
          console.error('Data no es un array:', dataToProcess);
          return;
        }

        const formatted = dataToProcess.map(item => ({
          month: item.month,
          revenue: item.revenue, 
          orders: item.orders
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  const orderStatusData = Object.entries(analytics.orders?.statusDistribution || {}).map(([status, count]) => ({
    name: statusLabels[status] || status,
    value: count
  }));

  const topProductsData = (analytics.products?.topSelling || []).slice(0, 5).map(product => ({
    name: product.name.slice(0, 20) + '...',
    sales: product.soldCount
  }));

  const ratingsData = Object.entries(analytics.reviews?.ratingDistribution || {}).map(([rating, count]) => ({
    rating: `${rating}⭐`,
    count
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-8 animate-fadeIn">
      
      {/* Header Section */}
      <div className="max-w-[1600px] mx-auto mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="animate-slideInLeft">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-800">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(analytics.period?.startDate).toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
                <span className="text-blue-400 dark:text-blue-500">→</span>
                {new Date(analytics.period?.endDate).toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>

          {/* Enhanced Date Range Selector */}
          <div className="relative animate-slideInRight">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none pl-12 pr-10 py-3.5 
                       border-2 border-gray-200 dark:border-gray-700 
                       rounded-xl 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-white
                       font-medium text-sm
                       shadow-sm hover:shadow-md
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-200
                       cursor-pointer
                       hover:border-blue-400 dark:hover:border-blue-500"
            >
              <option value="last7days">Últimos 7 días</option>
              <option value="last30days">Últimos 30 días</option>
              <option value="last90days">Últimos 90 días</option>
              <option value="thisYear">Este año</option>
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Revenue Total"
            value={`$${(analytics.revenue?.totalRevenue || 0).toLocaleString()}`}
            subtitle={`${analytics.revenue?.totalOrders || 0} órdenes`}
            trend={analytics.revenue?.revenueGrowth}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            gradient="from-emerald-500 to-teal-600"
            delay="0"
          />
          <KPICard
            title="Valor Promedio"
            value={`$${Number(analytics.revenue?.avgOrderValue || 0).toFixed(2)}`}
            subtitle="Por orden"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            gradient="from-blue-500 to-indigo-600"
            delay="100"
          />
          <KPICard
            title="Nuevos Usuarios"
            value={analytics.users?.newUsers || 0}
            subtitle={`${analytics.users?.userGrowth || 0}% vs anterior`}
            trend={analytics.users?.userGrowth}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            gradient="from-purple-500 to-pink-600"
            delay="200"
          />
          <KPICard
            title="Rating Promedio"
            value={Number(analytics.reviews?.avgRating || 0).toFixed(1)}
            subtitle={`${analytics.reviews?.totalReviews || 0} reviews`}
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            }
            gradient="from-amber-500 to-orange-600"
            delay="300"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Revenue Chart */}
          <ChartCard 
            title="Revenue Mensual" 
            subtitle="Últimos 12 meses"
            delay="400"
          >
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Orders Status Pie */}
          <ChartCard 
            title="Órdenes por Estado" 
            subtitle="Distribución actual"
            delay="500"
          >
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#1F2937"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      className="hover:opacity-80 transition-opacity duration-200"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top Products */}
          <ChartCard 
            title="Top Productos" 
            subtitle="Los 5 más vendidos"
            delay="600"
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topProductsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
                <Bar 
                  dataKey="sales" 
                  fill="url(#barGradient)" 
                  name="Ventas"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Ratings Distribution */}
          <ChartCard 
            title="Calificaciones" 
            subtitle="Distribución de reviews"
            delay="700"
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={ratingsData}>
                <defs>
                  <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="rating" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }} />
                <Bar 
                  dataKey="count" 
                  fill="url(#ratingGradient)" 
                  name="Cantidad"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Bottom Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Low Stock Products */}
          <InfoCard 
            title="Productos Bajo Stock" 
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            accentColor="red"
            delay="800"
          >
            <div className="space-y-2">
              {(analytics.products?.lowStockProducts || []).slice(0, 5).map((product, index) => (
                <Link 
                  key={index} 
                  to={`/admin/products/edit/${product._id}`}
                  className="group flex items-center justify-between p-3 
                           bg-gray-50 dark:bg-gray-800/50 
                           hover:bg-red-50 dark:hover:bg-red-900/10
                           border border-gray-200 dark:border-gray-700
                           hover:border-red-300 dark:hover:border-red-800
                           rounded-lg transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
              {(!analytics.products?.lowStockProducts || analytics.products.lowStockProducts.length === 0) && (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Stock saludable</p>
                </div>
              )}
            </div>
          </InfoCard>

          {/* Most Viewed Products */}
          <InfoCard 
            title="Productos Más Vistos"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            accentColor="purple"
            onClick={() => navigate('/admin/products')}
            delay="900"
          >
            <div className="space-y-2">
              {(analytics.products?.mostViewed || []).slice(0, 5).map((product, index) => (
                <div 
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/products/edit/${product._id}`);
                  }}
                  className="group flex items-center justify-between p-3 
                           bg-gray-50 dark:bg-gray-800/50 
                           hover:bg-purple-50 dark:hover:bg-purple-900/10
                           border border-gray-200 dark:border-gray-700
                           hover:border-purple-300 dark:hover:border-purple-800
                           rounded-lg transition-all duration-200 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {product.name}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-gray-600 dark:text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {product.views.toLocaleString()} vistas
                    </span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </InfoCard>

          {/* User Statistics */}
          <InfoCard 
            title="Estadísticas de Usuarios"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            accentColor="blue"
            onClick={() => navigate('/admin/users')}
            delay="1000"
          >
            <div className="space-y-4">
              <StatRow 
                label="Total usuarios" 
                value={analytics.users?.totalUsers || 0}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
              <StatRow 
                label="Usuarios activos" 
                value={analytics.users?.activeUsers || 0}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
              />
              <StatRow 
                label="Nuevos usuarios" 
                value={analytics.users?.newUsers || 0}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                }
              />
              <StatRow 
                label="Crecimiento" 
                value={`${Number(analytics.users?.userGrowth || 0).toFixed(1)}%`}
                trend={analytics.users?.userGrowth}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
              />
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// HELPER COMPONENTS
// ==============================================================================

function KPICard({ title, value, subtitle, trend, icon, gradient, delay }) {
  return (
    <div 
      className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl 
                 border border-gray-200 dark:border-gray-700 
                 overflow-hidden transition-all duration-300 hover:-translate-y-1
                 animate-slideInUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
      </div>

      <div className="relative p-6">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} 
                       flex items-center justify-center text-white mb-5
                       shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>

        {/* Title */}
        <div className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
          {title}
        </div>

        {/* Value */}
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          {value}
        </div>

        {/* Subtitle & Trend */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </span>
          {trend !== undefined && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              trend >= 0 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              <svg className={`w-3 h-3 ${trend >= 0 ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${gradient} pointer-events-none`}></div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, delay }) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg 
                 border border-gray-200 dark:border-gray-700 
                 p-6 hover:shadow-xl transition-all duration-300
                 animate-slideInUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function InfoCard({ title, icon, accentColor, onClick, children, delay }) {
  const colors = {
    red: {
      accent: 'from-red-500 to-rose-600',
      hover: 'hover:border-red-300 dark:hover:border-red-700'
    },
    purple: {
      accent: 'from-purple-500 to-violet-600',
      hover: 'hover:border-purple-300 dark:hover:border-purple-700'
    },
    blue: {
      accent: 'from-blue-500 to-cyan-600',
      hover: 'hover:border-blue-300 dark:hover:border-blue-700'
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg 
                 border border-gray-200 dark:border-gray-700 
                 ${colors[accentColor].hover}
                 p-6 transition-all duration-300 hover:shadow-xl
                 ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}
                 animate-slideInUp`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[accentColor].accent} 
                         flex items-center justify-center text-white shadow-lg`}>
            {icon}
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        {onClick && (
          <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
      {children}
    </div>
  );
}

function StatRow({ label, value, trend, icon }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg 
                    bg-gray-50 dark:bg-gray-700/50 
                    border border-gray-200 dark:border-gray-600
                    hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {value}
        </span>
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${
            trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            <svg className={`w-3.5 h-3.5 ${trend >= 0 ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}