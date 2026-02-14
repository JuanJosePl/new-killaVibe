"use client"
import { TrendingDown, DollarSign, Tag, Zap } from "lucide-react"

/**
 * @component PriceSection
 * @description Sección de precio premium sin calculadoras
 */
const PriceSection = ({ product, quantity, discount }) => {
  const basePrice = product.price * quantity
  const comparePrice = product.comparePrice ? product.comparePrice * quantity : 0
  const savings = comparePrice > basePrice ? comparePrice - basePrice : 0

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 shadow-xl space-y-6 overflow-hidden">
      {/* 🌟 Background Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -z-0"></div>
      
      <div className="relative z-10">
        {/* 💰 PRECIO PRINCIPAL */}
        <div className="flex items-end gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-10 h-10 text-blue-600" />
            <span className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight">
              ${basePrice.toLocaleString("es-CO")}
            </span>
          </div>
          
          {product.comparePrice && product.comparePrice > product.price && (
            <div className="flex flex-col items-start mb-2">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Antes</span>
              <span className="text-3xl text-gray-400 line-through font-bold">
                ${comparePrice.toLocaleString("es-CO")}
              </span>
            </div>
          )}
        </div>

        {/* 🎯 BADGES DE VALOR */}
        <div className="flex flex-wrap gap-3">
          {/* Badge de Ahorro */}
          {discount > 0 && savings > 0 && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
              <TrendingDown className="w-5 h-5" />
              <div className="flex flex-col items-start">
                <span className="text-xs font-semibold opacity-90">Ahorras</span>
                <span className="text-lg font-black">
                  ${savings.toLocaleString("es-CO")} ({discount}% OFF)
                </span>
              </div>
            </div>
          )}

          {/* Badge de Descuento */}
          {discount > 0 && (
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
              <Tag className="w-5 h-5" />
              <span className="text-xl font-black">{discount}% OFF</span>
            </div>
          )}

          {/* Badge de Precio Especial */}
          {product.isFeatured && (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-bold">¡OFERTA ESPECIAL!</span>
            </div>
          )}
        </div>

        {/* 📦 INFO DE CANTIDAD */}
        {quantity > 1 && (
          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-semibold">Precio unitario:</span>
              <span className="text-2xl font-black text-gray-900">
                ${product.price.toLocaleString("es-CO")}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-700 font-semibold">Cantidad:</span>
              <span className="text-2xl font-black text-blue-600">x{quantity}</span>
            </div>
          </div>
        )}

        {/* 🚚 ENVÍO GRATIS */}
        {basePrice >= 100000 && (
          <div className="mt-4 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-green-500 text-white rounded-full p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-green-900">¡Envío GRATIS!</p>
              <p className="text-sm text-green-700">Tu compra califica para envío sin costo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PriceSection