// src/modules/categories/pages/CategoryDetailPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../products/contexts/ProductsContext'; 
import { ProductCard } from '../../products/components/ProductCard';
import { useMemo } from 'react';

// ✅ IMPORTANTE: Importar hooks de acción
import { useProductCart } from '../../products/hooks/useProductCart';
import { useProductWishlist } from '../../products/hooks/useProductWishlist';

const CategoryDetailPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useProducts(); 

  // ✅ Inicializar hooks de acciones
  const { addProductToCart, isProductInCart, getProductQuantity, loading: cartLoading } = useProductCart();
  const { toggleProductWishlist, isProductInWishlist, loading: wishlistLoading } = useProductWishlist();

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(product => 
      product.mainCategory?.slug === categorySlug || 
      product.categories?.some(cat => cat.slug === categorySlug)
    );
  }, [products, categorySlug]);

  if (productsLoading) return <div className="text-center py-20 animate-spin">...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold capitalize mb-10">{categorySlug?.replace(/-/g, ' ')}</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <ProductCard 
            key={product._id} 
            product={product}
            // ✅ PASAR PROPS DE ACCIÓN (Esto es lo que faltaba)
            showWishlistButton={true}
            showAddToCart={true}
            onToggleWishlist={() => toggleProductWishlist(product)}
            onAddToCart={() => addProductToCart(product, 1)}
            isInWishlist={isProductInWishlist(product._id)}
            isInCart={isProductInCart(product._id)}
            cartQuantity={getProductQuantity(product._id)}
            cartLoading={cartLoading}
            wishlistLoading={wishlistLoading}
            onClick={() => navigate(`/productos/${product.slug}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryDetailPage;