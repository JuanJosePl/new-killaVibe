// pages/category-detail-page.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Filter, Grid, List, Star, Zap } from "lucide-react";
import { ProductCard } from "../../../components/product-card";
import { Badge } from "../../../components/ui/badge";
import categoryService from "../../../src/services/categoryService";
import { useScrollToTop } from "../../../hooks/use-scroll-to-top";
import { PageLayout } from "../../../components/page-layout";

export default function CategoryDetailPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sort: 'newest'
  });

  useScrollToTop();

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        const categoryResponse = await categoryService.getCategoryBySlug(id);

        if (categoryResponse.success) {
          setCategory(categoryResponse.data);
          
          const productsResponse = await categoryService.getProductsByCategory(
            categoryResponse.data._id, 
            filters
          );
          
          if (productsResponse.success) {
            setProducts(productsResponse.data);
          } else {
            setProducts([]);
          }
        } else {
          setError("Categoría no encontrada");
        }
      } catch (err) {
        setError("Error al cargar la categoría");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [id, filters]);

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Smartphones': '📱',
      'Laptops & Computadoras': '💻',
      'Audio & Sonido': '🎧',
      'Smartwatches & Wearables': '⌚',
      'Gaming': '🎮',
      'TV & Monitores': '📺',
      'Tablets & iPads': '📟',
      'Accesorios': '🔌'
    };
    return icons[categoryName] || '📦';
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-8">
              <div className="h-4 w-32 bg-muted rounded"></div>
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-muted rounded-2xl h-80"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !category) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-6">😕</div>
            <h1 className="text-2xl font-bold mb-4">Categoría no encontrada</h1>
            <p className="text-muted-foreground mb-6">
              La categoría que buscas no existe o ha sido removida.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/categorias">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Volver a categorías
                </button>
              </Link>
              <Link to="/productos">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Explorar productos
                </button>
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8 flex-wrap">
            <Link to="/" className="hover:text-primary transition-colors font-medium">
              Inicio
            </Link>
            <span>›</span>
            <Link to="/categorias" className="hover:text-primary transition-colors font-medium">
              Categorías
            </Link>
            <span>›</span>
            <span className="text-foreground font-semibold">
              {category.name}
            </span>
          </div>

          <Link
            to="/categorias"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver a categorías
          </Link>

          <div className="text-center mb-12 relative">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl mb-6 backdrop-blur-sm">
              <span className="text-5xl">
                {getCategoryIcon(category.name)}
              </span>
            </div>
            
            <div className="flex flex-col items-center mb-4">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {category.name}
              </h1>
              {category.featured && (
                <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 text-sm py-1 px-4 mb-4">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Categoría Destacada
                </Badge>
              )}
            </div>
            
            {category.description && (
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6 leading-relaxed">
                {category.description}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="text-base py-2 px-4">
                <Zap className="h-4 w-4 mr-2" />
                {products.length} producto{products.length !== 1 ? 's' : ''} disponible{products.length !== 1 ? 's' : ''}
              </Badge>
              {category.featured && (
                <Badge variant="outline" className="text-base py-2 px-4 border-primary/30 text-primary">
                  🚀 Tecnología de Vanguardia
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground font-medium">
                {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                className="bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Más recientes</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="name">Nombre A-Z</option>
                <option value="featured">Destacados primero</option>
              </select>

              <div className="flex items-center gap-2 bg-background rounded-xl p-1 border border-border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <List className="h-4 w-4" />
                  Lista
                </button>
              </div>
            </div>
          </div>

          {products.length > 0 ? (
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' 
                : 'space-y-6'
              }
            `}>
              {products.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  variant={viewMode}
                  className="animate-slide-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">📦</div>
              <h3 className="text-2xl font-semibold mb-4">
                Próximamente en {category.name}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Estamos preparando productos increíbles para esta categoría. 
                ¡Vuelve pronto para descubrir las novedades!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/categorias">
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Explorar otras categorías
                  </button>
                </Link>
                <Link to="/productos">
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    Ver todos los productos
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}