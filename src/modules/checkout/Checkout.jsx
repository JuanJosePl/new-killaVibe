import React, { useMemo, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useCart } from "../cart/hooks/useCart";
import CartSummary from "../cart/presentation/components/CartSummary";
import { formatPrice } from "../cart/utils/cartHelpers";

const EPAYCO_PUBLIC_KEY = import.meta.env.VITE_EPAYCO_PUBLIC_KEY || "";
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb"; // sandbox por defecto

const CheckoutPage = () => {
  const { cart, summary, items, loading } = useCart();

  // Datos de contacto simples (no se persisten en localStorage para no exponer info)
  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
    document: "",
  });

  const grandTotal = useMemo(() => {
    if (!summary) return 0;
    // Total del carrito + IVA 19% (summary.tax ya se calcula al 19% en helpers)
    return (summary.total || 0) + (summary.tax || 0);
  }, [summary]);

  const isCartEmpty = !items || items.length === 0;

  const handleChangeCustomer = (field, value) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const handleEpayco = () => {
    if (!EPAYCO_PUBLIC_KEY || !window.ePayco) return;
    if (!summary || grandTotal <= 0 || isCartEmpty) return;

    const handler = window.ePayco.checkout.configure({
      key: EPAYCO_PUBLIC_KEY,
      test: import.meta.env.DEV, // solo modo test en desarrollo
    });

    // Cálculo de base e IVA (19%)
    const tax = summary.tax || 0;
    const taxBase = grandTotal - tax;

    handler.open({
      name: "KillaVibes Store",
      description: "Compra de productos tecnológicos",
      currency: "usd", // ajusta a la moneda real de tu cuenta
      amount: grandTotal.toFixed(2),
      tax_base: taxBase.toFixed(2),
      tax: tax.toFixed(2),
      country: "co",
      lang: "es",
      external: "false",
      // URLs deben ser manejadas desde backend / entorno
      confirmation: import.meta.env.VITE_EPAYCO_CONFIRMATION_URL || "",
      response: import.meta.env.VITE_EPAYCO_RESPONSE_URL || "",
      // Datos básicos del cliente (no sensibles)
      name_billing: customer.fullName,
      email_billing: customer.email,
      mobilephone_billing: customer.phone,
      // Nunca enviamos números de tarjeta ni documentos completos desde el frontend
    });
  };

  if (!loading && isCartEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Tu carrito está vacío
          </h1>
          <p className="text-gray-600">
            Agrega productos al carrito antes de continuar al checkout.
          </p>
          <a
            href="/productos"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Ver productos
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] gap-8">
        {/* Columna izquierda: Datos del cliente + métodos de pago */}
        <div className="space-y-6">
          {/* Datos del cliente */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Datos de contacto
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Solo pedimos la información mínima necesaria para procesar tu
              pago. Nunca almacenamos datos de tarjetas en nuestros servidores.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={customer.fullName}
                  onChange={(e) =>
                    handleChangeCustomer("fullName", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) =>
                    handleChangeCustomer("email", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={(e) =>
                    handleChangeCustomer("phone", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="tel"
                />
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Al continuar aceptas nuestros términos, política de privacidad y
              política de tratamiento de datos. Los pagos son procesados de
              forma segura por ePayco y PayPal.
            </p>
          </section>

          {/* Métodos de pago */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Método de pago
            </h2>

            <div className="space-y-6">
              {/* ePayco */}
              <div className="p-4 border-2 border-blue-50 rounded-xl bg-blue-50/40">
                <p className="text-sm text-blue-900 font-medium mb-3">
                  Tarjeta, PSE o efectivo (Colombia)
                </p>
                <button
                  onClick={handleEpayco}
                  disabled={!EPAYCO_PUBLIC_KEY || grandTotal <= 0}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-lg shadow-blue-200 text-sm"
                >
                  {EPAYCO_PUBLIC_KEY
                    ? "Pagar con ePayco"
                    : "Configura VITE_EPAYCO_PUBLIC_KEY"}
                </button>
                <p className="mt-2 text-[11px] text-blue-900/80">
                  Serás redirigido al módulo seguro de ePayco. Nosotros nunca
                  vemos ni almacenamos los datos de tu tarjeta.
                </p>
              </div>

              {/* Separador */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">
                    Otras opciones internacionales
                  </span>
                </div>
              </div>

              {/* PayPal */}
              <div className="p-4 border border-yellow-100 rounded-xl bg-yellow-50/40">
                <p className="text-sm text-gray-800 font-medium mb-3">
                  PayPal (tarjeta o saldo PayPal)
                </p>
                <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID }}>
                  <PayPalButtons
                    style={{ layout: "vertical", shape: "rect" }}
                    disabled={grandTotal <= 0}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: { value: grandTotal.toFixed(2) },
                          },
                        ],
                      });
                    }}
                  />
                </PayPalScriptProvider>
                {!PAYPAL_CLIENT_ID && (
                  <p className="mt-2 text-[11px] text-red-600">
                    Configura `VITE_PAYPAL_CLIENT_ID` en tu entorno para
                    habilitar pagos reales.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Columna derecha: resumen profesional del pedido */}
        <aside className="space-y-4">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl sticky top-20">
            <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-3">
              Resumen del pedido
            </h3>

            {/* Listado compacto de items */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.product?._id || item._id}
                  className="flex justify-between text-slate-200 text-sm"
                >
                  <span className="truncate max-w-[60%]">
                    {item.product?.name || "Producto"}{" "}
                    <span className="text-slate-400">
                      (x{item.quantity || 1})
                    </span>
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.price * (item.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>

            {summary && (
              <>
                <div className="border-t border-slate-700 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal</span>
                    <span>{formatPrice(summary.subtotal)}</span>
                  </div>
                  {summary.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Descuento</span>
                      <span>-{formatPrice(summary.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300">
                    <span>Envío</span>
                    <span>
                      {summary.shipping === 0
                        ? "Gratis"
                        : formatPrice(summary.shipping)}
                    </span>
                  </div>
                  {summary.tax > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>IVA (19%)</span>
                      <span>{formatPrice(summary.tax)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-700 mt-3 pt-4 flex justify-between items-end">
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wide">
                      Total a pagar
                    </p>
                    <p className="text-3xl font-extrabold text-blue-400">
                      {formatPrice(grandTotal)}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
                    {cart?.currency || "USD"}
                  </span>
                </div>
              </>
            )}

            <p className="mt-4 text-[11px] text-slate-400">
              Tus datos de pago se procesan mediante proveedores certificados
              (PCI DSS). KillaVibes nunca almacena la información de tu tarjeta.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;