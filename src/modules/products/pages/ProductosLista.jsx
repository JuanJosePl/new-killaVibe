"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, ChevronDown, Filter, ArrowUpDown } from "lucide-react"
import { productsAPI } from "@/lib/api/products-api"
import { formatPrice } from "@/lib/helpers/price-helpers"
import { PAGINATION_LIMITS, PRODUCT_SORT_OPTIONS, SORT_ORDER } from "@/lib/types/product-types"
import { ProductCard } from "@/components/product/product-card"

/**
 * ProductosLista - Página principal de listado de productos
 * ✓ Fetch con paginación real
 * ✓ Filtros (precio, categoría, stock, rating)
 * ✓ Ordenamientos dinámicos
 * ✓ Control de favoritos
 * ✓ Loading y error handling
 * ✓ Limpieza de estados
 */
export default function ProductosLista() {
  const searchParams = useSearchParams()

  // ========== ESTADO PRINCIPAL ==========
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [favorites, setFavorites] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("product_favorites")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  // ========== FILTROS Y PAGINACIÓN ==========
  const [page, setPage] = useState(Number.parseInt(searchParams.get("page")) || 1)
  const [limit, setLimit] = useState(Number.parseInt(searchParams.get("limit")) || PAGINATION_LIMITS.DEFAULT)
  const [sort, setSort] = useState(searchParams.get("sort") || PRODUCT_SORT_OPTIONS.NEWEST)
  const [order, setOrder] = useState(searchParams.get("order") || SORT_ORDER.DESC)

  // FILTROS ESPECÍFICOS
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")
  const [minPrice, setMinPrice] = useState(Number.parseInt(searchParams.get("minPrice")) || 0)
  const [maxPrice, setMaxPrice] = useState(Number.parseInt(searchParams.get("maxPrice")) || 300000)
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStock") === "true" || false)
  const [minRating, setMinRating] = useState(Number.parseInt(searchParams.get("rating")) || 0)
  const [featured, setFeatured] = useState(searchParams.get("featured") === "true" || false)

  // UI STATE
  const [viewMode, setViewMode] = useState("grid")
  const [showFilters, setShowFilters] = useState(true)
  const [pagination, setPagination] = useState(null)

  // ========== SYNC URL PARAMS ==========
  useEffect(() => {
    const params = new URLSearchParams()
    if (page !== 1) params.set("page", page.toString())
    if (limit !== PAGINATION_LIMITS.DEFAULT) params.set("limit", limit.toString())
    if (sort !== PRODUCT_SORT_OPTIONS.NEWEST) params.set("sort", sort)
    if (order !== SORT_ORDER.DESC) params.set("order", order)
    if (searchQuery) params.set("search", searchQuery)
    if (selectedCategory) params.set("category", selectedCategory)
    if (minPrice > 0) params.set("minPrice", minPrice.toString())
    if (maxPrice < 300000) params.set("maxPrice", maxPrice.toString())
    if (inStockOnly) params.set("inStock", "true")
    if (minRating > 0) params.set("rating", minRating.toString())
    if (featured) params.set("featured", "true")

    const queryString = params.toString()
    if (queryString) {
      window.history.replaceState({}, "", `/products?${queryString}`)
    } else {
      window.history.replaceState({}, "", "/products")
    }
  }, [page, limit, sort, order, searchQuery, selectedCategory, minPrice, maxPrice, inStockOnly, minRating, featured])

  // ========== FETCH PRODUCTOS ==========
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const filters = {
        page,
        limit,
        sort,
        order,
        status: "active",
        visibility: "public",
      }

      // Agregar filtros opcionales
      if (searchQuery) filters.search = searchQuery
      if (selectedCategory) filters.category = selectedCategory
      if (minPrice > 0) filters.minPrice = minPrice
      if (maxPrice < 300000) filters.maxPrice = maxPrice
      if (inStockOnly) filters.inStock = true
      if (featured) filters.featured = true

      const response = await productsAPI.getProducts(filters)

      if (response.success) {
        setProducts(response.data || [])
        setPagination(response.pagination || {})
      } else {
        setError(response.message || "Error al cargar productos")
        setProducts([])
      }
    } catch (err) {
      console.error("[ProductosLista] Error fetching products:", err)
      setError(err.response?.data?.message || "Error al cargar los productos. Intenta de nuevo.")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [page, limit, sort, order, searchQuery, selectedCategory, minPrice, maxPrice, inStockOnly, featured])

  // Llamar a fetch cuando cambian filtros
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // ========== FAVORITOS ==========
  const toggleFavorite = useCallback((productId) => {
    setFavorites((prev) => {
      const updated = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]

      if (typeof window !== "undefined") {
        localStorage.setItem("product_favorites", JSON.stringify(updated))
      }
      return updated
    })
  }, [])

  const isFavorite = useCallback(
    (productId) => {
      return favorites.includes(productId)
    },
    [favorites],
  )

  // ========== HANDLERS ==========
  const handleResetFilters = useCallback(() => {
    setPage(1)
    setSearchQuery("")
    setSelectedCategory("")
    setMinPrice(0)
    setMaxPrice(300000)
    setInStockOnly(false)
    setMinRating(0)
    setFeatured(false)
    setSort(PRODUCT_SORT_OPTIONS.NEWEST)
    setOrder(SORT_ORDER.DESC)
  }, [])

  const handleSortChange = useCallback((newSort) => {
    // Auto-set order for price sorts
    if (newSort === PRODUCT_SORT_OPTIONS.PRICE_LOW || newSort === "price") {
      setOrder(SORT_ORDER.ASC)
    } else {
      setOrder(SORT_ORDER.DESC)
    }
    setSort(newSort)
    setPage(1)
  }, [])

  const handleToggleOrder = useCallback(() => {
    setOrder((prev) => (prev === SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC))
    setPage(1)
  }, [])

  const handleSearchSubmit = useCallback((e) => {
    e?.preventDefault?.()
    setPage(1)
  }, [])

  // ========== COMPUTED VALUES ==========
  const totalProducts = pagination?.total || 0
  const totalPages = pagination?.pages || 0
  const hasFiltersActive =
    searchQuery || selectedCategory || minPrice > 0 || maxPrice < 300000 || inStockOnly || minRating > 0 || featured

  const sortOptions = [
    { value: PRODUCT_SORT_OPTIONS.NEWEST, label: "🆕 Más nuevos" },
    { value: "price", label: "💰 Precio (menor)" },
    { value: PRODUCT_SORT_OPTIONS.SALES, label: "🔥 Más vendidos" },
    { value: PRODUCT_SORT_OPTIONS.RATING, label: "⭐ Mejor calificados" },
  ]

  // ========== RENDER ==========
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🛍️ Productos</h1>

            {/* SEARCH BAR */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-md items-center relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full px-4 py-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <Search className="absolute right-3 h-4 w-4 text-gray-400" />
            </form>

            {/* VIEW TOGGLE */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden"
              title="Mostrar/ocultar filtros"
            >
              <Filter className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* MOBILE SEARCH */}
          <form onSubmit={handleSearchSubmit} className="sm:hidden flex items-center relative mt-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full px-4 py-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Search className="absolute right-3 h-4 w-4 text-gray-400" />
          </form>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* FILTERS SIDEBAR */}
          {showFilters && (
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
                {/* Filter Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
                  {hasFiltersActive && (
                    <button
                      onClick={handleResetFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* PRICE RANGE */}
                <div className="pb-6 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Rango de Precio</h3>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="300000"
                      step="10000"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(Number(e.target.value))
                        setPage(1)
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <input
                      type="range"
                      min="0"
                      max="300000"
                      step="10000"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(Number(e.target.value))
                        setPage(1)
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-600">{formatPrice(minPrice)}</span>
                      <span className="text-sm text-gray-600">{formatPrice(maxPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* STOCK FILTER */}
                <div className="py-6 border-b border-gray-200">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => {
                        setInStockOnly(e.target.checked)
                        setPage(1)
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-900">Solo en stock</span>
                  </label>
                </div>

                {/* RATING FILTER */}
                <div className="py-6 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Calificación Mínima</h3>
                  <div className="space-y-2">
                    {[0, 3, 4, 4.5, 5].map((rating) => (
                      <label key={rating} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          checked={minRating === rating}
                          onChange={() => {
                            setMinRating(rating)
                            setPage(1)
                          }}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700">
                          {rating === 0 ? "Cualquiera" : `${rating}⭐ y más`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* FEATURED */}
                <div className="pt-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => {
                        setFeatured(e.target.checked)
                        setPage(1)
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-900">Solo destacados</span>
                  </label>
                </div>
              </div>
            </aside>
          )}

          {/* PRODUCTS SECTION */}
          <section className="lg:col-span-3 space-y-6">
            {/* SORT BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">{totalProducts.toLocaleString()} productos</span>
              </div>

              <div className="flex items-center gap-3">
                {/* SORT DROPDOWN */}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>

                {/* ORDER TOGGLE */}
                <button
                  onClick={handleToggleOrder}
                  className="p-2 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
                  title={`Ordenar ${order === "asc" ? "descendente" : "ascendente"}`}
                >
                  <ArrowUpDown className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* ERROR STATE */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-red-800 font-medium">{error}</p>
                <button onClick={fetchProducts} className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold">
                  Reintentar
                </button>
              </div>
            )}

            {/* LOADING STATE */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl h-64 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-16">
                <div className="text-8xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No se encontraron productos</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  No hay productos que coincidan con los filtros aplicados. Intenta ajustar tus criterios de búsqueda.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* PRODUCTS GRID */}
            {!loading && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <div key={product._id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <Link href={`/products/${product.slug}`}>
                      <ProductCard
                        product={product}
                        showWishlistButton={true}
                        onToggleWishlist={() => toggleFavorite(product._id)}
                        isInWishlist={isFavorite(product._id)}
                        className="h-full"
                      />
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* PAGINATION */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  ← Anterior
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === pageNum ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Siguiente →
                </button>
              </div>
            )}

            {/* PAGE INFO */}
            {!loading && totalProducts > 0 && (
              <div className="text-center text-sm text-gray-600 pt-4">
                Mostrando {Math.min((page - 1) * limit + 1, totalProducts)} - {Math.min(page * limit, totalProducts)} de{" "}
                {totalProducts.toLocaleString()} productos
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
