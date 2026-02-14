// src/modules/admin/pages/Products/ProductForm.jsx
// ✅ VERSIÓN CORREGIDA - TODOS LOS CAMPOS SE CAPTURAN Y ENVÍAN

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getProductById,
    createProduct, 
    updateProduct, 
    getCategories,
    loading 
  } = useAdmin();
  
  const isEditMode = Boolean(id);
  
  const [categories, setCategories] = useState([]);
  
  // ✅ ESTADO INICIAL COMPLETO CON TODOS LOS CAMPOS
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '', // ✅ AGREGADO
    price: '',
    comparePrice: '',
    costPrice: '',
    stock: '',
    sku: '',
    brand: '',
    
    // ✅ Categorías
    categories: [],
    mainCategory: '', // ✅ Categoría principal
    
    // ✅ Estados
    isActive: true,
    isFeatured: false,
    isPublished: false,
    status: 'active',
    visibility: 'public',
    
    // ✅ Imágenes
    images: [],
    
    // ✅ ATRIBUTOS COMPLETOS
    attributes: {
      size: [],      // ✅ Array de tallas/tamaños
      color: [],     // ✅ Array de colores
      material: [], // ✅ Array de materiales
      weight: '',   // ✅ String simple para peso
      dimensions: {
        length: '',
        width: '',
        height: '',
        unit: 'cm'
      }
    },
    
    // ✅ SEO COMPLETO
    seo: {
      title: '',
      description: '',
      metaKeywords: [] // ✅ Array de keywords
    },
    
    // ✅ Weight separado (backend espera esto)
    weight: {
      value: '',
      unit: 'kg'
    }
  });
  
  const [imageUrl, setImageUrl] = useState('');
  
  // ✅ NUEVOS ESTADOS PARA INPUTS DINÁMICOS
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      await loadCategories();
      if (isEditMode && isMounted) {
        await loadProduct();
      }
    };

    init();

    return () => { isMounted = false; };
  }, [id]);

  const loadCategories = async () => {
    await getCategories(
      (data) => {
        const categoriesData = Array.isArray(data) ? data : (data.categories || []);
        setCategories(categoriesData);
      },
      (err) => console.error('Error cargando categorías:', err)
    );
  };

  const loadProduct = async () => {
    await getProductById(
      id,
      (data) => {
        const product = data.data || data;
        
        if (product) {
          setFormData({
            name: product.name || '',
            slug: product.slug || '',
            description: product.description || '',
            shortDescription: product.shortDescription || '', // ✅ CARGAR
            price: product.price || '',
            comparePrice: product.comparePrice || '',
            costPrice: product.costPrice || '',
            stock: product.stock || '',
            sku: product.sku || '',
            brand: product.brand || '',
            
            // ✅ Categorías
            categories: product.categories?.map(cat => 
              typeof cat === 'object' ? cat._id : cat
            ) || [],
            mainCategory: product.mainCategory?._id || 
                         product.mainCategory || 
                         (product.categories?.length > 0 
                           ? (typeof product.categories[0] === 'object' 
                               ? product.categories[0]._id 
                               : product.categories[0])
                           : ''),

            isActive: product.isActive ?? true,
            isPublished: product.isPublished ?? false,
            isFeatured: product.isFeatured ?? false,
            status: product.status || 'active',
            visibility: product.visibility || 'public',

            images: (product.images || []).map(img => ({
              url: img.url,
              alt: img.altText || img.alt || '',
              isPrimary: img.isPrimary || false
            })),

            // ✅ ATRIBUTOS COMPLETOS
            attributes: {
              size: product.attributes?.size || [],
              color: product.attributes?.color || [],
              material: product.attributes?.material || [],
              weight: product.attributes?.weight || '',
              dimensions: {
                length: product.attributes?.dimensions?.length || '',
                width: product.attributes?.dimensions?.width || '',
                height: product.attributes?.dimensions?.height || '',
                unit: product.attributes?.dimensions?.unit || 'cm'
              }
            },
            
            // ✅ SEO COMPLETO
            seo: {
              title: product.seo?.title || '',
              description: product.seo?.description || '',
              metaKeywords: product.seo?.metaKeywords || []
            },
            
            // ✅ Weight
            weight: {
              value: product.weight?.value || '',
              unit: product.weight?.unit || 'kg'
            }
          });
        }
      },
      (err) => {
        console.error('Error cargando producto:', err);
        navigate('/admin/products');
      }
    );
  };

  // ============================================================================
  // MANEJO DE IMÁGENES
  // ============================================================================
  
  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    
    setFormData({
      ...formData,
      images: [
        ...formData.images,
        {
          url: imageUrl.trim(),
          alt: formData.name || 'Producto',
          isPrimary: formData.images.length === 0
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

  // ============================================================================
  // ✅ NUEVAS FUNCIONES PARA ATRIBUTOS DINÁMICOS
  // ============================================================================
  
  const handleAddSize = () => {
    if (!newSize.trim()) return;
    if (formData.attributes.size.includes(newSize.trim())) {
      alert('Esta talla ya existe');
      return;
    }
    setFormData({
      ...formData,
      attributes: {
        ...formData.attributes,
        size: [...formData.attributes.size, newSize.trim()]
      }
    });
    setNewSize('');
  };

  const handleRemoveSize = (index) => {
    setFormData({
      ...formData,
      attributes: {
        ...formData.attributes,
        size: formData.attributes.size.filter((_, i) => i !== index)
      }
    });
  };

  const handleAddColor = () => {
    if (!newColor.trim()) return;
    if (formData.attributes.color.includes(newColor.trim())) {
      alert('Este color ya existe');
      return;
    }
    setFormData({
      ...formData,
      attributes: {
        ...formData.attributes,
        color: [...formData.attributes.color, newColor.trim()]
      }
    });
    setNewColor('');
  };

  const handleRemoveColor = (index) => {
    setFormData({
      ...formData,
      attributes: {
        ...formData.attributes,
        color: formData.attributes.color.filter((_, i) => i !== index)
      }
    });
  };

  const handleAddMaterial = () => {
    if (!newMaterial.trim()) return;
    if (formData.attributes.material.includes(newMaterial.trim())) {
      alert('Este material ya existe');
      return;
    }
    setFormData({
      ...formData,
      attributes: {
        ...formData.attributes,
        material: [...formData.attributes.material, newMaterial.trim()]
      }
    });
    setNewMaterial('');
  };

  const handleRemoveMaterial = (index) => {
    setFormData({
      ...formData,
      attributes: {
        ...formData.attributes,
        material: formData.attributes.material.filter((_, i) => i !== index)
      }
    });
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    if (formData.seo.metaKeywords.includes(newKeyword.trim())) {
      alert('Esta keyword ya existe');
      return;
    }
    setFormData({
      ...formData,
      seo: {
        ...formData.seo,
        metaKeywords: [...formData.seo.metaKeywords, newKeyword.trim()]
      }
    });
    setNewKeyword('');
  };

  const handleRemoveKeyword = (index) => {
    setFormData({
      ...formData,
      seo: {
        ...formData.seo,
        metaKeywords: formData.seo.metaKeywords.filter((_, i) => i !== index)
      }
    });
  };

  // ============================================================================
  // ✅ SUBMIT CORREGIDO - ENVÍA TODOS LOS CAMPOS
  // ============================================================================
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Generar slug automáticamente
    const generateSlug = (text) => {
      if (!text) return '';
      return text
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
    };

    // Validación básica
    if (formData.description.length < 100) {
      alert(`La descripción es muy corta (${formData.description.length}/100 caracteres).`);
      return;
    }

    if (formData.images.length === 0) {
      alert('Debes agregar al menos una imagen');
      return;
    }

    if (!formData.mainCategory) {
      alert('Debes seleccionar una categoría principal');
      return;
    }

    // ✅ CONSTRUIR PAYLOAD COMPLETO
    const productData = {
      // Básico
      name: formData.name.trim(),
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description.trim(),
      shortDescription: formData.shortDescription.trim(), // ✅ INCLUIDO
      
      // Precios
      price: formData.price ? Number(formData.price) : 0,
      comparePrice: formData.comparePrice ? Number(formData.comparePrice) : undefined,
      costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
      
      // Inventario
      stock: formData.stock ? Number(formData.stock) : 0,
      sku: formData.sku.trim(),
      
      // Categorías
      categories: [formData.mainCategory], // ✅ Array con categoría principal
      mainCategory: formData.mainCategory, // ✅ ID de categoría principal
      
      // Marca
      brand: formData.brand.trim() || "Genérico",
      
      // Estados
      status: formData.isActive ? 'active' : 'inactive',
      visibility: formData.visibility || 'public',
      isActive: Boolean(formData.isActive),
      isPublished: Boolean(formData.isPublished),
      isFeatured: Boolean(formData.isFeatured),
      
      // ✅ ATRIBUTOS COMPLETOS
      attributes: {
        size: formData.attributes.size || [],           // ✅ Array
        color: formData.attributes.color || [],         // ✅ Array
        material: formData.attributes.material || [],   // ✅ Array
        weight: formData.attributes.weight || null,     // ✅ String/null
        dimensions: {
          length: formData.attributes.dimensions.length 
            ? Number(formData.attributes.dimensions.length) 
            : 0,
          width: formData.attributes.dimensions.width 
            ? Number(formData.attributes.dimensions.width) 
            : 0,
          height: formData.attributes.dimensions.height 
            ? Number(formData.attributes.dimensions.height) 
            : 0,
          unit: formData.attributes.dimensions.unit || 'cm'
        }
      },

      // ✅ WEIGHT SEPARADO (backend espera esto)
      weight: {
        value: formData.weight.value ? Number(formData.weight.value) : undefined,
        unit: formData.weight.unit || 'kg'
      },

      // ✅ IMÁGENES
      images: formData.images.map((img, idx) => ({
        url: img.url,
        altText: img.alt || formData.name,
        isPrimary: img.isPrimary,
        order: idx
      })),

      // ✅ SEO COMPLETO
      seo: {
        title: formData.seo.title || formData.name,
        description: formData.seo.description || formData.shortDescription,
        metaKeywords: formData.seo.metaKeywords || []
      }
    };

    console.log('📦 Payload enviado al backend:', productData);

    const onSuccess = () => {
      alert(isEditMode ? '¡Producto actualizado!' : '¡Producto creado!');
      navigate('/admin/products');
    };

    const onError = (err) => {
      console.error("Error del servidor:", err);
      alert('Error: ' + err);
    };

    if (isEditMode) {
      await updateProduct(id, productData, onSuccess, onError);
    } else {
      await createProduct(productData, onSuccess, onError);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="p-6 max-w-5xl mx-auto">
      
      <div className="mb-6">
        <Link
          to="/admin/products"
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
        >
          ← Volver a productos
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ===================================================================== */}
        {/* INFORMACIÓN BÁSICA */}
        {/* ===================================================================== */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Información básica
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del producto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                placeholder="Mínimo 100 caracteres..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/100 caracteres mínimos
              </p>
            </div>

            {/* ✅ SHORT DESCRIPTION */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción Corta (Resumen para SEO)
              </label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Un resumen breve que aparecerá en listados..."
                maxLength={300}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.shortDescription.length}/300 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Precio de Venta *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2 font-semibold">
                Precio de Comparación (Oferta)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.comparePrice}
                onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: 2499.99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Costo por artículo
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Tu costo de compra"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* ✅ CATEGORÍA PRINCIPAL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría Principal *
              </label>
              <select
                value={formData.mainCategory}
                onChange={(e) => setFormData({ ...formData, mainCategory: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Cargando categorías...</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white uppercase"
                placeholder="AUTO"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marca
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Genérico"
              />
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* ✅ ATRIBUTOS (SIZE, COLOR, MATERIAL) */}
        {/* ===================================================================== */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Atributos del Producto
          </h2>

          {/* SIZE */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tallas / Tamaños
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: S, M, L, XL"
              />
              <button
                type="button"
                onClick={handleAddSize}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Agregar
              </button>
            </div>
            {formData.attributes.size.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.attributes.size.map((size, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(idx)}
                      className="text-blue-600 dark:text-blue-300 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* COLOR */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Colores Disponibles
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Rojo, Azul, Negro"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Agregar
              </button>
            </div>
            {formData.attributes.color.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.attributes.color.map((color, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(idx)}
                      className="text-green-600 dark:text-green-300 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* MATERIAL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Materiales
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMaterial())}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Algodón, Poliéster, Cuero"
              />
              <button
                type="button"
                onClick={handleAddMaterial}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Agregar
              </button>
            </div>
            {formData.attributes.material.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.attributes.material.map((material, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 rounded-full text-sm"
                  >
                    {material}
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(idx)}
                      className="text-purple-600 dark:text-purple-300 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* DIMENSIONES Y PESO */}
        {/* ===================================================================== */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Dimensiones y Peso
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.weight.value}
                onChange={(e) => setFormData({
                  ...formData,
                  weight: { ...formData.weight, value: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="2.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Largo (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.attributes.dimensions.length}
                onChange={(e) => setFormData({
                  ...formData,
                  attributes: {
                    ...formData.attributes,
                    dimensions: { ...formData.attributes.dimensions, length: e.target.value }
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="15"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ancho (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.attributes.dimensions.width}
                onChange={(e) => setFormData({
                  ...formData,
                  attributes: {
                    ...formData.attributes,
                    dimensions: { ...formData.attributes.dimensions, width: e.target.value }
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alto (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.attributes.dimensions.height}
                onChange={(e) => setFormData({
                  ...formData,
                  attributes: {
                    ...formData.attributes,
                    dimensions: { ...formData.attributes.dimensions, height: e.target.value }
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="8"
              />
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* ✅ SEO CON META KEYWORDS */}
        {/* ===================================================================== */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            SEO y Optimización
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Título (SEO)
              </label>
              <input
                type="text"
                value={formData.seo.title}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  seo: { ...formData.seo, title: e.target.value } 
                })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Cómo aparecerá en Google..."
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.seo.title.length}/60 caracteres
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Descripción
              </label>
              <textarea
                value={formData.seo.description}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  seo: { ...formData.seo, description: e.target.value } 
                })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Descripción que aparecerá en los resultados de búsqueda..."
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.seo.description.length}/160 caracteres
              </p>
            </div>

            {/* ✅ META KEYWORDS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Palabras Clave (SEO)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: smartphone, tecnología, android"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Agregar
                </button>
              </div>
              {formData.seo.metaKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.seo.metaKeywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(idx)}
                        className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* IMÁGENES */}
        {/* ===================================================================== */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Imágenes
          </h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="url"
              placeholder="URL de la imagen"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
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

          {formData.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img.url}
                    alt={img.alt || 'Producto'}
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
              No hay imágenes agregadas. Agrega al menos una imagen.
            </p>
          )}
        </div>

        {/* ===================================================================== */}
        {/* CONFIGURACIÓN */}
        {/* ===================================================================== */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Configuración
          </h2>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 mb-3">
            <div>
              <span className="block font-bold text-gray-900 dark:text-white">
                Publicar producto
              </span>
              <span className="text-xs text-gray-500">
                Hacer visible en la tienda inmediatamente
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-gray-900 dark:text-white">Producto activo</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-gray-900 dark:text-white">Producto destacado</span>
            </label>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* ACCIONES */}
        {/* ===================================================================== */}
        <div className="flex gap-3 justify-end">
          <Link
            to="/admin/products"
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : isEditMode ? 'Actualizar producto' : 'Crear producto'}
          </button>
        </div>
      </form>
    </div>
  );
}