import Link from "next/link";
import { SplineSceneBasic } from "@/components/ui/demo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden h-[calc(100svh-56px)] w-full">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_0%_0%,rgba(79,70,229,0.15),transparent_60%),radial-gradient(800px_circle_at_100%_0%,rgba(249,115,22,0.15),transparent_60%)]" />
        <div className="relative h-full w-full">
          <SplineSceneBasic />
          <div className="absolute bottom-6 left-6 z-20 flex gap-3">
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
      </section>

      {/* POCs grid */}
      <section id="pocs" className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-[var(--brand-ink)]">Pruebas de concepto</h2>
        <p className="mt-2 text-sm text-[var(--muted-ink)]">Colección de demos para clientes. Agregaremos más pronto.</p>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Databricks Lakeview Dashboard POC */}
          <Card className="group relative overflow-hidden border-transparent bg-[var(--card-bg)] shadow-sm transition hover:shadow-lg">
            <div className="absolute inset-0">
              <div
                className="h-32 w-full bg-cover bg-center opacity-90"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518186233392-c232efbf2373?q=80&w=1600&auto=format&fit=crop')" }}
              />
            </div>
            <CardHeader className="relative pt-36">
              <CardTitle className="text-[var(--brand-ink)]">POC Banco — Churn</CardTitle>
              <CardDescription>
                Predicción de baja de clientes usando embeddings y señales transaccionales.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative flex items-center gap-3">
              <Link
                href="/pocs/dashboard"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--brand-primary-600)] px-3 py-2 text-white text-sm transition hover:bg-[var(--brand-primary-700)]"
              >
                Abrir dashboard
              </Link>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-md border border-[var(--card-border)] px-3 py-2 text-sm text-[var(--brand-ink)] hover:bg-[var(--brand-primary-50)]/40"
              >
                Ver detalles
              </a>
            </CardContent>
          </Card>

          {/* Placeholder POCs */}
          <Card className="group relative overflow-hidden border-dashed">
            <div className="absolute inset-0">
              <div
                className="h-32 w-full bg-cover bg-center opacity-70"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516245834210-c4c142787335?q=80&w=1600&auto=format&fit=crop')" }}
              />
            </div>
            <CardHeader className="relative pt-36">
              <CardTitle className="text-[var(--brand-ink)]">POC reservado</CardTitle>
              <CardDescription>Espacio para otro dashboard o demo (próximamente).</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Link
                href="/pocs/json-dashboard"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--brand-primary-600)] px-3 py-2 text-white text-sm transition hover:bg-[var(--brand-primary-700)]"
              >
                Abrir JSON Dashboard
              </Link>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-dashed">
            <div className="absolute inset-0">
              <div
                className="h-32 w-full bg-cover bg-center opacity-70"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?q=80&w=1600&auto=format&fit=crop')" }}
              />
            </div>
            <CardHeader className="relative pt-36">
              <CardTitle className="text-[var(--brand-ink)]">POC reservado</CardTitle>
              <CardDescription>Espacio para embeddings u otro experimento.</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <button className="rounded-md border border-[var(--card-border)] px-3 py-2 text-sm hover:bg-[var(--brand-primary-50)]/40">
                Notificarme
              </button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
