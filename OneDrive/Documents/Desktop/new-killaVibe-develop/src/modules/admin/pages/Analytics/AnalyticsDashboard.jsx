// src/modules/admin/pages/Analytics/AnalyticsDashboard.jsx

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdmin } from "../../hooks/useAdmin";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─── Paleta semántica ─────────────────────────────────────────────────────────
const C = {
  revenue: "#10B981", // emerald
  orders: "#3B82F6", // blue
  aov: "#6366F1", // indigo
  users: "#8B5CF6", // violet
  conversion: "#06B6D4", // cyan
  ratings: "#F59E0B", // amber
  danger: "#EF4444", // red
  warning: "#F97316", // orange
  neutral: "#64748B", // slate
  positive: "#10B981",
  negative: "#EF4444",
};

const CHART_PALETTE = [
  C.orders,
  C.users,
  C.revenue,
  C.ratings,
  C.conversion,
  C.danger,
  C.aov,
  C.warning,
];

const STATUS_COLORS = {
  pending: C.warning,
  confirmed: C.orders,
  processing: C.aov,
  shipped: C.conversion,
  delivered: C.revenue,
  cancelled: C.danger,
  returned: C.neutral,
};

const STATUS_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  returned: "Devuelto",
};

const PAYMENT_LABELS = {
  credit_card: "Tarjeta Crédito",
  debit_card: "Tarjeta Débito",
  paypal: "PayPal",
  bank_transfer: "Transferencia",
  cash_on_delivery: "Contra Entrega",
};

const PERIOD_OPTIONS = [
  { value: "week", label: "Últimos 7 días" },
  { value: "month", label: "Últimos 30 días" },
  { value: "quarter", label: "Últimos 90 días" },
  { value: "year", label: "Este año" },
];

// ─── Utilidades ───────────────────────────────────────────────────────────────

const fmt = {
  currency: (v = 0) =>
    `$${Number(v).toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
  number: (v = 0) => Number(v).toLocaleString("es-CO"),
  percent: (v = 0) => `${Number(v).toFixed(1)}%`,
  days: (v = 0) => `${Number(v).toFixed(1)} días`,
  stars: (v = 0) => `${Number(v).toFixed(1)} ★`,
};

const getDeltaType = (v) => {
  if (v === null || v === undefined) return "neutral";
  if (v > 0) return "positive";
  if (v < 0) return "negative";
  return "neutral";
};

/** Rellena meses vacíos en el array de revenue mensual */
const fillMonthlyGaps = (data, months = 12) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  const map = {};
  data.forEach((d) => {
    map[d.month] = d;
  });

  const result = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    result.push(map[key] || { month: key, revenue: 0, orders: 0 });
  }
  return result;
};

/** Formatea un ISO-date a etiqueta corta */
const fmtDate = (dateStr) => {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};

const fmtMonth = (monthStr) => {
  if (!monthStr) return "";
  const [y, m] = monthStr.split("-");
  const names = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return `${names[parseInt(m, 10) - 1]} ${y.slice(2)}`;
};

// ─── Tooltip enterprise ───────────────────────────────────────────────────────
const EnterpriseTooltip = ({ active, payload, label, currencyKey }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-950/95 backdrop-blur border border-gray-700/60 rounded-xl shadow-2xl p-4 min-w-[180px]">
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-6 mb-1">
          <span className="flex items-center gap-2 text-gray-300 text-sm">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: entry.color }}
            />
            {entry.name}
          </span>
          <span className="text-white font-bold text-sm">
            {currencyKey && entry.dataKey === currencyKey
              ? fmt.currency(entry.value)
              : fmt.number(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700/60 rounded-lg ${className}`}
  />
);

// ─── Delta Badge ──────────────────────────────────────────────────────────────
const DeltaBadge = ({ value, size = "md" }) => {
  const type = getDeltaType(value);
  if (type === "neutral")
    return <span className="text-xs text-gray-400">—</span>;

  const positive = type === "positive";
  const sizeCls =
    size === "sm" ? "text-xs px-1.5 py-0.5" : "text-xs px-2.5 py-1 font-bold";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${sizeCls} ${
        positive
          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
          : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
      }`}
    >
      <svg
        className={`w-3 h-3 flex-shrink-0 ${positive ? "" : "rotate-180"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
      {Math.abs(value).toFixed(1)}%
    </span>
  );
};

// ─── Stock Badge ──────────────────────────────────────────────────────────────
const StockBadge = ({ stock }) => {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold animate-pulse">
        AGOTADO
      </span>
    );
  if (stock <= 3)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold">
        CRÍTICO · {stock}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold">
      BAJO · {stock}
    </span>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KPICard = ({
  title,
  value,
  subtitle,
  delta,
  deltaLabel,
  icon,
  accentColor,
  loading,
  prevValue,
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <Skeleton className="w-12 h-12 mb-4 rounded-xl" />
        <Skeleton className="w-24 h-4 mb-3" />
        <Skeleton className="w-32 h-8 mb-2" />
        <Skeleton className="w-20 h-4" />
      </div>
    );
  }

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 
                    overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: accentColor }}
      />
      <div className="p-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-white transition-transform duration-300 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${accentColor}dd, ${accentColor}88)`,
          }}
        >
          {icon}
        </div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
          {title}
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
          {value}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </span>
          {delta !== undefined && delta !== null && (
            <DeltaBadge value={delta} />
          )}
        </div>
        {prevValue && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Anterior: <span className="font-medium">{prevValue}</span>
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Mini KPI (fila secundaria) ───────────────────────────────────────────────
const MiniKPI = ({ label, value, icon, loading, alertLevel }) => {
  const alertCls = {
    ok: "border-l-emerald-500",
    warn: "border-l-amber-500",
    danger: "border-l-red-500",
    neutral: "border-l-gray-400",
  }[alertLevel || "neutral"];

  if (loading)
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-l-4 ${alertCls} p-4`}
      >
        <Skeleton className="w-16 h-4 mb-2" />
        <Skeleton className="w-24 h-6" />
      </div>
    );

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-l-4 ${alertCls} p-4
                    hover:shadow-md transition-shadow duration-200`}
    >
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
        {icon}
        {label}
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
};

// ─── Chart Card ───────────────────────────────────────────────────────────────
const ChartCard = ({
  title,
  subtitle,
  children,
  loading,
  skeletonH = 280,
  action,
}) => (
  <div
    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 
                  p-6 hover:shadow-lg transition-shadow duration-200"
  >
    <div className="flex items-start justify-between mb-6">
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
    {loading ? (
      <Skeleton className="w-full" style={{ height: skeletonH }} />
    ) : (
      children
    )}
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, description }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
    <div>
      <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">
        {title}
      </h2>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      )}
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ message = "Sin datos para este período", icon }) => (
  <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-600">
    {icon || (
      <svg
        className="w-10 h-10 mb-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    )}
    <p className="text-sm font-medium">{message}</p>
  </div>
);

// ─── Error State ──────────────────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-10 text-red-400">
    <svg
      className="w-10 h-10 mb-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
    <p className="text-sm font-medium text-center mb-3">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-medium"
      >
        Reintentar
      </button>
    )}
  </div>
);

// ─── Stars Component ──────────────────────────────────────────────────────────
const StarRating = ({ value, max = 5 }) => {
  const filled = Math.round(value);
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${
            i < filled ? "text-amber-400" : "text-gray-300 dark:text-gray-600"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const {
    getAnalyticsDashboard,
    getMonthlyRevenue,
    loadingKpis,
    loadingCharts,
    loadingTables,
    errorKpis,
    errorCharts,
    clearError,
  } = useAdmin();

  const [period, setPeriod] = useState("month");
  const [analytics, setAnalytics] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);

  // ── Carga del dashboard analytics (KPIs + charts + tables) ─────────────────
  const loadAnalytics = useCallback(() => {
    clearError("kpis");
    getAnalyticsDashboard(
      { period },
      (data) => setAnalytics(data),
      () => {} // el error ya lo gestiona el hook
    );
  }, [period, getAnalyticsDashboard, clearError]);

  // ── Carga del revenue mensual (siempre 12 meses, independiente del período) ─
  const loadMonthlyRevenue = useCallback(() => {
    clearError("charts");
    getMonthlyRevenue(
      12,
      (data) => {
        const arr = Array.isArray(data) ? data : [];
        setMonthlyData(fillMonthlyGaps(arr, 12));
      },
      () => {}
    );
  }, [getMonthlyRevenue, clearError]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    loadMonthlyRevenue();
  }, [loadMonthlyRevenue]);

  // ─── Datos derivados (memo) ─────────────────────────────────────────────────

  const orderStatusData = useMemo(() => {
    if (!analytics?.orders?.statusDistribution) return [];
    return Object.entries(analytics.orders.statusDistribution).map(
      ([status, count]) => ({
        name: STATUS_LABELS[status] || status,
        value: count,
        color: STATUS_COLORS[status] || C.neutral,
      })
    );
  }, [analytics]);

  const paymentMethodData = useMemo(() => {
    if (!Array.isArray(analytics?.paymentMethods)) return [];
    return analytics.paymentMethods.map((pm, i) => ({
      name: PAYMENT_LABELS[pm.method] || pm.method,
      orders: pm.orders,
      revenue: pm.revenue,
      color: CHART_PALETTE[i % CHART_PALETTE.length],
    }));
  }, [analytics]);

  // ✅ CORREGIDO: usa `totalSold`, no `soldCount`
  const topProductsData = useMemo(() => {
    if (!Array.isArray(analytics?.products?.topSelling)) return [];
    return analytics.products.topSelling.slice(0, 8).map((p) => ({
      name: p.name?.length > 22 ? p.name.slice(0, 22) + "…" : p.name || "",
      ventas: p.totalSold || 0,
      revenue: p.totalRevenue || 0,
      fullName: p.name,
      id: p.productId,
      sku: p.sku,
      image: p.image,
      price: p.price,
    }));
  }, [analytics]);

  const categoryRevenueData = useMemo(() => {
    if (!Array.isArray(analytics?.categoryRevenue)) return [];
    return analytics.categoryRevenue.slice(0, 8).map((c) => ({
      name:
        c.categoryName?.length > 20
          ? c.categoryName.slice(0, 20) + "…"
          : c.categoryName || "Sin cat.",
      revenue: c.revenue || 0,
      items: c.itemsSold || 0,
    }));
  }, [analytics]);

  const ratingDistData = useMemo(() => {
    if (!analytics?.reviews?.ratingDistribution) return [];
    return [5, 4, 3, 2, 1].map((r) => ({
      rating: `${r}★`,
      count: analytics.reviews.ratingDistribution[r] || 0,
    }));
  }, [analytics]);

  const dailyOrdersData = useMemo(() => {
    if (!Array.isArray(analytics?.orders?.dailyOrders)) return [];
    return analytics.orders.dailyOrders.map((d) => ({
      ...d,
      date: fmtDate(d.date),
    }));
  }, [analytics]);

  const processingDays =
    analytics?.orders?.processingTime?.avgProcessingDays || 0;
  const processingAlert =
    processingDays === 0 ? "neutral" : processingDays > 5 ? "warn" : "ok";

  const lowStockCount = analytics?.products?.lowStock || 0;
  const lowStockAlert =
    lowStockCount === 0 ? "ok" : lowStockCount > 10 ? "danger" : "warn";

  const retentionRate = analytics?.users?.retentionRate || 0;
  const retentionAlert =
    retentionRate === 0 ? "neutral" : retentionRate >= 30 ? "ok" : "warn";

  const conversionRate = analytics?.conversionMetrics?.conversionRate || 0;
  const conversionAlert =
    conversionRate === 0
      ? "neutral"
      : conversionRate >= 3
      ? "ok"
      : conversionRate >= 1
      ? "warn"
      : "danger";

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Analytics
            </h1>
            {analytics?.period && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {new Date(analytics.period.startDate).toLocaleDateString(
                  "es-ES",
                  { day: "numeric", month: "short", year: "numeric" }
                )}
                {" → "}
                {new Date(analytics.period.endDate).toLocaleDateString(
                  "es-ES",
                  { day: "numeric", month: "short", year: "numeric" }
                )}
                <span className="text-gray-400 dark:text-gray-600 ml-2">
                  vs{" "}
                  {new Date(
                    analytics.period.previousStartDate
                  ).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
                  {" – "}
                  {new Date(
                    analytics.period.previousEndDate
                  ).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </p>
            )}
          </div>

          {/* Selector de período */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 shadow-sm">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  period === opt.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error banner KPIs */}
        {errorKpis && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">
              {errorKpis}
            </p>
            <button
              onClick={loadAnalytics}
              className="text-xs px-3 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors font-medium ml-4 flex-shrink-0"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            NIVEL 1 — KPIs Primarios
        ════════════════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader
            title="Métricas Principales"
            description="Indicadores clave del período seleccionado vs período anterior"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <KPICard
              title="Revenue Total"
              value={fmt.currency(analytics?.revenue?.totalRevenue)}
              subtitle={`${fmt.number(
                analytics?.revenue?.totalOrders
              )} órdenes`}
              delta={analytics?.revenue?.revenueGrowth}
              prevValue={
                analytics?.revenue?.comparison
                  ? fmt.currency(analytics.revenue.comparison.previousRevenue)
                  : null
              }
              accentColor={C.revenue}
              loading={loadingKpis}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <KPICard
              title="Total Órdenes"
              value={fmt.number(analytics?.orders?.totalOrders)}
              subtitle="En el período"
              delta={analytics?.orders?.ordersGrowth}
              prevValue={
                analytics?.orders?.comparison
                  ? fmt.number(analytics.orders.comparison.previousOrders)
                  : null
              }
              accentColor={C.orders}
              loading={loadingKpis}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              }
            />
            <KPICard
              title="Valor Promedio"
              value={fmt.currency(analytics?.revenue?.avgOrderValue)}
              subtitle="Por orden (AOV)"
              delta={analytics?.revenue?.aovGrowth}
              prevValue={
                analytics?.revenue?.comparison
                  ? fmt.currency(analytics.revenue.comparison.previousAOV)
                  : null
              }
              accentColor={C.aov}
              loading={loadingKpis}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
            />
            <KPICard
              title="Nuevos Usuarios"
              value={fmt.number(analytics?.users?.newUsers)}
              subtitle={`de ${fmt.number(
                analytics?.users?.totalUsers
              )} totales`}
              delta={analytics?.users?.userGrowth}
              prevValue={
                analytics?.users?.comparison
                  ? fmt.number(analytics.users.comparison.previousNewUsers)
                  : null
              }
              accentColor={C.users}
              loading={loadingKpis}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
            />
            <KPICard
              title="Tasa Conversión"
              value={fmt.percent(analytics?.conversionMetrics?.conversionRate)}
              subtitle={`${fmt.number(
                analytics?.conversionMetrics?.totalBuyers
              )} compradores`}
              accentColor={C.conversion}
              loading={loadingKpis}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              }
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            NIVEL 2 — KPIs Operacionales (mini)
        ════════════════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader title="Indicadores Operacionales" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MiniKPI
              label="Retención de Clientes"
              value={fmt.percent(analytics?.users?.retentionRate)}
              alertLevel={retentionAlert}
              loading={loadingKpis}
              icon={
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              }
            />
            <MiniKPI
              label="Clientes Recurrentes"
              value={fmt.number(analytics?.users?.recurringCustomers)}
              alertLevel="neutral"
              loading={loadingKpis}
              icon={
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              }
            />
            <MiniKPI
              label="Tiempo Promedio Entrega"
              value={
                processingDays > 0 ? fmt.days(processingDays) : "Sin datos"
              }
              alertLevel={processingAlert}
              loading={loadingKpis}
              icon={
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <MiniKPI
              label="Alertas de Stock"
              value={
                lowStockCount > 0
                  ? `${lowStockCount} productos`
                  : "Stock saludable"
              }
              alertLevel={lowStockAlert}
              loading={loadingKpis}
              icon={
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              }
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            NIVEL 3 — Charts principales
        ════════════════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader
            title="Tendencias"
            description="Evolución temporal del negocio"
          />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Órdenes diarias — área doble eje (2/3 ancho) */}
            <div className="xl:col-span-2">
              <ChartCard
                title="Actividad Diaria"
                subtitle={`Órdenes y revenue por día · ${
                  PERIOD_OPTIONS.find((o) => o.value === period)?.label
                }`}
                loading={loadingKpis}
                skeletonH={320}
              >
                {dailyOrdersData.length === 0 ? (
                  <EmptyState message="Sin actividad diaria en este período" />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart
                      data={dailyOrdersData}
                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="gRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={C.revenue}
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor={C.revenue}
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="gOrders"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={C.orders}
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor={C.orders}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E5E7EB"
                        strokeOpacity={0.4}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#9CA3AF"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#9CA3AF"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        content={<EnterpriseTooltip currencyKey="revenue" />}
                      />
                      <Legend
                        formatter={(v) => (
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {v}
                          </span>
                        )}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke={C.revenue}
                        strokeWidth={2.5}
                        fill="url(#gRevenue)"
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="count"
                        name="Órdenes"
                        stroke={C.orders}
                        strokeWidth={2}
                        strokeDasharray="6 3"
                        fill="url(#gOrders)"
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Revenue por categoría (1/3 ancho) */}
            <ChartCard
              title="Revenue por Categoría"
              subtitle="Top 8 categorías · período actual"
              loading={loadingKpis}
              skeletonH={320}
            >
              {categoryRevenueData.length === 0 ? (
                <EmptyState message="Sin datos de categorías" />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={categoryRevenueData}
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                      strokeOpacity={0.4}
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="#9CA3AF"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#9CA3AF"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip
                      content={<EnterpriseTooltip currencyKey="revenue" />}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill={C.aov}
                      radius={[0, 6, 6, 0]}
                      maxBarSize={22}
                    >
                      {categoryRevenueData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={`rgba(99,102,241,${1 - i * 0.09})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </section>

        {/* Revenue mensual (always 12 months) */}
        <section>
          <ChartCard
            title="Revenue Mensual"
            subtitle="Últimos 12 meses · total acumulado por mes"
            loading={loadingCharts}
            skeletonH={240}
          >
            {errorCharts ? (
              <ErrorState message={errorCharts} onRetry={loadMonthlyRevenue} />
            ) : monthlyData.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="gMonthly" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={C.revenue}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={C.revenue}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                    strokeOpacity={0.4}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={fmtMonth}
                    interval={1}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={<EnterpriseTooltip currencyKey="revenue" />}
                  />
                  <Legend
                    formatter={(v) => (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {v}
                      </span>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={C.revenue}
                    strokeWidth={2.5}
                    fill="url(#gMonthly)"
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    name="Órdenes"
                    stroke={C.orders}
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 3"
                    yAxisId={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            NIVEL 4 — Charts secundarios (distribuciones)
        ════════════════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader
            title="Distribuciones"
            description="Composición de órdenes, pagos y reseñas"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Estado de órdenes */}
            <ChartCard
              title="Estado de Órdenes"
              loading={loadingKpis}
              skeletonH={240}
            >
              {orderStatusData.length === 0 ? (
                <EmptyState />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                    >
                      {orderStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} opacity={0.9} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [fmt.number(v), n]} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(v) => (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {v}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Métodos de pago */}
            <ChartCard
              title="Métodos de Pago"
              loading={loadingKpis}
              skeletonH={240}
            >
              {paymentMethodData.length === 0 ? (
                <EmptyState message="Sin datos de pagos" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      dataKey="orders"
                      nameKey="name"
                      stroke="none"
                    >
                      {paymentMethodData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} opacity={0.9} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, n) => [fmt.number(v) + " órdenes", n]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(v) => (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {v}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Distribución de ratings */}
            <ChartCard
              title="Distribución de Ratings"
              subtitle="Reviews aprobadas"
              loading={loadingKpis}
              skeletonH={240}
            >
              {ratingDistData.every((d) => d.count === 0) ? (
                <EmptyState message="Sin reviews en este período" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={ratingDistData}
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                      strokeOpacity={0.4}
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="#9CA3AF"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="rating"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={30}
                    />
                    <Tooltip formatter={(v) => [fmt.number(v), "Reviews"]} />
                    <Bar
                      dataKey="count"
                      name="Reviews"
                      fill={C.ratings}
                      radius={[0, 6, 6, 0]}
                      maxBarSize={22}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            NIVEL 5 — Tablas informativas
        ════════════════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader
            title="Tablas de Análisis"
            description="Top productos, alertas de inventario y mejores reseñas"
          />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Top productos vendidos */}
            <div className="xl:col-span-2">
              <ChartCard
                title="Top Productos Vendidos"
                subtitle={`Período actual · ${topProductsData.length} productos`}
                loading={loadingKpis}
                skeletonH={340}
              >
                {topProductsData.length === 0 ? (
                  <EmptyState message="Sin ventas en este período" />
                ) : (
                  <>
                    {/* Chart de barras mini */}
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart
                        data={topProductsData}
                        margin={{ top: 0, right: 10, left: 0, bottom: 50 }}
                      >
                        <defs>
                          <linearGradient
                            id="gBars"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor={C.users} />
                            <stop offset="100%" stopColor={C.aov} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#E5E7EB"
                          strokeOpacity={0.4}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          stroke="#9CA3AF"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          angle={-20}
                          textAnchor="end"
                          height={55}
                        />
                        <YAxis
                          stroke="#9CA3AF"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          content={<EnterpriseTooltip currencyKey="revenue" />}
                          cursor={{ fill: "rgba(99,102,241,0.06)" }}
                        />
                        <Bar
                          dataKey="ventas"
                          name="Unidades"
                          fill="url(#gBars)"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Tabla debajo del chart */}
                    <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-700/60">
                      {topProductsData.slice(0, 5).map((p, i) => (
                        <div
                          key={i}
                          onClick={() =>
                            p.id && navigate(`/admin/products/edit/${p.id}`)
                          }
                          className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg px-2 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                i === 0
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  : i === 1
                                  ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                  : i === 2
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500"
                              }`}
                            >
                              {i + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {p.fullName || p.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                SKU: {p.sku} · ${p.price}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {fmt.currency(p.revenue)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {fmt.number(p.ventas)} uds.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </ChartCard>
            </div>

            {/* Columna derecha: Low Stock + Top Rated */}
            <div className="space-y-6">
              {/* Bajo Stock */}
              <ChartCard
                title="Alertas de Stock"
                subtitle={
                  lowStockCount > 0
                    ? `${lowStockCount} productos requieren atención`
                    : "Inventario saludable"
                }
                loading={loadingKpis}
                skeletonH={160}
                action={
                  lowStockCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold animate-pulse">
                      {lowStockCount} alertas
                    </span>
                  )
                }
              >
                {!analytics?.products?.lowStockProducts?.length ? (
                  <div className="flex flex-col items-center justify-center py-8 text-emerald-500">
                    <svg
                      className="w-10 h-10 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm font-medium">Todo en orden</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {analytics.products.lowStockProducts.map((product, i) => (
                      <Link
                        key={i}
                        to={`/admin/products/edit/${product._id}`}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/40 hover:bg-red-50 dark:hover:bg-red-900/10 border border-transparent hover:border-red-200 dark:hover:border-red-800/50 transition-all group"
                      >
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {product.name}
                        </p>
                        <StockBadge stock={product.stock} />
                      </Link>
                    ))}
                  </div>
                )}
              </ChartCard>

              {/* Top Rated Products */}
              <ChartCard
                title="Mejor Calificados"
                subtitle="Productos con ≥3 reviews aprobadas"
                loading={loadingKpis}
                skeletonH={160}
              >
                {!analytics?.reviews?.topRatedProducts?.length ? (
                  <EmptyState message="Sin productos calificados" />
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {analytics.reviews.topRatedProducts
                      .slice(0, 6)
                      .map((p, i) => (
                        <div
                          key={i}
                          onClick={() =>
                            navigate(`/admin/products/edit/${p._id}`)
                          }
                          className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/40 hover:bg-amber-50 dark:hover:bg-amber-900/10 border border-transparent hover:border-amber-200 dark:hover:border-amber-800/50 transition-all cursor-pointer"
                        >
                          <p className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1 mr-3 font-medium">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <StarRating value={p.rating?.average || 0} />
                            <span className="text-xs text-gray-400">
                              ({p.rating?.count || 0})
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </ChartCard>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            NIVEL 6 — Tabla: Mejor Conversión
        ════════════════════════════════════════════════════════════════════ */}
        {analytics?.products?.bestConversion?.length > 0 && (
          <section>
            <SectionHeader
              title="Análisis de Conversión"
              description="Productos con mayor tasa de vistas → ventas en el período"
            />
            <ChartCard
              title="Productos con Mejor Conversión"
              subtitle="Calculado sobre vistas acumuladas vs unidades vendidas en el período"
              loading={loadingKpis}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700/60">
                      <th className="text-left py-3 font-semibold">Producto</th>
                      <th className="text-right py-3 font-semibold">Vistas</th>
                      <th className="text-right py-3 font-semibold">Ventas</th>
                      <th className="text-right py-3 font-semibold pr-2">
                        Conversión
                      </th>
                      <th className="py-3 w-40"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
                    {analytics.products.bestConversion
                      .slice(0, 8)
                      .map((p, i) => (
                        <tr
                          key={i}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors"
                        >
                          <td className="py-3 font-medium text-gray-900 dark:text-white">
                            {p.name}
                          </td>
                          <td className="py-3 text-right text-gray-500">
                            {fmt.number(p.views)}
                          </td>
                          <td className="py-3 text-right text-gray-500">
                            {fmt.number(p.sales)}
                          </td>
                          <td
                            className="py-3 text-right pr-2 font-bold"
                            style={{ color: C.conversion }}
                          >
                            {fmt.percent(p.conversionRate)}
                          </td>
                          <td className="py-3 pl-3">
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(
                                    p.conversionRate * 5,
                                    100
                                  )}%`,
                                  background: `linear-gradient(90deg, ${C.conversion}, ${C.orders})`,
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </section>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-gray-400 dark:text-gray-600 border-t border-gray-200 dark:border-gray-800">
          <span>Actualizado en tiempo real</span>
          <span>·</span>
          <button
            onClick={loadAnalytics}
            className="hover:text-blue-500 transition-colors font-medium flex items-center gap-1"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refrescar
          </button>
        </div>
      </div>
    </div>
  );
}
