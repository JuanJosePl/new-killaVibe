/**
 * @module CategoryModel
 * @description Modelos de valor del dominio Category.
 *
 * Define estructuras tipadas (como value objects) que se usan
 * para transferir datos dentro y entre capas de forma controlada.
 * Sin lógica de UI ni de infraestructura.
 */

/* ─── Breadcrumb Item ────────────────────────────────────────────── */

export class BreadcrumbItem {
  constructor({ _id, name, slug, url }) {
    this._id  = _id  ?? null;
    this.name = name ?? '';
    this.slug = slug ?? '';
    this.url  = url  ?? (slug ? `/categorias/${slug}` : '/categorias');
  }

  static fromRaw(raw) {
    return new BreadcrumbItem(raw);
  }
}

/* ─── Category Image Set ─────────────────────────────────────────── */

export class CategoryImages {
  static PLACEHOLDER = '/images/category-placeholder.jpg';

  constructor({ thumbnail, hero, icon } = {}) {
    this.thumbnail = thumbnail ?? null;
    this.hero      = hero      ?? null;
    this.icon      = icon      ?? null;
  }

  resolve(type = 'thumbnail') {
    return this[type] ?? this.thumbnail ?? CategoryImages.PLACEHOLDER;
  }

  static fromRaw(raw) {
    return new CategoryImages(raw ?? {});
  }
}

/* ─── Category SEO ───────────────────────────────────────────────── */

export class CategorySEO {
  constructor(raw = {}) {
    this.metaTitle       = raw.metaTitle       ?? null;
    this.metaDescription = raw.metaDescription ?? null;
    this.keywords        = Array.isArray(raw.keywords) ? raw.keywords : [];
    this.ogImage         = raw.ogImage         ?? null;
    this.ogDescription   = raw.ogDescription   ?? null;
  }

  static fromRaw(raw) {
    return new CategorySEO(raw ?? {});
  }
}

/* ─── Category SEO Context (backend-computed) ────────────────────── */

export class CategorySEOContext {
  constructor(raw = {}) {
    this.title          = raw.title          ?? '';
    this.description    = raw.description    ?? '';
    this.keywords       = raw.keywords       ?? '';
    this.ogTitle        = raw.ogTitle        ?? '';
    this.ogDescription  = raw.ogDescription  ?? '';
    this.ogImage        = raw.ogImage        ?? null;
    this.canonicalUrl   = raw.canonicalUrl   ?? '';
    this.metaTags       = raw.metaTags       ?? {};
    this.breadcrumb     = Array.isArray(raw.breadcrumb)
      ? raw.breadcrumb.map(BreadcrumbItem.fromRaw)
      : [];
  }

  /** Devuelve objeto listo para React Helmet */
  toHelmetProps() {
    return {
      title       : this.metaTags.title       || this.title,
      description : this.metaTags.description || this.description,
      keywords    : this.metaTags.keywords    || this.keywords,
      ogTitle     : this.metaTags['og:title'] || this.ogTitle,
      ogDesc      : this.metaTags['og:description'] || this.ogDescription,
      ogImage     : this.metaTags['og:image'] || this.ogImage,
      canonical   : this.metaTags.canonical   || this.canonicalUrl,
    };
  }

  static fromRaw(raw) {
    return new CategorySEOContext(raw ?? {});
  }
}

/* ─── Pagination ─────────────────────────────────────────────────── */

export class CategoryPagination {
  constructor({ page = 1, limit = 50, total = 0, pages = 0 } = {}) {
    this.page  = page;
    this.limit = limit;
    this.total = total;
    this.pages = pages;
  }

  get hasMore() { return this.page < this.pages; }
  get hasPrev() { return this.page > 1; }

  static fromRaw(raw, fallback = {}) {
    return new CategoryPagination({
      page  : raw?.page  ?? fallback.page  ?? 1,
      limit : raw?.limit ?? fallback.limit ?? 50,
      total : raw?.total ?? fallback.total ?? 0,
      pages : raw?.pages ?? fallback.pages ?? 0,
    });
  }

  static empty() {
    return new CategoryPagination();
  }
}

/* ─── Tree Node ──────────────────────────────────────────────────── */

export class CategoryTreeNode {
  constructor(raw = {}) {
    this._id          = raw._id          ?? null;
    this.name         = raw.name         ?? '';
    this.slug         = raw.slug         ?? '';
    this.productCount = raw.productCount ?? 0;
    this.images       = CategoryImages.fromRaw(raw.images);
    this.children     = Array.isArray(raw.children)
      ? raw.children.map(CategoryTreeNode.fromRaw)
      : [];
  }

  get hasChildren() { return this.children.length > 0; }
  get url()         { return `/categorias/${this.slug}`; }

  static fromRaw(raw) {
    return new CategoryTreeNode(raw);
  }
}

/* ─── Flat Category (for selects / breadcrumb resolution) ───────── */

export class FlatCategory {
  constructor({ _id, name, slug, level, parentPath, hasChildren, productCount }) {
    this._id          = _id          ?? null;
    this.name         = name         ?? '';
    this.slug         = slug         ?? '';
    this.level        = level        ?? 0;
    this.parentPath   = parentPath   ?? [];
    this.fullPath     = [...parentPath, name].join(' > ');
    this.hasChildren  = hasChildren  ?? false;
    this.productCount = productCount ?? 0;
  }
}