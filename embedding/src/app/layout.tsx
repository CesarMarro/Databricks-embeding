import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Martinexsa Labs – POCs",
  description: "Colección de prototipos y demos (Data + AI, Dashboards, Embeddings)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="sticky top-0 z-40 w-full border-b border-[color:var(--card-border)] bg-[color:var(--header-bg)]/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--brand-primary-600)] text-white">M</span>
              <span className="text-sm font-semibold tracking-wide text-[color:var(--brand-ink)]">Martinexsa Labs</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/#pocs" className="text-[color:var(--muted-ink)] hover:text-[color:var(--brand-ink)]">POCs</Link>
              <Link href="/contacto" className="text-[color:var(--muted-ink)] hover:text-[color:var(--brand-ink)]">Contacto</Link>
            </nav>
          </div>
        </header>
        <div className="min-h-[calc(100svh-56px)]">{children}</div>
        <footer className="border-t border-[color:var(--card-border)] bg-[color:var(--header-bg)] py-6">
          <div className="mx-auto max-w-7xl px-4 text-xs text-[color:var(--muted-ink)] sm:px-6">
            © {new Date().getFullYear()} Martinexsa. Demos internas.
          </div>
        </footer>
      </body>
    </html>
  );
}
