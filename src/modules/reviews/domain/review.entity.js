/**
 * @module ReviewEntity
 * @description Entidad de dominio Review — 100% pura, sin dependencias externas.
 *
 * Una Review es la opinión estructurada de un usuario autenticado sobre un producto.
 *
 * Invariantes de dominio:
 * - productId  es obligatorio
 * - userId     es obligatorio (sólo usuarios autenticados)
 * - rating     ∈ { 1, 2, 3, 4, 5 } — entero, no decimal
 * - comment    tiene entre 10 y 1000 caracteres
 * - title      opcional, máximo 100 caracteres
 * - images     opcional, máximo 5 elementos
 * - status     ∈ { 'approved', 'pending', 'rejected' }
 * - Un usuario puede tener como máximo 1 review por producto (unique index en backend)
 * - Una review puede ser editada por su propietario
 * - Una review puede ser eliminada por su propietario o por admin/moderator
 * - helpfulCount es un contador de votos "útil" — sólo crece vía acción
 * - reportCount  es un contador de reportes — si ≥ 5 se auto-modera
 */

export class ReviewEntity {
  constructor(raw = {}) {
    this._id        = raw._id        ?? null;
    this.productId  = raw.product?._id ?? raw.product  ?? raw.productId  ?? null;
    this.userId     = raw.user?._id    ?? raw.user      ?? raw.userId     ?? null;

    // Datos de usuario embebidos (para renderizado)
    this.user = raw.user
      ? {
          _id    : raw.user._id    ?? raw.user,
          name   : raw.user.name   ?? raw.user.profile?.name ?? '',
          avatar : raw.user.profile?.avatar ?? raw.user.avatar ?? null,
          email  : raw.user.email  ?? '',
        }
      : { _id: this.userId, name: 'Usuario', avatar: null, email: '' };

    // Contenido
    this.rating  = Number(raw.rating)         ?? 0;
    this.title   = (raw.title   ?? '').trim();
    this.comment = (raw.comment ?? '').trim();
    this.images  = Array.isArray(raw.images) ? raw.images : [];

    // Estado
    this.status       = raw.status       ?? 'pending';
    this.isVerified   = raw.isVerified   ?? false;   // compra verificada
    this.isApproved   = raw.isApproved   ?? (this.status === 'approved');

    // Moderación
    this.helpfulCount = raw.helpfulCount ?? 0;
    this.reportCount  = raw.reportCount  ?? 0;
    this.reportedBy   = Array.isArray(raw.reportedBy) ? raw.reportedBy : [];
    this.helpfulVotes = Array.isArray(raw.helpfulVotes) ? raw.helpfulVotes : [];

    // Timestamps
    this.createdAt = raw.createdAt ? new Date(raw.createdAt) : null;
    this.updatedAt = raw.updatedAt ? new Date(raw.updatedAt) : null;
  }

  /* ─── Queries de estado ─────────────────────────────────────────── */

  get isApprovedStatus() { return this.status === 'approved'; }
  get isPending()        { return this.status === 'pending'; }
  get isRejected()       { return this.status === 'rejected'; }
  get hasTitle()         { return this.title.length > 0; }
  get hasImages()        { return this.images.length > 0; }
  get isVerifiedPurchase() { return this.isVerified; }

  /** Rating normalizado como string "4.0" para mostrar */
  get displayRating() { return `${this.rating}.0`; }

  /** Nombre del reviewer para UI */
  get reviewerName() {
    return this.user?.name?.trim() || 'Usuario anónimo';
  }

  /** Iniciales del reviewer para avatar */
  get reviewerInitials() {
    const name = this.reviewerName;
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  /** Si el comentario es largo (necesita "ver más") */
  isLongComment(threshold = 300) {
    return this.comment.length > threshold;
  }

  /** Fecha formateada para UI */
  get formattedDate() {
    if (!this.createdAt) return '';
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
    }).format(this.createdAt);
  }

  /** Fecha relativa para UI */
  get relativeDate() {
    if (!this.createdAt) return '';
    const diff = Date.now() - this.createdAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours   = Math.floor(diff / 3600000);
    const days    = Math.floor(diff / 86400000);
    if (minutes < 60)  return `Hace ${minutes} minutos`;
    if (hours   < 24)  return `Hace ${hours} horas`;
    if (days    < 7)   return `Hace ${days} días`;
    if (days    < 30)  return `Hace ${Math.floor(days / 7)} semanas`;
    if (days    < 365) return `Hace ${Math.floor(days / 30)} meses`;
    return this.formattedDate;
  }

  /* ─── Verificaciones de propiedad ───────────────────────────────── */

  isOwnedBy(userId) {
    if (!userId) return false;
    return String(this.userId) === String(userId);
  }

  hasVotedHelpful(userId) {
    if (!userId) return false;
    return this.helpfulVotes.some((id) => String(id) === String(userId));
  }

  hasReported(userId) {
    if (!userId) return false;
    return this.reportedBy.some((id) => String(id) === String(userId));
  }

  /* ─── Serialización ─────────────────────────────────────────────── */

  /** Para enviar al backend en creación */
  toCreatePayload() {
    return {
      rating  : this.rating,
      comment : this.comment,
      ...(this.title  && { title  : this.title }),
      ...(this.images.length && { images : this.images }),
    };
  }

  /** Para enviar al backend en actualización */
  toUpdatePayload() {
    return {
      ...(this.rating  && { rating  : this.rating }),
      ...(this.comment && { comment : this.comment }),
      ...(this.title   && { title   : this.title }),
      ...(this.images.length && { images : this.images }),
    };
  }

  /* ─── Factory ───────────────────────────────────────────────────── */

  static fromRaw(raw) {
    return new ReviewEntity(raw);
  }

  static empty() {
    return new ReviewEntity({});
  }
}