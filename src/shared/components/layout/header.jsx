// src/shared/components/layout/Header.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
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
// IMPORTS DE HOOKS GLOBALES (Corregido para usar el Contexto que sincroniza)
// ============================================================================
import { useCartContext } from "../../../modules/cart/context/CartContext"; 
import useWishlist from "../../../modules/wishlist/hooks/useWishlist";
import useSearch from "../../../modules/search/hooks/useSearch";

/**
 * @component Header
 * @description Header global Premium corregido para sincronización de carrito
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

   // ✅ HOOKS GLOBALES
  const { cart, loading: cartLoading } = useCartContext();
  
  // ✅ CALCULAR ITEM COUNT REACTIVAMENTE
  const cartItemCount = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [cart?.items]);

  // ❤️ WISHLIST
  const {
    itemCount: wishlistItemCount,
    hasPriceChanges,
    loading: wishlistLoading,
  } = useWishlist();

  // 🔍 SEARCH
  const {
    suggestions,
    getSuggestions,
    clearSuggestions,
    popularSearches,
    getPopularSearches,
  } = useSearch();

  // ============================================================================
  // NAVEGACIÓN
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 20);
      setLogoRotation(scrollPosition * 0.3);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMenuOpen]);

  useEffect(() => {
    getPopularSearches(5);
  }, [getPopularSearches]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

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
      navigate(`/productos?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchFocused(false);
      clearSuggestions();
      setSearchQuery("");
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    navigate(`/productos?search=${encodeURIComponent(suggestion)}`);
    setIsSearchFocused(false);
    clearSuggestions();
  };

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
            
            {/* LOGO SECTION */}
            <Link to="/" className="flex items-center space-x-3 group relative z-50">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-all duration-500 ${scrolled ? "scale-110" : "scale-100"}`}></div>
                <div className="relative transition-transform duration-300 group-hover:scale-110" style={{ transform: `rotate(${logoRotation % 360}deg)` }}>
                  <img
                    src="/logo-killavibes.svg"
                    alt="KillaVibes"
                    className={`transition-all duration-300 ${scrolled ? "h-12 w-12" : "h-14 w-14"}`}
                  />
                  <Zap className="absolute -bottom-1 -right-1 h-5 w-5 text-primary animate-pulse" />
                </div>
              </div>

              <div className="hidden sm:block">
                <span className={`font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent transition-all duration-300 ${scrolled ? "text-xl" : "text-2xl"}`} style={{ backgroundSize: "200% auto" }}>
                  KillaVibes
                </span>
                <div className="flex items-center space-x-1 -mt-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Tech Store</span>
                </div>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link key={item.name} to={item.href} className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300 group">
                  <span className="relative z-10 flex items-center space-x-1">
                    {item.name}
                    {item.badge && (
                      <span className="ml-1 px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold rounded-full animate-pulse">{item.badge}</span>
                    )}
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
                  <span className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>
              ))}
            </nav>

            {/* ACTION BUTTONS */}
            <div className="flex items-center space-x-2">
              {/* SEARCH */}
              <div className="hidden md:block relative">
                <button onClick={() => setIsSearchFocused(true)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-110 text-muted-foreground hover:text-primary group relative">
                  <Search className="h-5 w-5" />
                  <span className="absolute -inset-2 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></span>
                </button>

                {isSearchFocused && (
                  <div className="absolute top-12 right-0 w-80 bg-background border border-border rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in duration-200">
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

                    {suggestions.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-muted-foreground px-2 mb-2">Sugerencias</p>
                        {suggestions.map((s, idx) => (
                          <button key={idx} onClick={() => handleSuggestionClick(s)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 text-sm transition-colors">{s}</button>
                        ))}
                      </div>
                    )}

                    {!searchQuery && popularSearches.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-muted-foreground px-2 mb-2 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Búsquedas populares</p>
                        {popularSearches.map((ps, idx) => (
                          <button key={idx} onClick={() => handleSuggestionClick(ps.query)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 text-sm flex items-center justify-between">
                            <span>{ps.query}</span>
                            <span className="text-xs text-muted-foreground">{ps.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <button onClick={() => setIsSearchFocused(false)} className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground"><X className="h-4 w-4" /></button>
                  </div>
                )}
                {isSearchFocused && <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsSearchFocused(false)}></div>}
              </div>

              <ThemeToggle />

              {/* WISHLIST */}
              <Link to="/lista-deseos">
                <button className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-110 text-muted-foreground hover:text-primary group">
                  <Heart className={`h-5 w-5 transition-all duration-300 ${wishlistItemCount > 0 ? 'fill-current text-pink-500' : ''}`} />
                  {wishlistItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-[10px] text-white font-bold flex items-center justify-center animate-bounce shadow-lg">{wishlistItemCount}</span>
                  )}
                  {hasPriceChanges && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>}
                </button>
              </Link>

              {/* CART (Sincronizado) */}
              <Link to="/carrito">
                <button className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-110 text-muted-foreground hover:text-primary group">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-primary to-accent text-[10px] text-white font-bold flex items-center justify-center animate-bounce shadow-lg">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </Link>

              {/* AUTH */}
              <div className="hidden md:flex items-center space-x-2 ml-2">
                <Link to="/auth/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Iniciar Sesión</Link>
                <Link to="/auth/register" className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105 text-sm">Registro</Link>
              </div>

              {/* MOBILE TOGGLE */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all text-muted-foreground ml-2">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* SCROLL PROGRESS BAR */}
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary via-accent to-primary transition-all duration-300" style={{ width: `${Math.min((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100)}%` }}></div>
      </header>

      {/* MOBILE MENU (Completo con toda tu lógica original) */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute top-20 left-0 right-0 bg-background border-b border-border/50 shadow-2xl animate-in slide-in-from-top duration-300" onClick={(e) => e.stopPropagation()}>
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
                  <Link key={item.name} to={item.href} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary/5 transition-all group">
                    <span className="text-foreground font-medium flex items-center space-x-2">
                      <span>{item.name}</span>
                      {item.badge && <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full">{item.badge}</span>}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90" />
                  </Link>
                ))}
              </nav>

              {/* AUTH MOBILE */}
              <div className="space-y-3 pt-6 border-t border-border/50">
                <Link to="/auth/login" onClick={() => setIsMenuOpen(false)} className="block">
                  <button className="w-full px-6 py-3 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-white transition-all">Iniciar Sesión</button>
                </Link>
                <Link to="/auth/register" onClick={() => setIsMenuOpen(false)} className="block">
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold">Crear Cuenta</button>
                </Link>
              </div>

              {/* STATS MOBILE */}
              <div className="mt-6 pt-6 border-t border-border/50 text-center space-y-2">
                <p className="text-sm text-muted-foreground">🚚 Envío gratis en Barranquilla y Soledad</p>
                {cartItemCount > 0 && <p className="text-xs text-primary font-semibold">🛒 {cartItemCount} productos en tu carrito</p>}
                {wishlistItemCount > 0 && <p className="text-xs text-pink-500 font-semibold">❤️ {wishlistItemCount} en favoritos</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content jump */}
      <div className={scrolled ? "h-16" : "h-20"}></div>
    </>
  );
}