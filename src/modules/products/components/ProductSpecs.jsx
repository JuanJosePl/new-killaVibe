import {
  Check,
  Package,
  Ruler,
  Weight,
  Palette,
  Layers,
  Box,
  Sparkles,
} from "lucide-react";

/**
 * @component ProductSpecs
 * @description Especificaciones completas del producto
 *
 * ✅ MEJORAS:
 * - Procesa weight.value y weight.unit del nivel raíz
 * - Procesa attributes.weight (string)
 * - Validaciones completas
 * - Iconos dinámicos
 */
export function ProductSpecs({ product, className = "" }) {
  if (!product) return null;

  const { attributes, brand, sku, weight } = product;

  // ✅ Mapping de iconos
  const ATTRIBUTE_ICONS = {
    brand: Package,
    sku: Layers,
    color: Palette,
    size: Ruler,
    material: Layers,
    weight: Weight,
    dimensions: Ruler,
    default: Box,
  };

  // ✅ Helper para normalizar valores
  const normalizeValue = (value) => {
    if (!value) return null;
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : null;
    }
    return String(value);
  };

  // ✅ Helper para formatear labels
  const formatLabel = (key) => {
    return (
      key.charAt(0).toUpperCase() +
      key
        .slice(1)
        .replace(/([A-Z])/g, " $1")
        .trim()
    );
  };

  // ✅ Construir specs
  const specs = [];

  // Marca
  if (brand) {
    specs.push({
      icon: ATTRIBUTE_ICONS.brand,
      label: "Marca",
      value: brand,
    });
  }

  // SKU
  if (sku) {
    specs.push({
      icon: ATTRIBUTE_ICONS.sku,
      label: "SKU",
      value: sku,
    });
  }

  // ✅ NUEVO: Peso del producto (nivel raíz) - PRIORIDAD
  if (weight && typeof weight === "object") {
    const { value, unit = "kg" } = weight;
    if (value) {
      specs.push({
        icon: ATTRIBUTE_ICONS.weight,
        label: "Peso",
        value: `${value} ${unit}`,
      });
    }
  }

  // ✅ Procesar attributes si existen
  if (attributes && typeof attributes === "object") {
    // Color
    if (attributes.color) {
      const colorValue = normalizeValue(attributes.color);
      if (colorValue) {
        specs.push({
          icon: ATTRIBUTE_ICONS.color,
          label: "Color",
          value: colorValue,
        });
      }
    }

    // Tamaño
    if (attributes.size) {
      const sizeValue = normalizeValue(attributes.size);
      if (sizeValue) {
        specs.push({
          icon: ATTRIBUTE_ICONS.size,
          label: "Tamaño",
          value: sizeValue,
        });
      }
    }

    // Material
    if (attributes.material) {
      const materialValue = normalizeValue(attributes.material);
      if (materialValue) {
        specs.push({
          icon: ATTRIBUTE_ICONS.material,
          label: "Material",
          value: materialValue,
        });
      }
    }

    // ✅ Peso en attributes (solo si NO existe en raíz)
    if (!weight && attributes.weight) {
      if (
        typeof attributes.weight === "string" ||
        typeof attributes.weight === "number"
      ) {
        specs.push({
          icon: ATTRIBUTE_ICONS.weight,
          label: "Peso",
          value: String(attributes.weight),
        });
      }
    }

    // ✅ Dimensiones
    if (attributes.dimensions && typeof attributes.dimensions === "object") {
      const { length, width, height, unit = "cm" } = attributes.dimensions;
      if (length && width && height) {
        specs.push({
          icon: ATTRIBUTE_ICONS.dimensions,
          label: "Dimensiones",
          value: `${length} × ${width} × ${height} ${unit}`,
        });
      }
    }

    // ✅ Otros atributos personalizados
    Object.entries(attributes).forEach(([key, value]) => {
      if (["color", "size", "material", "weight", "dimensions"].includes(key)) {
        return;
      }

      const normalizedValue = normalizeValue(value);
      if (normalizedValue) {
        specs.push({
          icon: ATTRIBUTE_ICONS[key] || ATTRIBUTE_ICONS.default,
          label: formatLabel(key),
          value: normalizedValue,
        });
      }
    });
  }

  // ✅ Empty state
  if (specs.length === 0) {
    return (
      <div
        className={`bg-gray-50 rounded-2xl p-6 border border-gray-200 ${className}`}
      >
        <p className="text-gray-500 text-center">
          No hay especificaciones disponibles para este producto.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}
    >
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">
          Especificaciones Técnicas
        </h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specs.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-gray-500 mb-1">
                    {spec.label}
                  </dt>
                  <dd className="text-base font-semibold text-gray-900 break-words">
                    {spec.value}
                  </dd>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * @component ProductFeatures
 * @description Características destacadas del producto
 *
 * ✅ MEJORAS:
 * - Características dinámicas desde atributos
 * - Validaciones completas
 */
export function ProductFeatures({ product, className = "" }) {
  if (!product) return null;

  const features = [];

  // ✅ Extraer características reales
  if (product.attributes && typeof product.attributes === "object") {
    Object.entries(product.attributes).forEach(([key, value]) => {
      const normalizedValue = Array.isArray(value)
        ? value.filter(Boolean).join(", ")
        : value;

      if (normalizedValue && String(normalizedValue).trim()) {
        features.push({
          title:
            key.charAt(0).toUpperCase() +
            key
              .slice(1)
              .replace(/([A-Z])/g, " $1")
              .trim(),
          description: String(normalizedValue),
        });
      }
    });
  }

  // ✅ Características del shipping
  if (product.requiresShipping === false) {
    features.push({
      title: "Producto Digital",
      description: "Sin envío físico requerido",
    });
  }

  // ✅ Características del stock
  if (product.allowBackorder) {
    features.push({
      title: "Pre-orden Disponible",
      description: "Puedes ordenar incluso sin stock",
    });
  }

  // ✅ Características destacadas (si está marcado)
  if (product.isFeatured) {
    features.push({
      title: "Producto Destacado",
      description: "Seleccionado por nuestro equipo",
    });
  }

  // ✅ Empty state
  if (features.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}
    >
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          Características
        </h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-blue-600 mt-0.5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{feature.title}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
