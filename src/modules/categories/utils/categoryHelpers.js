/**
 * @module categoryHelpers
 * @description Utilidades para trabajar con categorías
 */

/**
 * Verifica si una categoría está vacía
 */
export const isCategoryEmpty = (category) => {
  return !category || Object.keys(category).length === 0;
};

/**
 * Verifica si es categoría raíz (sin padre)
 */
export const isRootCategory = (category) => {
  return !category?.parentCategory;
};

/**
 * Verifica si tiene subcategorías
 */
export const hasSubcategories = (category) => {
  return category?.subcategories && category.subcategories.length > 0;
};

/**
 * Verifica si tiene productos
 */
export const hasProducts = (category) => {
  return category?.productCount > 0;
};

/**
 * Verifica si está activa y publicada
 */
export const isActive = (category) => {
  return category?.isActive && category?.isPublished && category?.status === 'active';
};

/**
 * Verifica si es destacada
 */
export const isFeatured = (category) => {
  return category?.featured === true;
};

/**
 * Obtiene imagen de categoría (thumbnail por defecto)
 */
export const getCategoryImage = (category, type = 'thumbnail') => {
  const defaultImage = '/images/category-placeholder.jpg';
  
  if (!category?.images) return defaultImage;
  
  return category.images[type] || category.images.thumbnail || defaultImage;
};

/**
 * Formatea el conteo de productos
 */
export const formatProductCount = (count) => {
  if (!count || count === 0) return 'Sin productos';
  if (count === 1) return '1 producto';
  if (count < 1000) return `${count} productos`;
  
  const thousands = Math.floor(count / 1000);
  const remainder = count % 1000;
  
  if (remainder === 0) return `${thousands}k productos`;
  return `${thousands}.${Math.floor(remainder / 100)}k productos`;
};

/**
 * Formatea el conteo de vistas
 */
export const formatViews = (views) => {
  if (!views || views === 0) return '0 vistas';
  if (views < 1000) return `${views} vistas`;
  if (views < 1000000) return `${(views / 1000).toFixed(1)}k vistas`;
  return `${(views / 1000000).toFixed(1)}M vistas`;
};

/**
 * Genera URL de categoría
 */
export const getCategoryUrl = (category) => {
  if (!category?.slug) return '/categorias';
  return `/categorias/${category.slug}`;
};

/**
 * Genera breadcrumb para UI
 */
export const formatBreadcrumb = (breadcrumb) => {
  if (!breadcrumb || !Array.isArray(breadcrumb)) return [];
  
  return breadcrumb.map((item) => ({
    label: item.name,
    href: item.url || getCategoryUrl(item),
  }));
};

/**
 * Obtiene nivel de profundidad de categoría
 */
export const getCategoryDepth = (category, allCategories) => {
  let depth = 0;
  let current = category;

  while (current?.parentCategory) {
    depth++;
    current = allCategories.find((c) => c._id === current.parentCategory);
    
    if (depth > 10) break; // Prevenir loops infinitos
  }

  return depth;
};

/**
 * Filtra categorías por búsqueda
 */
export const filterCategories = (categories, searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) return categories;

  const term = searchTerm.toLowerCase();

  return categories.filter((cat) => {
    return (
      cat.name?.toLowerCase().includes(term) ||
      cat.description?.toLowerCase().includes(term) ||
      cat.seo?.keywords?.some((k) => k.toLowerCase().includes(term))
    );
  });
};

/**
 * Ordena categorías
 */
export const sortCategories = (categories, sortBy = 'order') => {
  const sorted = [...categories];

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    case 'views':
      return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    
    case 'productCount':
      return sorted.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
    
    case 'order':
    default:
      return sorted.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
};

/**
 * Agrupa categorías por padre
 */
export const groupByParent = (categories) => {
  const grouped = {};

  categories.forEach((cat) => {
    const parentId = cat.parentCategory?._id || cat.parentCategory || 'root';
    
    if (!grouped[parentId]) {
      grouped[parentId] = [];
    }
    
    grouped[parentId].push(cat);
  });

  return grouped;
};

/**
 * Obtiene path completo de categoría como string
 */
export const getCategoryPath = (category) => {
  if (!category) return '';
  
  if (category.breadcrumb && Array.isArray(category.breadcrumb)) {
    return category.breadcrumb.map((b) => b.name).join(' > ');
  }
  
  return category.name;
};

/**
 * Calcula estadísticas de categoría
 */
export const getCategoryStats = (category) => {
  return {
    hasProducts: hasProducts(category),
    hasSubcategories: hasSubcategories(category),
    isActive: isActive(category),
    isFeatured: isFeatured(category),
    productCount: category?.productCount || 0,
    views: category?.views || 0,
    level: category?.level || 0,
  };
};

/**
 * Valida nombre de categoría (cliente)
 */
export const validateCategoryName = (name) => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'El nombre es requerido' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }
  
  if (name.length > 100) {
    return { valid: false, error: 'El nombre no puede exceder 100 caracteres' };
  }
  
  return { valid: true };
};

/**
 * Genera slug a partir de nombre (opcional - backend lo hace)
 */
export const generateSlug = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9 -]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .trim()
    .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio/fin
};

/**
 * Formatea fecha de creación
 */
export const formatCreatedAt = (date) => {
  if (!date) return 'Fecha desconocida';
  
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `Hace ${minutes} minutos`;
  if (hours < 24) return `Hace ${hours} horas`;
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
  if (days < 365) return `Hace ${Math.floor(days / 30)} meses`;
  
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Obtiene color para badge de estado
 */
export const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    archived: 'gray',
    draft: 'yellow',
  };
  
  return colors[status] || 'gray';
};

/**
 * Obtiene texto de estado
 */
export const getStatusText = (status) => {
  const texts = {
    active: 'Activa',
    archived: 'Archivada',
    draft: 'Borrador',
  };
  
  return texts[status] || status;
};

/**
 * Verifica si puede ser eliminada
 */
export const canDelete = (category) => {
  return !hasSubcategories(category) && !hasProducts(category);
};

/**
 * Obtiene mensaje de error al intentar eliminar
 */
export const getDeleteErrorMessage = (category) => {
  if (hasSubcategories(category)) {
    return 'No se puede eliminar una categoría con subcategorías activas';
  }
  
  if (hasProducts(category)) {
    return 'No se puede eliminar una categoría con productos asociados';
  }
  
  return null;
};

/**
 * Exportación por defecto
 */
export default {
  isCategoryEmpty,
  isRootCategory,
  hasSubcategories,
  hasProducts,
  isActive,
  isFeatured,
  getCategoryImage,
  formatProductCount,
  formatViews,
  getCategoryUrl,
  formatBreadcrumb,
  getCategoryDepth,
  filterCategories,
  sortCategories,
  groupByParent,
  getCategoryPath,
  getCategoryStats,
  validateCategoryName,
  generateSlug,
  formatCreatedAt,
  getStatusColor,
  getStatusText,
  canDelete,
  getDeleteErrorMessage,
};