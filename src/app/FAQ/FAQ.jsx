// src/app/ayuda/FAQPage.jsx
import React from 'react';

const faqData = [
  {
    category: "Pedidos y Pagos",
    items: [
      { q: "¿Qué métodos de pago aceptan en Colombia?", a: "Contamos con una pasarela cifrada que acepta tarjetas de crédito (Visa, Mastercard, Amex), PSE, Nequi, Daviplata y pagos en efectivo a través de Effecty." },
      { q: "¿Es seguro comprar en KillaVibes?", a: "Totalmente. Utilizamos certificados SSL de 256 bits y cumplimos con los estándares PCI DSS para garantizar que tus datos financieros nunca sean almacenados en nuestros servidores." },
      { q: "¿Puedo solicitar una factura legal para mi empresa?", a: "Sí. Durante el checkout, selecciona la opción 'Factura Electrónica' e ingresa el NIT y razón social. Se enviará automáticamente a tu correo registrado conforme a la normativa DIAN." }
    ]
  },
  {
    category: "Envíos y Logística",
    items: [
      { q: "¿A qué ciudades de Colombia realizan envíos?", a: "Llegamos a más del 98% del territorio nacional a través de aliados como Servientrega, Envia e Interrapidísimo. Para zonas de difícil acceso, los tiempos pueden variar." },
      { q: "¿Cómo puedo rastrear mi pedido?", a: "Una vez despachado, recibirás un correo y un SMS con la guía de transporte. También puedes consultarlo en tu panel de 'Mis Pedidos' dentro de la plataforma." },
      { q: "¿Cuál es el tiempo de entrega estimado?", a: "Para Bogotá y Medellín: 1-2 días hábiles. Otras ciudades principales: 2-4 días hábiles. Trayectos especiales: hasta 7 días hábiles." }
    ]
  },
  {
    category: "Garantías y Devoluciones",
    items: [
      { q: "¿Cómo ejerzo mi derecho al retracto?", a: "Conforme a la Ley 1480, tienes 5 días hábiles tras recibir el producto para retractarte. El producto debe estar sellado y en empaque original. Los costos de envío corren por cuenta del cliente." },
      { q: "¿Qué hago si mi producto llega defectuoso?", a: "Dispones de 24 horas tras la entrega para reportar daños físicos. Si es una falla técnica, inicia el proceso de garantía desde tu perfil de usuario." },
      { q: "¿Cuánto tiempo tiene de garantía la tecnología en KillaVibes?", a: "Ofrecemos una garantía estándar de 12 meses por defectos de fábrica, salvo que la ficha técnica del producto especifique un periodo diferente." },
      { q: "¿Hacen cambios si el producto no me gustó?", a: "Sí, siempre que el empaque no haya sido abierto y los sellos de seguridad estén intactos, dentro de los primeros 3 días calendario." }
    ]
  }
];

export default function FAQPage() {
  return (
    <div className="max-w-5xl mx-auto py-16 px-6">
      <header className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Centro de Ayuda</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">Todo lo que necesitas saber sobre tu experiencia KillaVibes.</p>
      </header>
      
      <div className="grid gap-12">
        {faqData.map((section, idx) => (
          <section key={idx}>
            <h2 className="text-2xl font-bold text-blue-600 mb-6 border-b pb-2">{section.category}</h2>
            <div className="grid gap-4">
              {section.items.map((item, i) => (
                <details key={i} className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all hover:shadow-md">
                  <summary className="flex justify-between items-center p-5 cursor-pointer list-none font-semibold text-slate-800 dark:text-slate-200">
                    {item.q}
                    <span className="text-blue-500 transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  <div className="p-5 pt-0 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700/50">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}