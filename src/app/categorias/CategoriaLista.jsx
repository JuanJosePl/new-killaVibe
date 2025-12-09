// pages/categories-page.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "../../components/page-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import categoryService from "../../src/services/categoryService";
import { useScrollToTop } from "../../hooks/use-scroll-to-top";
import { Sparkles, TrendingUp, Star } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredCategories, setFeaturedCategories] = useState([]);

  useScrollToTop();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        if (response.success) {
          const activeCategories = response.data.filter((cat) => cat.isActive);
          setCategories(activeCategories);
          const featured = activeCategories.filter((cat) => cat.featured);
          setFeaturedCategories(featured);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryIcon = (categoryName) => {
    const icons = {
      Smartphones: "📱",
      "Laptops & Computadoras": "💻",
      "Audio & Sonido": "🎧",
      "Smartwatches & Wearables": "⌚",
      Gaming: "🎮",
      "TV & Monitores": "📺",
      "Tablets & iPads": "📟",
      Accesorios: "🔌",
    };
    return icons[categoryName] || "📦";
  };

  const getCategoryGradient = (index) => {
    const gradients = [
      "from-blue-500/20 to-purple-600/20",
      "from-green-500/20 to-emerald-600/20",
      "from-orange-500/20 to-red-600/20",
      "from-purple-500/20 to-pink-600/20",
      "from-yellow-500/20 to-orange-600/20",
      "from-cyan-500/20 to-blue-600/20",
      "from-pink-500/20 to-rose-600/20",
      "from-indigo-500/20 to-purple-600/20",
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="h-48 bg-muted"></div>
                  <CardHeader className="text-center">
                    <div className="h-16 w-16 bg-muted rounded-full mx-auto mb-4"></div>
                    <div className="h-6 bg-muted rounded w-3/4 mx-auto"></div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                  </CardContent>
                </Card>
              ))}
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
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl mb-6 backdrop-blur-sm">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-purple-600 bg-clip-text text-transparent">
              Explora Nuestras Categorías
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Descubre la mejor tecnología organizada en categorías
              especializadas. Encuentra exactamente lo que necesitas para tu
              estilo de vida digital.
            </p>
          </div>

          {featuredCategories.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-center gap-3 mb-8">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl lg:text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Categorías Destacadas
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                {featuredCategories.map((category, index) => (
                  <Link
                    key={category._id}
                    to={`/categorias/${category.slug}`}
                    className="block group"
                  >
                    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm h-48">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${getCategoryGradient(
                          index
                        )} opacity-60`}
                      />
                      <img
                        src={category.image}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-20"
                      />
                      <div className="relative z-10 p-6 h-full flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-4xl">
                            {getCategoryIcon(category.name)}
                          </div>
                          <Badge className="bg-primary/20 text-primary border-0 backdrop-blur-sm">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Destacado
                          </Badge>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Todas las Categorías
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <Link
                  key={category._id}
                  to={`/categorias/${category.slug}`}
                  className="block group"
                >
                  <Card className="h-full cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-2 border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden relative">
                    {category.image && (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-10"
                      />
                    )}

                    <CardHeader className="text-center pb-4 relative z-10">
                      <div className="relative">
                        <div
                          className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${getCategoryGradient(
                            index
                          )} mb-4 group-hover:scale-110 transition-transform duration-300`}
                        >
                          <span className="text-3xl">
                            {getCategoryIcon(category.name)}
                          </span>
                        </div>
                        {category.featured && (
                          <div className="absolute -top-2 -right-2">
                            <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 text-xs py-1 px-2 shadow-lg">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors duration-300 text-xl font-bold">
                        {category.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="text-center pt-0 relative z-10">
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {category.description}
                      </p>
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <Badge variant="secondary" className="text-xs">
                          Explorar productos
                        </Badge>
                      </div>
                    </CardContent>

                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="text-center mt-16 p-8 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl border border-border/50 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4">
              ¿No encuentras lo que buscas?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Contáctanos y te ayudamos a encontrar el producto perfecto para
              ti.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/productos">
                <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg">
                  Ver Todos los Productos
                </button>
              </Link>
              <a
                href="https://wa.me/message/O4FKBMAABGC5L1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all duration-300"
              >
                💬 Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
