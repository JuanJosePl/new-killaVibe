// src/modules/admin/pages/Products/ProductsList.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';

export default function ProductsList() {
  const { getProducts, deleteProduct, loading } = useAdmin();
  
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    category: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

const loadProducts = async () => {
  // Aseguramos que existan valores por defecto para paginación si 'filters' está vacío
  const params = {
    page: filters.page || 1,
    limit: filters.limit || 20,
    ...filters
  };

  await getProducts(
    params, 
    (data) => {
      // El backend suele devolver 'products' o 'data'. 
      // Usamos fallback por si la estructura varía.
      setProducts(data.products || data); 
      setPagination(data.pagination || {});
    },
    (err) => {
      console.error('Error cargando productos:', err);
    }
  );
};

const handleDeleteProduct = async (productId, productName) => {
  if (!window.confirm(`¿ELIMINAR "${productName}"?`)) return;
  
  // 1. Llamada al backend
  await deleteProduct(
    productId,
    () => {
      // 2. ACTUALIZACIÓN FORZADA DEL ESTADO
      // Usamos una función dentro de setProducts para asegurar que tenemos la versión más reciente
      setProducts((currentProducts) => {
        const updatedList = currentProducts.filter(p => p._id !== productId);
        console.log("Nueva lista tras eliminar:", updatedList); // Revisa esto en consola
        return updatedList;
      });
      
      alert('Eliminado con éxito');
    },
    (err) => alert('Error al eliminar: ' + err)
  );
};

  return (
    <div className="p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gestión de Productos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Total: {pagination?.total || 0} productos
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:scale-105 transition-transform font-medium"
        >
          <span>➕</span>
          <span>Nuevo Producto</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Buscar por nombre, SKU..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Sort */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters({ ...filters, sortBy, sortOrder, page: 1 });
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="createdAt-desc">Más recientes</option>
            <option value="createdAt-asc">Más antiguos</option>
            <option value="name-asc">Nombre A-Z</option>
            <option value="name-desc">Nombre Z-A</option>
            <option value="price-asc">Precio menor</option>
            <option value="price-desc">Precio mayor</option>
            <option value="stock-asc">Stock menor</option>
            <option value="stock-desc">Stock mayor</option>
          </select>
        </div>
      </div>

      {/* Products Grid/List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">No se encontraron productos</p>
          <Link
            to="/admin/products/new"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Crear primer producto
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-4 p-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={pagination.current === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                Página {pagination.current} de {pagination.pages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={pagination.current === pagination.pages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ==============================================================================
// PRODUCT CARD COMPONENT
// ==============================================================================

function ProductCard({ product, onDelete }) {
  const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/300';
  const isLowStock = product.stock < 10;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300?text=Sin+Imagen';
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {!product.isActive && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              Inactivo
            </span>
          )}
          {isLowStock && product.isActive && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
              Bajo stock
            </span>
          )}
          {product.featured && (
            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
              Destacado
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 truncate">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${product.price.toFixed(2)}
          </p>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Stock</p>
            <p className={`font-bold ${isLowStock ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
              {product.stock}
            </p>
          </div>
        </div>

        {/* Category */}
        {product.category && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {product.category.name}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/admin/products/edit/${product._id}`}
            className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-sm text-center font-medium"
          >
            ✏️ Editar
          </Link>
          <button
            onClick={() => onDelete(product._id, product.name)}
            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition text-sm font-medium"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}