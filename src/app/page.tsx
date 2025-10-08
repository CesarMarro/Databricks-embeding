import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_0%_0%,rgba(79,70,229,0.15),transparent_60%),radial-gradient(800px_circle_at_100%_0%,rgba(249,115,22,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-[var(--brand-primary-50)] px-3 py-1 text-sm font-medium text-[var(--brand-primary-700)] ring-1 ring-[var(--brand-primary-200)]">Labs</span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-ink)] sm:text-5xl">
              Prototipos de Data + AI
            </h1>
            <p className="mt-4 text-base text-[var(--muted-ink)] sm:text-lg">
              Explora nuestros POCs listos para demo a clientes. Incluye visualización de dashboards de Databricks y más espacios para futuros experimentos.
            </p>
            <div className="mt-8 flex gap-3">
              <a
                href="#pocs"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--brand-primary-600)] px-4 py-2 text-white transition hover:bg-[var(--brand-primary-700)]"
              >
                Ver POCs
              </a>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--brand-accent-600)] px-4 py-2 text-white transition hover:bg-[var(--brand-accent-700)]"
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* POCs grid */}
      <section id="pocs" className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-[var(--brand-ink)]">Pruebas de concepto</h2>
        <p className="mt-2 text-sm text-[var(--muted-ink)]">Colección de demos para clientes. Agregaremos más pronto.</p>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Databricks Lakeview Dashboard POC */}
          <Link
            href="/pocs/dashboard"
            className="group relative overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100" style={{background:"radial-gradient(400px_circle_at_80%_-20%, var(--brand-primary-200), transparent 60%)"}} />
            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-primary-50)] text-[var(--brand-primary-700)] ring-1 ring-[var(--brand-primary-200)]">
                  {/* Bar chart icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 3a1 1 0 0 1 1 1v15h16a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm5 10a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5H8v-5Zm5-7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h-4V6ZM6 12a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v6H6v-6Z"/></svg>
                </span>
                <div>
                  <h3 className="text-base font-medium text-[var(--brand-ink)]">Lakeview Dashboard</h3>
                  <p className="text-sm text-[var(--muted-ink)]">Embed de dashboard publicado desde Databricks.</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-[var(--brand-primary-700)]">
                Probar demo
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 transition group-hover:translate-x-0.5"><path d="M13.293 4.293a1 1 0 0 1 1.414 0l6 6a.999.999 0 0 1 0 1.414l-6 6a1 1 0 1 1-1.414-1.414L17.586 12l-4.293-4.293a1 1 0 0 1 0-1.414Z"/><path d="M4 11a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2H4Z"/></svg>
              </div>
            </div>
          </Link>

          {/* Placeholder POCs */}
          <div className="relative overflow-hidden rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card-bg)] p-5 text-[var(--muted-ink)]">
            <div className="mb-2 text-sm font-medium text-[var(--brand-ink)]">POC reservado</div>
            <p className="text-sm">Espacio para otro dashboard o demo (próximamente).</p>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card-bg)] p-5 text-[var(--muted-ink)]">
            <div className="mb-2 text-sm font-medium text-[var(--brand-ink)]">POC reservado</div>
            <p className="text-sm">Espacio para embeddings u otro experimento.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
