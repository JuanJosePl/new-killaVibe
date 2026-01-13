// src/app/legal/CookiesPage.jsx
export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-8">
      <h1 className="text-4xl font-black mb-8 dark:text-white text-center">Uso de Cookies</h1>
      
      <div className="grid gap-8 text-slate-600 dark:text-slate-400 leading-relaxed">
        <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">¿Qué son las cookies en KillaVibes?</h2>
          <p>
            Las cookies son pequeños archivos de datos que se descargan en su dispositivo para permitir funciones esenciales, como mantener su sesión iniciada, recordar productos en el carrito y personalizar el contenido publicitario según sus intereses.
          </p>
        </div>

        <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="p-4 font-bold text-slate-900 dark:text-white">Tipo</th>
                <th className="p-4 font-bold text-slate-900 dark:text-white">Función</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
              <tr>
                <td className="p-4 font-semibold">Técnicas</td>
                <td className="p-4">Necesarias para el funcionamiento del sitio y la seguridad. No se pueden desactivar.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Analíticas</td>
                <td className="p-4">Utilizamos Google Analytics 4 para medir el tráfico y rendimiento de la página.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Marketing</td>
                <td className="p-4">Permiten mostrar anuncios relevantes en redes sociales y otros sitios web.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Cómo gestionar sus preferencias</h2>
          <p>
            Usted puede configurar su navegador para bloquear o alertar sobre estas cookies. Sin embargo, algunas partes de nuestro sitio (como el proceso de compra) dejarán de funcionar. 
          </p>
          <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors">
            Abrir panel de preferencias
          </button>
        </div>
      </div>
    </div>
  );
}