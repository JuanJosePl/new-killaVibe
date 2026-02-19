/**
 * @module CategoryValidators
 * @description Validaciones de dominio para Category.
 *
 * Fuente única de verdad para todas las reglas de validación.
 * Sincronizado con category.validation.js (Joi) del backend.
 * Sin dependencias de Yup, React ni otros frameworks — puro JS.
 *
 * Retornan siempre: { valid: boolean, error?: string }
 */

/* ─── Primitivas ─────────────────────────────────────────────────── */

const ok  = ()      => ({ valid: true });
const err = (msg)   => ({ valid: false, error: msg });

/* ─── Validadores de campo ───────────────────────────────────────── */

export const validateName = (name) => {
  if (!name || typeof name !== 'string') return err('El nombre es requerido.');
  const trimmed = name.trim();
  if (trimmed.length < 2)   return err('El nombre debe tener al menos 2 caracteres.');
  if (trimmed.length > 100) return err('El nombre no puede exceder 100 caracteres.');
  return ok();
};

export const validateDescription = (description) => {
  if (!description) return ok(); // opcional
  if (description.trim().length > 1000) {
    return err('La descripción no puede exceder 1000 caracteres.');
  }
  return ok();
};

export const validateSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return err('El slug es requerido.');
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    return err('El slug sólo puede contener letras minúsculas, números y guiones.');
  }
  return ok();
};

export const validateOrder = (order) => {
  if (order === undefined || order === null) return ok(); // opcional
  if (!Number.isInteger(order) || order < 0) {
    return err('El orden debe ser un número entero no negativo.');
  }
  return ok();
};

export const validateStatus = (status) => {
  const valid = ['active', 'archived', 'draft'];
  if (!valid.includes(status)) {
    return err(`El estado debe ser uno de: ${valid.join(', ')}.`);
  }
  return ok();
};

export const validateImageUrl = (url) => {
  if (!url) return ok(); // opcional
  try {
    new URL(url);
    return ok();
  } catch {
    return err('La URL de la imagen no es válida.');
  }
};

export const validateMetaTitle = (title) => {
  if (!title) return ok();
  if (title.length > 60) return err('El meta title no puede exceder 60 caracteres.');
  return ok();
};

export const validateMetaDescription = (desc) => {
  if (!desc) return ok();
  if (desc.length > 160) return err('La meta descripción no puede exceder 160 caracteres.');
  return ok();
};

export const validateKeyword = (keyword) => {
  if (keyword.length > 50) return err('Cada keyword no puede exceder 50 caracteres.');
  return ok();
};

export const validateSearchQuery = (query) => {
  if (!query || query.trim().length < 2) {
    return err('El término de búsqueda debe tener al menos 2 caracteres.');
  }
  return ok();
};

/* ─── Validadores de objeto completo ─────────────────────────────── */

/**
 * Valida datos para CREAR una categoría.
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export const validateCreatePayload = (data = {}) => {
  const errors = {};

  const nameResult = validateName(data.name);
  if (!nameResult.valid) errors.name = nameResult.error;

  const descResult = validateDescription(data.description);
  if (!descResult.valid) errors.description = descResult.error;

  const orderResult = validateOrder(data.order);
  if (!orderResult.valid) errors.order = orderResult.error;

  if (data.images) {
    ['thumbnail', 'hero', 'icon'].forEach((key) => {
      if (data.images[key]) {
        const r = validateImageUrl(data.images[key]);
        if (!r.valid) errors[`images.${key}`] = r.error;
      }
    });
  }

  if (data.seo) {
    const mt = validateMetaTitle(data.seo.metaTitle);
    if (!mt.valid) errors['seo.metaTitle'] = mt.error;

    const md = validateMetaDescription(data.seo.metaDescription);
    if (!md.valid) errors['seo.metaDescription'] = md.error;

    if (Array.isArray(data.seo.keywords)) {
      data.seo.keywords.forEach((kw, i) => {
        const kr = validateKeyword(kw);
        if (!kr.valid) errors[`seo.keywords[${i}]`] = kr.error;
      });
    }
  }

  return {
    valid : Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Valida datos para ACTUALIZAR una categoría.
 * Al menos un campo debe estar presente.
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export const validateUpdatePayload = (data = {}) => {
  const errors = {};

  if (Object.keys(data).length === 0) {
    errors._root = 'Debe proporcionar al menos un campo para actualizar.';
    return { valid: false, errors };
  }

  if (data.name !== undefined) {
    const r = validateName(data.name);
    if (!r.valid) errors.name = r.error;
  }

  if (data.description !== undefined) {
    const r = validateDescription(data.description);
    if (!r.valid) errors.description = r.error;
  }

  if (data.order !== undefined) {
    const r = validateOrder(data.order);
    if (!r.valid) errors.order = r.error;
  }

  if (data.status !== undefined) {
    const r = validateStatus(data.status);
    if (!r.valid) errors.status = r.error;
  }

  if (data.images) {
    ['thumbnail', 'hero', 'icon'].forEach((key) => {
      if (data.images[key]) {
        const r = validateImageUrl(data.images[key]);
        if (!r.valid) errors[`images.${key}`] = r.error;
      }
    });
  }

  if (data.seo) {
    if (data.seo.metaTitle) {
      const r = validateMetaTitle(data.seo.metaTitle);
      if (!r.valid) errors['seo.metaTitle'] = r.error;
    }
    if (data.seo.metaDescription) {
      const r = validateMetaDescription(data.seo.metaDescription);
      if (!r.valid) errors['seo.metaDescription'] = r.error;
    }
  }

  return {
    valid  : Object.keys(errors).length === 0,
    errors,
  };
};