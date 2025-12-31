import { useParams } from 'react-router-dom';
import { useProducts } from '../../products/contexts/ProductsContext'; 
import useCategories from '../hooks/useCategories'; 
import { ProductCard } from '../../products/components/ProductCard';
import { useMemo } from 'react';

const CategoryDetailPage = () => {
  const { categorySlug } = useParams();
  const { products, loading: productsLoading } = useProducts(); 
  const { categories, loading: categoriesLoading } = useCategories();

  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    return products.filter(product => {
      // 1. Intentamos filtrar por el slug de 'mainCategory' que es el más directo
      if (product.mainCategory && product.mainCategory.slug === categorySlug) {
        return true;
      }

      // 2. Por si acaso, revisamos el array 'categories'
      if (Array.isArray(product.categories)) {
        return product.categories.some(cat => cat.slug === categorySlug);
      }

      return false;
    });
  }, [products, categorySlug]);

  // Depuración para confirmar que el filtro ahora sí encuentra coincidencias
//   console.log('--- RESUMEN DE FILTRADO ---');
//   console.log('Buscando Slug:', categorySlug);
//   console.log('Productos Totales:', products?.length);
//   console.log('Productos Filtrados:', filteredProducts.length);

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-[400px] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold capitalize text-gray-900 mb-2">
          {categorySlug?.replace(/-/g, ' ')}
        </h1>
        <p className="text-gray-600 text-lg">
          {filteredProducts.length > 0 
            ? `Hemos encontrado ${filteredProducts.length} productos para ti` 
            : `No hay productos disponibles en esta sección`}
        </p>
      </header>
      
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-xl font-medium">Categoría sin productos</p>
          <p className="text-gray-400 mt-2">
            El slug "{categorySlug}" no coincide con la categoría principal de tus productos.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryDetailPage;