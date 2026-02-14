// src/app/legal/PrivacyPage.jsx
export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-8 prose prose-blue dark:prose-invert">
      <h1 className="text-4xl font-black mb-2">Política de Privacidad</h1>
      <p className="text-sm text-slate-500 mb-10">KillaVibes S.A.S. - Responsable del Tratamiento de Datos</p>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Identificación del Responsable</h2>
        <p>
          KillaVibes S.A.S., con domicilio en Bogotá D.C., Colombia, es responsable del tratamiento de sus datos personales recolectados a través de nuestro portal web, aplicaciones móviles y canales físicos de atención.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Finalidad del Tratamiento</h2>
        <ul className="list-disc pl-5">
          <li>Gestionar el registro del usuario y acceso a la plataforma.</li>
          <li>Procesar transacciones de compra, envío de productos y facturación electrónica.</li>
          <li>Enviar información publicitaria y promociones (previa autorización expresa).</li>
          <li>Realizar análisis estadísticos para mejorar la experiencia de navegación.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Derechos ARCO</h2>
        <p>
          Como titular de los datos, usted tiene derecho a: <strong>Conocer, Actualizar, Rectificar y Suprimir</strong> su información de nuestras bases de datos. Para ejercer estos derechos, puede escribirnos a <strong>legal@killavibes.com.co</strong>.
        </p>
      </section>

      <section className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-md">
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 m-0">
          Nota: En cumplimiento de la normativa colombiana, KillaVibes no recolecta datos sensibles ni información de menores de edad sin la autorización de sus representantes legales.
        </p>
      </section>
    </div>
  );
}