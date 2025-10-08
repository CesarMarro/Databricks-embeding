export default function ContactoPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-[var(--brand-ink)]">Contacto</h1>
      <p className="mt-2 text-[var(--muted-ink)]">
        ¿Quieres coordinar una demo o explorar un POC? Escríbenos y con gusto
        te atendemos.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <a
          href="mailto:mercadeo@martinexsa.com"
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-5 text-[var(--brand-ink)] hover:bg-[var(--brand-primary-50)]"
        >
          mercadeo@martinexsa.com
        </a>
        <a
          href="https://martinexsa.com/contacto/"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-5 text-[var(--brand-ink)] hover:bg-[var(--brand-primary-50)]"
        >
          Formulario de contacto
        </a>
      </div>
    </main>
  );
}
