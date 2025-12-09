import { Check, Package, Ruler, Weight, Palette, Layers } from 'lucide-react';

/**
 * ProductSpecs - Componente de especificaciones del producto
 * Integrado con la estructura del backend de KillaVibes
 * 
 * @param {Object} product - Producto completo del backend
 */
export function ProductSpecs({ product, className = '' }) {
  if (!product) return null;

  const { attributes, brand, sku } = product;

  // Organizar especificaciones en grupos
  const specs = [];

  // Información básica
  if (brand) {
    specs.push({ icon: Package, label: 'Marca', value: brand });
  }

  if (sku) {
    specs.push({ icon: Layers, label: 'SKU', value: sku });
  }

  // Atributos del producto
  if (attributes) {
    // Color
    if (attributes.color && attributes.color.length > 0) {
      specs.push({ 
        icon: Palette, 
        label: 'Color', 
        value: Array.isArray(attributes.color) ? attributes.color.join(', ') : attributes.color 
      });
    }

    // Tamaño
    if (attributes.size && attributes.size.length > 0) {
      specs.push({ 
        icon: Ruler, 
        label: 'Tamaño', 
        value: Array.isArray(attributes.size) ? attributes.size.join(', ') : attributes.size 
      });
    }

    // Material
    if (attributes.material && attributes.material.length > 0) {
      specs.push({ 
        icon: Layers, 
        label: 'Material', 
        value: Array.isArray(attributes.material) ? attributes.material.join(', ') : attributes.material 
      });
    }

    // Peso
    if (attributes.weight) {
      specs.push({ 
        icon: Weight, 
        label: 'Peso', 
        value: attributes.weight 
      });
    }

    // Dimensiones
    if (attributes.dimensions) {
      const { length, width, height, unit = 'cm' } = attributes.dimensions;
      if (length && width && height) {
        specs.push({ 
          icon: Ruler, 
          label: 'Dimensiones', 
          value: `${length} x ${width} x ${height} ${unit}` 
        });
      }
    }

    // Otros atributos personalizados
    Object.entries(attributes).forEach(([key, value]) => {
      // Saltar los que ya procesamos
      if (['color', 'size', 'material', 'weight', 'dimensions'].includes(key)) {
        return;
      }

      // Solo agregar si tiene valor
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        specs.push({
          icon: Check,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          value: Array.isArray(value) ? value.join(', ') : value.toString()
        });
      }
    });
  }

  if (specs.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-2xl p-6 border border-gray-200 ${className}`}>
        <p className="text-gray-500 text-center">
          No hay especificaciones disponibles para este producto.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">Especificaciones Técnicas</h3>
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
 * ProductFeatures - Lista de características destacadas
 */
export function ProductFeatures({ product, className = '' }) {
  if (!product) return null;

  // Extraer características del producto
  const features = [];

  if (product.attributes) {
    Object.entries(product.attributes).forEach(([key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        const formattedValue = Array.isArray(value) ? value.join(', ') : value.toString();
        features.push({
          title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          description: formattedValue
        });
      }
    });
  }

  // Características adicionales por defecto
  const defaultFeatures = [
    { title: 'Envío Gratis', description: 'En Barranquilla y Soledad' },
    { title: 'Garantía', description: '12 meses incluida' },
    { title: 'Soporte', description: 'Atención 24/7' },
  ];

  if (features.length === 0 && defaultFeatures.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">Características Destacadas</h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Características del producto */}
          {features.map((feature, index) => (
            <div
              key={`feature-${index}`}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{feature.title}</p>
                <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
              </div>
            </div>
          ))}

          {/* Características adicionales */}
          {defaultFeatures.map((feature, index) => (
            <div
              key={`default-${index}`}
              className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-blue-600 mt-0.5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{feature.title}</p>
                <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}