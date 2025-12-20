// src/modules/admin/pages/Categories/CategoriesList.jsx

import { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';

export default function CategoriesList() {
  const { 
    getCategories, 
    getCategoriesHierarchy,
    createCategory, 
    updateCategory, 
    deleteCategory, 
    loading 
  } = useAdmin();
  
  const [categories, setCategories] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    parentCategory: '',
    isActive: true,
    featured: false
  });

  useEffect(() => {
    loadCategories();
    loadHierarchy();
  }, []);

  const loadCategories = async () => {
    await getCategories(
      (data) => setCategories(data.categories || []),
      (err) => console.error('Error cargando categorías:', err)
    );
  };

  const loadHierarchy = async () => {
    await getCategoriesHierarchy(
      (data) => setHierarchy(data.hierarchy || []),
      (err) => console.error('Error cargando jerarquía:', err)
    );
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        slug: category.slug,
        parentCategory: category.parentCategory?._id || '',
        isActive: category.isActive ?? true,
        featured: category.featured ?? false
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        slug: '',
        parentCategory: '',
        isActive: true,
        featured: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    const categoryData = {
      ...formData,
      parentCategory: formData.parentCategory || undefined
    };

    if (editingCategory) {
      await updateCategory(
        editingCategory._id,
        categoryData,
        () => {
          loadCategories();
          loadHierarchy();
          handleCloseModal();
          alert('Categoría actualizada exitosamente');
        },
        (err) => alert('Error: ' + err)
      );
    } else {
      await createCategory(
        categoryData,
        () => {
          loadCategories();
          loadHierarchy();
          handleCloseModal();
          alert('Categoría creada exitosamente');
        },
        (err) => alert('Error: ' + err)
      );
    }
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (!confirm(`¿ELIMINAR la categoría "${categoryName}"? Esto puede afectar productos asociados.`)) return;
    
    await deleteCategory(
      categoryId,
      () => {
        loadCategories();
        loadHierarchy();
        alert('Categoría eliminada exitosamente');
      },
      (err) => alert('Error: ' + err)
    );
  };

  return (
    <div className="p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gestión de Categorías
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Total: {categories.length} categorías
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:scale-105 transition-transform font-medium"
        >
          <span>➕</span>
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Flat List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Lista completa
            </h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <CategoryItem
                  key={category._id}
                  category={category}
                  onEdit={handleOpenModal}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>

          {/* Hierarchy View */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Jerarquía
            </h2>
            <div className="space-y-2">
              {hierarchy.map((category) => (
                <CategoryTreeItem
                  key={category._id}
                  category={category}
                  onEdit={handleOpenModal}
                  level={0}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug (se genera automáticamente)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                    readOnly
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Parent Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría padre (opcional)
                  </label>
                  <select
                    value={formData.parentCategory}
                    onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Sin categoría padre</option>
                    {categories
                      .filter(cat => !editingCategory || cat._id !== editingCategory._id)
                      .map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-900 dark:text-white">Categoría activa</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-900 dark:text-white">Categoría destacada</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : editingCategory ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// HELPER COMPONENTS
// ==============================================================================

function CategoryItem({ category, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {category.name}
          </h3>
          {!category.isActive && (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
              Inactivo
            </span>
          )}
          {category.featured && (
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
              Destacado
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Slug: {category.slug}
          {category.parentCategory && ` • Padre: ${category.parentCategory.name}`}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(category)}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(category._id, category.name)}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

function CategoryTreeItem({ category, onEdit, level }) {
  const indent = level * 24;

  return (
    <div>
      <div
        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
        style={{ marginLeft: `${indent}px` }}
      >
        <div className="flex items-center gap-2">
          {level > 0 && <span className="text-gray-400">└─</span>}
          <span className="font-medium text-gray-900 dark:text-white">
            {category.name}
          </span>
          {category.featured && <span>⭐</span>}
        </div>
        <button
          onClick={() => onEdit(category)}
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          Editar
        </button>
      </div>
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="mt-2 space-y-2">
          {category.subcategories.map((subcat) => (
            <CategoryTreeItem
              key={subcat._id}
              category={subcat}
              onEdit={onEdit}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}