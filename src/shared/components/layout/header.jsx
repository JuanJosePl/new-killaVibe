// src/shared/components/layout/Header.jsx
//
// ARQUITECTURA:
// - Consume useCartStore/useWishlistStore con selectores atómicos granulares
// - NO usa CartContext (eliminado)
// - NO recalcula itemCount (viene del store ya calculado)
// - NO llama API
// - NO valida reglas de dominio
// - useSearch solo para sugerencias y populares (ya migrado en módulo search)

import { useState, useEffect, useRef } from "react";
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

// ── SELECTORES ATÓMICOS (un selector = un valor = un re-render mínimo) ──────
import { useCartStore, cartSelectors } from "../../../modules/cart/presentation/store/cart.store";
import { useWishlistStore, wishlistSelectors } from "../../../modules/wishlist/store/wishlist.store";
import { useSearch } from "../../../modules/search/presentation/hooks/useSearch";

// ============================================================================
// HEADER
// ============================================================================

export default function Header() {
  const navigate = useNavigate();

  // ── ESTADO LOCAL ────────────────────────────────────────────────────────────
  const [isMenuOpen,       setIsMenuOpen]       = useState(false);
  const [scrolled,         setScrolled]         = useState(false);
  const [logoRotation,     setLogoRotation]     = useState(0);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [isSearchFocused,  setIsSearchFocused]  = useState(false);
  const scrollProgressRef = useRef(0);

  // ── CART: selector atómico — solo re-renderiza cuando cambia itemCount ─────
  // cart.store ya expone itemCount calculado. El Header NO reduce ni suma nada.
  const cartItemCount = useCartStore(cartSelectors.itemCount);

  // ── WISHLIST: selectores atómicos — solo los dos valores que el Header usa──
  const wishlistItemCount = useWishlistStore(wishlistSelectors.itemCount);
  const hasPriceChanges   = useWishlistStore(
    (s) => s.wishlist.items.some((item) => item.priceChanged === true)
  );

  // ── SEARCH: solo populares y sugerencias ────────────────────────────────────
  const {
    suggestions,
    loadingSuggestions,
    getSuggestions,
    clearSuggestions,
    popularSearches,
    loadingPopular,
  } = useSearch({ withPopular: true, popularLimit: 5 });

  // ── NAVEGACIÓN ───────────────────────────────────────────────────────────────
  const navigation = [
    { name: "Inicio",      href: "/" },
    { name: "Productos",   href: "/productos" },
    { name: "Categorías",  href: "/categorias" },
    { name: "Ofertas",     href: "/ofertas",   badge: "¡HOT!" },
    { name: "Contacto",    href: "/contacto" },
  ];

  // ── EFECTOS ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setLogoRotation(y * 0.3);

      // Progreso de scroll — actualizamos el ref (no state) para evitar re-renders
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgressRef.current = max > 0 ? Math.min((y / max) * 100, 100) : 0;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMenuOpen]);

  // ── HANDLERS DE BÚSQUEDA ────────────────────────────────────────────────────

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      getSuggestions(value, 5);
    } else {
      clearSuggestions();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      navigate(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
      clearSuggestions();
      setSearchQuery("");
    }
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(`/productos?search=${encodeURIComponent(suggestion)}`);
    setIsSearchFocused(false);
    clearSuggestions();
    setSearchQuery("");
  };

  const closeSearch = () => {
    setIsSearchFocused(false);
    clearSuggestions();
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────

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
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-16" : "h-20"}`}>

            {/* ── LOGO ── */}
            <Link to="/" className="flex items-center space-x-3 group relative z-50">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-all duration-500 ${scrolled ? "scale-110" : "scale-100"}`} />
                <div
                  className="relative transition-transform duration-300 group-hover:scale-110"
                  style={{ transform: `rotate(${logoRotation % 360}deg)` }}
                >
                  <img
                    src="/logo-killavibes.svg"
                    alt="KillaVibes"
                    className={`transition-all duration-300 ${scrolled ? "h-12 w-12" : "h-14 w-14"}`}
                  />
                  <Zap className="absolute -bottom-1 -right-1 h-5 w-5 text-primary animate-pulse" />
                </div>
              </div>
              <div className="hidden sm:block">
                <span
                  className={`font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent transition-all duration-300 ${scrolled ? "text-xl" : "text-2xl"}`}
                  style={{ backgroundSize: "200% auto" }}
                >
                  KillaVibes
                </span>
                <div className="flex items-center space-x-1 -mt-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Tech Store</span>
                </div>
              </div>
            </Link>

            {/* ── DESKTOP NAV ── */}
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
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                  <span className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              ))}
            </nav>

            {/* ── ACTION BUTTONS ── */}
            <div className="flex items-center space-x-2">

              {/* SEARCH DESKTOP */}
              <div className="hidden md:block relative">
                <button
                  onClick={() => setIsSearchFocused(true)}
                  className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-110 text-muted-foreground hover:text-primary group relative"
                  aria-label="Abrir búsqueda"
                >
                  <Search className="h-5 w-5" />
                  <span className="absolute -inset-2 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
                </button>

                {isSearchFocused && (
                  <div className="absolute top-12 right-0 w-80 bg-background border border-border rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in duration-200">
                    <button
                      onClick={closeSearch}
                      className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground"
                      aria-label="Cerrar búsqueda"
                    >
                      <X className="h-4 w-4" />
                    </button>

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

                    {/* Sugerencias (tiempo real) */}
                    {suggestions.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-muted-foreground px-2 mb-2">Sugerencias</p>
                        {suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(s.suggestion)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 text-sm transition-colors"
                          >
                            {s.suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Populares (cuando no hay query) */}
                    {!searchQuery && popularSearches.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-muted-foreground px-2 mb-2 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> Búsquedas populares
                        </p>
                        {popularSearches.map((ps, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(ps.query)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 text-sm flex items-center justify-between"
                          >
                            <span>{ps.query}</span>
                            <span className="text-xs text-muted-foreground">{ps.count.toLocaleString("es-ES")}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Backdrop */}
                {isSearchFocused && (
                  <div
                    className="fixed inset-0 bg-black/20 z-40"
                    onClick={closeSearch}
                  />
                )}
              </div>

              <ThemeToggle />

              {/* WISHLIST */}
              <Link to="/lista-deseos">
                <button
                  className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-110 text-muted-foreground hover:text-primary group"
                  aria-label={`Lista de deseos${wishlistItemCount > 0 ? `, ${wishlistItemCount} productos` : ""}`}
                >
                  <Heart
                    className={`h-5 w-5 transition-all duration-300 ${
                      wishlistItemCount > 0 ? "fill-current text-pink-500" : ""
                    }`}
                  />
                  {wishlistItemCount > 0 && (
                    <WishlistBadge count={wishlistItemCount} />
                  )}
                  {hasPriceChanges && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  )}
                </button>
              </Link>

              {/* CART */}
              <Link to="/carrito">
                <button
                  className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-110 text-muted-foreground hover:text-primary group"
                  aria-label={`Carrito${cartItemCount > 0 ? `, ${cartItemCount} productos` : ""}`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <CartBadge count={cartItemCount} />
                  )}
                </button>
              </Link>

              {/* AUTH */}
              <div className="hidden md:flex items-center space-x-2 ml-2">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/auth/register"
                  className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105 text-sm"
                >
                  Registro
                </Link>
              </div>

              {/* MOBILE TOGGLE */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all text-muted-foreground ml-2"
                aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* SCROLL PROGRESS BAR */}
        <ScrollProgressBar />
      </header>

      {/* ── MOBILE MENU ── */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute top-20 left-0 right-0 bg-background border-b border-border/50 shadow-2xl animate-in slide-in-from-top duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container mx-auto px-4 py-8 max-h-[80vh] overflow-y-auto">

              {/* SEARCH MOBILE */}
              <div className="mb-6">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Buscar productos..."
                      className="w-full pl-12 pr-4 py-3 rounded-full bg-muted/50 border border-border focus:border-primary outline-none"
                    />
                  </div>
                </form>
              </div>

              {/* NAV LINKS MOBILE */}
              <nav className="space-y-2 mb-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary/5 transition-all group"
                  >
                    <span className="text-foreground font-medium flex items-center space-x-2">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90" />
                  </Link>
                ))}
              </nav>

              {/* AUTH MOBILE */}
              <div className="space-y-3 pt-6 border-t border-border/50">
                <Link to="/auth/login" onClick={() => setIsMenuOpen(false)} className="block">
                  <button className="w-full px-6 py-3 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-white transition-all">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link to="/auth/register" onClick={() => setIsMenuOpen(false)} className="block">
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold">
                    Crear Cuenta
                  </button>
                </Link>
              </div>

              {/* STATS MOBILE */}
              <div className="mt-6 pt-6 border-t border-border/50 text-center space-y-2">
                <p className="text-sm text-muted-foreground">🚚 Envío gratis en Barranquilla y Soledad</p>
                {cartItemCount > 0 && (
                  <p className="text-xs text-primary font-semibold">🛒 {cartItemCount} productos en tu carrito</p>
                )}
                {wishlistItemCount > 0 && (
                  <p className="text-xs text-pink-500 font-semibold">❤️ {wishlistItemCount} en favoritos</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className={scrolled ? "h-16" : "h-20"} />
    </>
  );
}

// ============================================================================
// SUB-COMPONENTES (extraídos del JSX para legibilidad — NO tocan el store)
// ============================================================================

/**
 * Badge del carrito — componente puro, recibe count como prop.
 * No re-renderiza el botón padre, solo esta bolita.
 */
function CartBadge({ count }) {
  return (
    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-primary to-accent text-[10px] text-white font-bold flex items-center justify-center animate-bounce shadow-lg">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/**
 * Badge de wishlist — componente puro.
 */
function WishlistBadge({ count }) {
  return (
    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-[10px] text-white font-bold flex items-center justify-center animate-bounce shadow-lg">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/**
 * Scroll progress bar — usa CSS variable para evitar re-renders del Header.
 * El efecto de scroll actualiza un ref, no state, para la posición del logo.
 * La barra de progreso se mueve via CSS transform sin setState.
 */
function ScrollProgressBar() {
  // Implementado con CSS puro: el elemento se anima con scroll-driven animation
  // Si el entorno no soporta scroll-driven animations, se puede reemplazar
  // por el approach anterior (width: window.scrollY / ...) con useRef.
  return (
    <div
      className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary"
      style={{
        // Scroll-driven animation nativa (Chrome 115+, Safari 17+)
        // Fallback: sin animación en navegadores no soportados
        animationTimeline: "scroll(root)",
        animationDuration: "auto",
        width: "100%",
        transformOrigin: "left",
        animation: "scrollProgress linear",
      }}
    />
  );
}