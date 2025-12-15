// src/shared/components/layout/Header.jsx
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  Search,
  Heart,
  Sparkles,
  Zap,
  ChevronDown,
  TrendingUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";

// ============================================================================
// IMPORTS DE HOOKS GLOBALES
// ============================================================================
import { useCart } from "../../../modules/cart/hooks/useCart";
import  useWishlist  from "../../../modules/wishlist/hooks/useWishlist";
import useSearch from "../../../modules/search/hooks/useSearch";

/**
 * @component Header
 * @description Header global integrado con:
 * - Cart (contador + estado)
 * - Wishlist (contador + cambios de precio)
 * - Search (sugerencias + trending)
 * - Theme (dark/light mode)
 * - Auth (login/register)
 * - Responsive menu
 */
export default function Header() {
  const navigate = useNavigate();

  // ============================================================================
  // ESTADO LOCAL
  // ============================================================================
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoRotation, setLogoRotation] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // ============================================================================
  // HOOKS GLOBALES
  // ============================================================================

  // 🛒 CART
  const { itemCount: cartItemCount, loading: cartLoading } = useCart();

  // ❤️ WISHLIST
  const {
    itemCount: wishlistItemCount,
    hasPriceChanges,
    loading: wishlistLoading,
  } = useWishlist();

  // 🔍 SEARCH
  const {
    suggestions,
    loadingSuggestions,
    getSuggestions,
    clearSuggestions,
    popularSearches,
    getPopularSearches,
  } = useSearch();

  // ============================================================================
  // NAVEGACIÃN
  // ============================================================================
  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Productos", href: "/productos" },
    { name: "Categorías", href: "/categorias" },
    { name: "Ofertas", href: "/ofertas", badge: "¡HOT!" },
    { name: "Contacto", href: "/contacto" },
  ];

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 20);
      setLogoRotation(scrollPosition * 0.3);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Cargar búsquedas populares al montar
  useEffect(() => {
    getPopularSearches(5);
  }, [getPopularSearches]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Manejar cambio en input de búsqueda
   * Debounced desde useSearch
   */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Obtener sugerencias si hay más de 2 caracteres
    if (value.trim().length >= 2) {
      getSuggestions(value, 5);
    } else {
      clearSuggestions();
    }
  };

  /**
   * Ejecutar búsqueda
   */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      navigate(`/productos?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchFocused(false);
      clearSuggestions();
      setSearchQuery("");
    }
  };

  /**
   * Seleccionar sugerencia
   */
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    navigate(`/productos?search=${encodeURIComponent(suggestion)}`);
    setIsSearchFocused(false);
    clearSuggestions();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg"
            : "bg-background/50 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              scrolled ? "h-16" : "h-20"
            }`}
          >
            {/* ============================================== */}
            {/* LOGO */}
            {/* ============================================== */}
            <Link
              to="/"
              className="flex items-center space-x-3 group relative z-50"
            >
              <div className="relative">
                {/* Animated glow ring */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-all duration-500 ${
                    scrolled ? "scale-110" : "scale-100"
                  }`}
                ></div>

                {/* Logo with rotation animation */}
                <div
                  className="relative transition-transform duration-300 group-hover:scale-110"
                  style={{
                    transform: `rotate(${logoRotation % 360}deg)`,
                  }}
                >
                  <img
                    src="/logo-killavibes.svg"
                    alt="KillaVibes"
                    width={scrolled ? "120" : "120"}
                    height={scrolled ? "120" : "120"}
                    className={`transition-all duration-300 ${
                      scrolled ? "h-16 w-16" : "h-14 w-14"
                    }`}
                  />

                  {/* Sparkle effect */}
                  <Zap className="absolute -bottom-1 -right-1 h-5 w-5 text-primary animate-pulse" />
                </div>
              </div>

              {/* Brand text */}
              <div className="hidden sm:block">
                <span
                  className={`font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent transition-all duration-300 ${
                    scrolled ? "text-xl" : "text-2xl"
                  }`}
                  style={{ backgroundSize: "200% auto" }}
                >
                  KillaVibes
                </span>
                <div className="flex items-center space-x-1 -mt-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Tech Store
                  </span>
                </div>
              </div>
            </Link>

            {/* ============================================== */}
            {/* DESKTOP NAVIGATION */}
            {/* ============================================== */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300 group"
                >
                  <span className="relative z-10 flex items-center space-x-1">
                    {item.name}
                    {item.badge && (
                      <span className="ml-1 px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </span>

                  {/* Hover underline effect */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>

                  {/* Hover background */}
                  <span className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>
              ))}
            </nav>

            {/* ============================================== */}
            {/* ACTIONS */}
            {/* ============================================== */}
            <div className="flex items-center space-x-2">
              {/* ============================================== */}
              {/* SEARCH BUTTON - Desktop */}
              {/* ============================================== */}
              <div className="hidden md:block relative">
                <button
                  onClick={() => setIsSearchFocused(true)}
                  className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-110 text-muted-foreground hover:text-primary group relative"
                >
                  <Search className="h-5 w-5" />
                  <span className="absolute -inset-2 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></span>
                </button>

                {/* Search Dropdown */}
                {isSearchFocused && (
                  <div className="absolute top-12 right-0 w-80 bg-background border border-border rounded-xl shadow-2xl p-4 z-50">
                    <form onSubmit={handleSearchSubmit}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={handleSearchChange}
                          placeholder="Buscar productos..."
                          autoFocus
                          className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/50 border border-border focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </form>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-muted-foreground px-2 mb-2">
                          Sugerencias
                        </p>
                        {suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 text-sm transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Popular Searches */}
                    {!searchQuery && popularSearches.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-muted-foreground px-2 mb-2 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Búsquedas populares
                        </p>
                        {popularSearches.slice(0, 5).map((search, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              handleSuggestionClick(search.query)
                            }
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 text-sm transition-colors flex items-center justify-between"
                          >
                            <span>{search.query}</span>
                            <span className="text-xs text-muted-foreground">
                              {search.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setIsSearchFocused(false)}
                      className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Overlay */}
                {isSearchFocused && (
                  <div
                    className="fixed inset-0 bg-black/20 z-40"
                    onClick={() => setIsSearchFocused(false)}
                  ></div>
                )}
              </div>

              {/* ============================================== */}
              {/* THEME TOGGLE */}
              {/* ============================================== */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {/* ============================================== */}
              {/* WISHLIST ICON */}
              {/* ============================================== */}
              <Link to="/lista-deseos">
                <button className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-110 text-muted-foreground hover:text-primary group">
                  <Heart className="h-5 w-5 group-hover:fill-current transition-all duration-300" />

                  {/* Badge Count */}
                  {wishlistItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-xs text-white font-bold flex items-center justify-center animate-bounce shadow-lg">
                      {wishlistItemCount}
                    </span>
                  )}

                  {/* Price Change Indicator */}
                  {hasPriceChanges && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  )}

                  <span className="absolute -inset-2 bg-pink-500/20 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></span>
                </button>
              </Link>

              {/* ============================================== */}
              {/* CART ICON */}
              {/* ============================================== */}
              <Link to="/carrito">
                <button className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-110 text-muted-foreground hover:text-primary group">
                  <ShoppingCart className="h-5 w-5" />

                  {/* Badge Count */}
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-primary to-accent text-xs text-white font-bold flex items-center justify-center animate-bounce shadow-lg">
                      {cartItemCount}
                    </span>
                  )}

                  <span className="absolute -inset-2 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></span>
                </button>
              </Link>

              {/* ============================================== */}
              {/* AUTH BUTTONS - Desktop */}
              {/* ============================================== */}
              <div className="hidden md:flex items-center space-x-2 ml-2">
                <Link to="/auth/login">
                  <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link to="/auth/register">
                  <button className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm">
                    Registro
                  </button>
                </Link>
              </div>

              {/* ============================================== */}
              {/* MOBILE MENU BUTTON */}
              {/* ============================================== */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all duration-300 text-muted-foreground hover:text-primary ml-2"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar on scroll */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary via-accent to-primary transition-all duration-300"
          style={{
            width: `${Math.min(
              (window.scrollY /
                (document.documentElement.scrollHeight - window.innerHeight)) *
                100,
              100
            )}%`,
          }}
        ></div>
      </header>

      {/* ============================================== */}
      {/* MOBILE MENU */}
      {/* ============================================== */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute top-20 left-0 right-0 bg-background border-b border-border/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container mx-auto px-4 py-8">
              {/* Search Bar - Mobile */}
              <div className="mb-6">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Buscar productos..."
                      className="w-full pl-12 pr-4 py-3 rounded-full bg-muted/50 border border-border focus:border-primary outline-none transition-all duration-300"
                    />
                  </div>
                </form>

                {/* Mobile Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mt-2 space-y-1 bg-muted/30 rounded-lg p-2">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleSuggestionClick(suggestion);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-background text-sm transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2 mb-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary/5 transition-all duration-300 group"
                  >
                    <span className="text-foreground font-medium flex items-center space-x-2">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300 -rotate-90" />
                  </Link>
                ))}
              </nav>

              {/* Theme Toggle - Mobile */}
              <div className="flex items-center justify-between px-4 py-3 mb-6 rounded-xl bg-muted/50">
                <span className="text-sm font-medium text-foreground">
                  Tema
                </span>
                <ThemeToggle />
              </div>

              {/* Auth Buttons - Mobile */}
              <div className="space-y-3">
                <Link
                  to="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block"
                >
                  <button className="w-full px-6 py-3 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-300">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link
                  to="/auth/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block"
                >
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300">
                    Crear Cuenta
                  </button>
                </Link>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-border/50 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  🚚 Envío gratis en Barranquilla y Soledad
                </p>
                <p className="text-xs text-muted-foreground">
                  ⚡ Atención al cliente 24/7
                </p>
                {cartItemCount > 0 && (
                  <p className="text-xs text-primary font-semibold">
                    🛒 {cartItemCount} productos en tu carrito
                  </p>
                )}
                {wishlistItemCount > 0 && (
                  <p className="text-xs text-pink-500 font-semibold">
                    ❤️ {wishlistItemCount} productos en tu lista de deseos
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content jump */}
      <div className="h-20"></div>
    </>
  );
}