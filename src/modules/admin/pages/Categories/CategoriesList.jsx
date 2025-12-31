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
  const [imageUrl, setImageUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    parentCategory: '',
    isActive: true,
    featured: false,
    iamges: []
  });

  useEffect(() => {
    loadCategories();
    loadHierarchy();
  }, []);

  const loadCategories = async () => {
  await getCategories(
    (data) => {
        // CORRECCIÓN: Según tu JSON, el array está en data.data.data
        // Pero si tu hook ya lo limpia, nos aseguramos de tomar el array real:
        const rawData = data?.data?.data || data?.data || data;
        setCategories(Array.isArray(rawData) ? rawData : []);
      },
      (err) => console.error('Error cargando categorías:', err)
    );
  };

const loadHierarchy = async () => {
    await getCategoriesHierarchy(
      (data) => {
        // CORRECCIÓN: El hierarchy viene en response.data directo según tu JSON
        const rawHierarchy = data?.data || data;
        setHierarchy(Array.isArray(rawHierarchy) ? rawHierarchy : []);
      },
      (err) => console.error('Error cargando jerarquía:', err)
    );
  };
  

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      // Convertimos el objeto del backend al array que usa tu formulario
    const currentImages = [];
    if (category.images?.thumbnail) {
      currentImages.push({ 
        url: category.images.thumbnail, 
        alt: category.name, 
        isPrimary: true 
      });
    }
      setFormData({
        name: category.name,
        description: category.description || '',
        slug: category.slug,
        parentCategory: category.parentCategory?._id || '',
        isActive: category.isActive ?? true,
        featured: category.featured ?? false,
        images: currentImages
      });
    } else {
      setEditingCategory(null);
      setImageUrl('');
      setFormData({
        name: '',
        description: '',
        slug: '',
        parentCategory: '',
        isActive: true,
        featured: false,
        images: []
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

// Obtenemos la URL de la imagen marcada como principal o la primera del array
  const mainImage = formData.images.find(img => img.isPrimary)?.url || 
  (formData.images.length > 0 ? formData.images[0].url : null);
  
  if (!formData.name.trim()) {
    alert('El nombre es requerido');
    return;
  }

  // --- AQUÍ HACEMOS LAS LIMPIEZAS Y CONVERSIONES ---
  const categoryData = {
    ...formData,
    // Aseguramos que el slug esté bien generado/limpio antes de enviar
    slug: generateSlug(formData.name), 
    
    // Si tuvieras campos numéricos en categorías (como orden o stock):
    // order: Number(formData.order) || 0,
    
    parentCategory: formData.parentCategory || undefined,

    // ✅ ESTRUCTURA CORRECTA PARA EL BACKEND DE CATEGORÍAS
    images: {
      thumbnail: mainImage, // La imagen principal
      hero: mainImage,      // Usamos la misma o la segunda si existe
      icon: mainImage       // Usamos la misma para asegurar que se vea algo
    },
    seo: {
      metaTitle: formData.name,
      metaDescription: formData.description ? formData.description.substring(0, 157) + "..." : formData.name,
      keywords: []
    }
  };
  // ------------------------------------------------

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

  const handleAddImage = () => {
  if (!imageUrl.trim()) return;
  
  setFormData({
    ...formData,
    images: [
      ...(formData.images || []), // Uso de fallback por si es undefined
      {
        url: imageUrl,
        alt: formData.name || 'Categoría',
        isPrimary: (formData.images || []).length === 0
      }
    ]
  });
  setImageUrl('');
};

const handleRemoveImage = (index) => {
  const newImages = formData.images.filter((_, i) => i !== index);
  if (formData.images[index].isPrimary && newImages.length > 0) {
    newImages[0].isPrimary = true;
  }
  setFormData({ ...formData, images: newImages });
};

const handleSetPrimary = (index) => {
  const newImages = formData.images.map((img, i) => ({
    ...img,
    isPrimary: i === index
  }));
  setFormData({ ...formData, images: newImages });
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

                        {/* Images */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Imágenes
          </h2>
          
          {/* Add image */}
          <div className="flex gap-2 mb-4">
            <input
              type="url"
              placeholder="URL de la imagen"
              value={imageUrl || ''}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Agregar
            </button>
          </div>

          {/* Images grid */}
          {formData.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img.url}
                    alt={img.alt || 'Categoría'}
                    className="w-full aspect-square object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300?text=Error';
                    }}
                  />
                  {img.isPrimary && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Principal
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Principal
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No hay imágenes agregadas
            </p>
          )}
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
  // CORRECCIÓN PARA EL ICONO: Usamos category.images.icon del JSON
  const iconUrl = category.images?.icon || category.images?.thumbnail;

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-600 hover:shadow-md transition">
      {/* Visualización del Icono */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
        {iconUrl ? (
          <img src={iconUrl} alt={category.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">📁</div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 dark:text-white">{category.name}</h3>
          {category.featured && (
            <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-600 font-bold rounded-full uppercase">
              Destacado
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">slug: {category.slug}</p>
      </div>

      {/* Contador de productos (Viene del backend) */}
      <div className="hidden sm:block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">
        {category.productCount || 0} productos
      </div>

      <div className="flex gap-2">
        <button onClick={() => onEdit(category)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg">
          ✏️
        </button>
        <button onClick={() => onDelete(category._id, category.name)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg">
          🗑️
        </button>
      </div>
    </div>
  );
}

function CategoryTreeItem({ category, onEdit, level }) {
  const indent = level * 20;
  const hasChildren = category.children && category.children.length > 0;
  // Imagen para la jerarquía (más pequeña)
  const thumbUrl = category.images?.thumbnail;

  return (
    <div className="mb-1">
      <div
        className={`flex items-center justify-between p-3 rounded-lg transition ${
          level === 0 ? 'bg-gray-100 dark:bg-gray-700/50' : 'bg-transparent border-l-2 border-gray-200 dark:border-gray-600'
        } hover:bg-blue-50 dark:hover:bg-blue-900/20`}
        style={{ marginLeft: `${indent}px` }}
      >
        <div className="flex items-center gap-3">
          {level > 0 && <span className="text-gray-400">└─</span>}
          
          {/* Miniatura en Jerarquía */}
          <div className="w-6 h-6 rounded bg-gray-300 overflow-hidden">
             {thumbUrl && <img src={thumbUrl} className="w-full h-full object-cover" />}
          </div>

          <span className={`${level === 0 ? 'font-bold' : 'font-medium'} text-gray-900 dark:text-white`}>
            {category.name}
          </span>

          {/* Contador de productos al lado del nombre */}
          <span className="text-[10px] text-gray-500 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-600">
            {category.productCount || 0}
          </span>
        </div>
        <button onClick={() => onEdit(category)} className="text-blue-600 dark:text-blue-400 hover:underline text-xs">
          Editar
        </button>
      </div>
      
      {hasChildren && (
        <div className="mt-1">
          {category.children.map((subcat) => (
            <CategoryTreeItem key={subcat._id} category={subcat} onEdit={onEdit} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}