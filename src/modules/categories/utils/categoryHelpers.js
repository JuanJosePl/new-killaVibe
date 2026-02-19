/**
 * @module categoryHelpers
 * @description Utilidades de presentación para el módulo Category.
 *
 * SÓLO contiene funciones de formateo y filtrado para la UI.
 * La lógica de negocio vive en domain/category.rules.js y domain/category.validators.js.
 * Las transformaciones de entidades viven en domain/category.entity.js.
 */

/**
 * Formatea el conteo de productos para mostrar en UI.
 */
export const formatProductCount = (count) => {
  if (count === undefined || count === null) return 'Cargando...';
  if (count === 0) return '0 productos';
  if (count === 1) return '1 producto';
  if (count < 1000) return `${count} productos`;

  const thousands  = Math.floor(count / 1000);
  const remainder  = count % 1000;

  if (remainder === 0) return `${thousands}k productos`;
  return `${thousands}.${Math.floor(remainder / 100)}k productos`;
};

/**
 * Formatea el conteo de vistas para mostrar en UI.
 */
export const formatViews = (views) => {
  if (!views || views === 0) return '0 vistas';
  if (views < 1000)    return `${views} vistas`;
  if (views < 1000000) return `${(views / 1000).toFixed(1)}k vistas`;
  return `${(views / 1000000).toFixed(1)}M vistas`;
};

/**
 * Formatea fecha relativa.
 */
export const formatCreatedAt = (date) => {
  if (!date) return 'Fecha desconocida';

  const d    = new Date(date);
  const diff = Date.now() - d;

  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(diff / 3600000);
  const days    = Math.floor(diff / 86400000);

  if (minutes < 60)  return `Hace ${minutes} minutos`;
  if (hours   < 24)  return `Hace ${hours} horas`;
  if (days    < 7)   return `Hace ${days} días`;
  if (days    < 30)  return `Hace ${Math.floor(days / 7)} semanas`;
  if (days    < 365) return `Hace ${Math.floor(days / 30)} meses`;

  return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};

/**
 * Color de badge según estado.
 */
export const getStatusColor = (status) =>
  ({ active: 'green', archived: 'gray', draft: 'yellow' }[status] ?? 'gray');

/**
 * Texto de estado localizado.
 */
export const getStatusText = (status) =>
  ({ active: 'Activa', archived: 'Archivada', draft: 'Borrador' }[status] ?? status);

/**
 * Filtra categorías (CategoryEntity[]) por término de búsqueda (uso local/UI).
 * Para búsqueda real contra el backend usar categoriesService.search().
 */
export const filterCategories = (categories, searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) return categories;
  const term = searchTerm.toLowerCase();
  return categories.filter((cat) =>
    cat.name?.toLowerCase().includes(term)         ||
    cat.description?.toLowerCase().includes(term)  ||
    cat.seo?.keywords?.some((k) => k.toLowerCase().includes(term))
  );
};

/**
 * Ordena categorías (CategoryEntity[]) localmente.
 * El backend ya ordena, pero esto sirve para re-ordenar sin fetch.
 */
export const sortCategories = (categories, sortBy = 'order') => {
  const sorted = [...categories];
  switch (sortBy) {
    case 'name':         return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'newest':       return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'views':        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    case 'productCount': return sorted.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
    default:             return sorted.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
};

/**
 * Genera slug a partir de nombre (el backend lo genera, esto es sólo una preview en UI).
 */
export const generateSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');
};