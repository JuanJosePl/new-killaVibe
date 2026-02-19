/**
 * @module CategoryEntity
 * @description Entidad de dominio Category — 100% pura, sin dependencias externas.
 *
 * Representa el modelo canónico de una categoría tal como lo entiende el dominio.
 * No conoce React, Zustand, axios ni ningún framework.
 *
 * Invariantes de dominio:
 * - name es obligatorio y tiene entre 2 y 100 chars
 * - slug es único y no vacío
 * - parentId puede ser null (categoría raíz)
 * - status ∈ { 'active', 'archived', 'draft' }
 * - No puede tener referencia circular en parentId
 */

export class CategoryEntity {
  /**
   * @param {Object} raw - Datos crudos del backend o del formulario
   */
  constructor(raw = {}) {
    this._id         = raw._id         ?? null;
    this.name        = (raw.name ?? '').trim();
    this.slug        = (raw.slug ?? '').trim();
    this.description = (raw.description ?? '').trim();
    this.parentId    = raw.parentCategory?._id ?? raw.parentCategory ?? null;

    // Imágenes
    this.images = {
      thumbnail : raw.images?.thumbnail ?? null,
      hero      : raw.images?.hero      ?? null,
      icon      : raw.images?.icon      ?? null,
    };

    // SEO
    this.seo = {
      metaTitle       : raw.seo?.metaTitle       ?? null,
      metaDescription : raw.seo?.metaDescription ?? null,
      keywords        : Array.isArray(raw.seo?.keywords) ? raw.seo.keywords : [],
      ogImage         : raw.seo?.ogImage         ?? null,
      ogDescription   : raw.seo?.ogDescription   ?? null,
    };

    // SEO context (viene de CategoryDetailDTO)
    this.seoContext = raw.seoContext ?? null;

    // Estado
    this.featured    = raw.featured    ?? false;
    this.order       = raw.order       ?? 0;
    this.status      = raw.status      ?? 'active';
    this.isActive    = raw.isActive    ?? true;
    this.isPublished = raw.isPublished ?? true;

    // Métricas
    this.productCount    = raw.productCount ?? raw.stats?.productCount ?? 0;
    this.views           = raw.views        ?? raw.stats?.views        ?? 0;

    // Relaciones (sólo IDs o sub-entidades parciales)
    this.subcategories   = Array.isArray(raw.subcategories)
      ? raw.subcategories
      : [];
    this.breadcrumb      = Array.isArray(raw.breadcrumb)
      ? raw.breadcrumb
      : [];

    // Timestamps
    this.createdAt = raw.createdAt ?? null;
    this.updatedAt = raw.updatedAt ?? null;
  }

  /* ─── Queries de estado ─────────────────────────────────────────── */

  get isRoot()            { return this.parentId === null; }
  get hasSubcategories()  { return this.subcategories.length > 0; }
  get hasProducts()       { return this.productCount > 0; }
  get isPublishable()     { return this.isActive && this.isPublished && this.status === 'active'; }
  get hasSEOContext()     { return this.seoContext !== null; }

  /** Imagen de visualización preferida según el contexto */
  getImage(type = 'thumbnail') {
    return this.images[type] ?? this.images.thumbnail ?? null;
  }

  /** URL canónica de la categoría */
  get url() {
    return this.slug ? `/categorias/${this.slug}` : '/categorias';
  }

  /* ─── Serialización ─────────────────────────────────────────────── */

  /** Para enviar al backend en creación */
  toCreatePayload() {
    return {
      name           : this.name,
      description    : this.description || undefined,
      parentCategory : this.parentId    || undefined,
      images         : this._hasImages()  ? this.images  : undefined,
      seo            : this._hasSEO()     ? this.seo     : undefined,
      featured       : this.featured,
      order          : this.order,
    };
  }

  /** Para enviar al backend en actualización */
  toUpdatePayload() {
    return {
      name           : this.name           || undefined,
      description    : this.description    || undefined,
      parentCategory : this.parentId       || undefined,
      images         : this._hasImages()   ? this.images  : undefined,
      seo            : this._hasSEO()      ? this.seo     : undefined,
      featured       : this.featured,
      order          : this.order,
      status         : this.status,
      isActive       : this.isActive,
    };
  }

  /** Representación plana para listados */
  toListItem() {
    return {
      _id          : this._id,
      name         : this.name,
      slug         : this.slug,
      thumbnail    : this.images.thumbnail,
      productCount : this.productCount,
      featured     : this.featured,
      url          : this.url,
    };
  }

  /* ─── Helpers privados ──────────────────────────────────────────── */

  _hasImages() {
    return !!(this.images.thumbnail || this.images.hero || this.images.icon);
  }

  _hasSEO() {
    return !!(this.seo.metaTitle || this.seo.metaDescription || this.seo.keywords.length);
  }

  /* ─── Factory ───────────────────────────────────────────────────── */

  static fromRaw(raw) {
    return new CategoryEntity(raw);
  }

  static empty() {
    return new CategoryEntity({});
  }
}