// src/app/legal/TermsPage.jsx
export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-8 prose prose-slate dark:prose-invert">
      <h1 className="text-4xl font-black mb-2">Términos y Condiciones de Uso</h1>
      <p className="text-sm text-slate-500 mb-10">Vigente desde: 01 de enero de 2026 | KillaVibes S.A.S.</p>

      <section>
        <h2 className="text-2xl font-bold">1. Objeto y Generalidades</h2>
        <p>
          El presente documento regula el acceso y uso del portal e-commerce KillaVibes. Al utilizar nuestra plataforma, usted acepta de manera vinculante los presentes términos, los cuales se rigen bajo la legislación de la República de Colombia.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">2. Capacidad Legal</h2>
        <p>
          Los servicios de KillaVibes están disponibles únicamente para personas con capacidad legal para contratar. En Colombia, esto implica ser mayor de 18 años. Las cuentas registradas por menores de edad serán responsabilidad directa de sus padres o tutores legales.
        </p>
      </section>

      <section className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border-l-4 border-blue-600">
        <h2 className="text-xl font-bold mt-0">3. Derecho de Retracto (Ley 1480 de 2011)</h2>
        <p>
          KillaVibes garantiza el ejercicio del derecho de retracto. El consumidor podrá devolver el producto dentro de los cinco (5) días hábiles siguientes a la entrega, siempre que el producto no haya sido usado, se encuentre en su empaque original y con todos sus accesorios. El dinero será reintegrado en un plazo máximo de 30 días calendario.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">4. Reversión del Pago</h2>
        <p>
          En cumplimiento del Decreto 587 de 2016, los usuarios podrán solicitar la reversión del pago cuando: sean objeto de fraude, el producto solicitado no sea recibido, o el producto entregado no corresponda a lo solicitado o sea defectuoso.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">5. Propiedad Intelectual</h2>
        <p>
          Todo el contenido gráfico, código fuente, nombres comerciales y logotipos son propiedad de KillaVibes S.A.S. Queda prohibida la reproducción total o parcial sin autorización expresa.
        </p>
      </section>
    </div>
  );
}