import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productsAPI } from '../../products/api/products.api'; 
import { ProductCard } from '../../products/components/ProductCard';
import { useProductCart } from '../../products/hooks/useProductCart';
import { useProductWishlist } from '../../products/hooks/useProductWishlist';

const CategoryDetailPage = () => {
  const { categorySlug } = useParams();
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hooks de acción
  const { addProductToCart, isProductInCart, getProductQuantity } = useProductCart();
  const { toggleProductWishlist, isProductInWishlist } = useProductWishlist();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // ✅ Usamos la ruta directa del servidor para esta categoría
        const response = await productsAPI.getProductsByCategory(categorySlug);
        if (response.success) {
          setCategoryProducts(response.data);
        }
      } catch (err) {
        console.error("Error al cargar productos de la categoría:", err);
      } finally {
        setLoading(false);
      }
    };
    if (categorySlug) loadData();
  }, [categorySlug]);

  if (loading) return <div className="text-center py-20">Cargando productos...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold capitalize mb-10">
        {categorySlug?.replace(/-/g, ' ')}
      </h1>
      
      {categoryProducts.length === 0 ? (
        <p className="text-center text-gray-500">No hay productos en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categoryProducts.map(product => (
            <ProductCard 
              key={product._id} 
              product={product}
              showWishlistButton={true}
              showAddToCart={true}
              onToggleWishlist={() => toggleProductWishlist(product)}
              onAddToCart={() => addProductToCart(product, 1)}
              isInWishlist={isProductInWishlist(product._id)}
              isInCart={isProductInCart(product._id)}
              cartQuantity={getProductQuantity(product._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDetailPage;