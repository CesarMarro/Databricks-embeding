"use client";

import { useEffect } from "react";
import { DatabricksDashboard } from "@databricks/aibi-client";
import Link from "next/link";

export default function DashboardPOC() {
  useEffect(() => {
    let dashboard: DatabricksDashboard | undefined;

    async function init() {
      try {
        const res = await fetch("/api/getDashboardToken");
        if (!res.ok) throw new Error("No se pudo obtener el token del dashboard");
        const data = await res.json();

        const container = document.getElementById("dashboard-container");
        if (!container) return;

        dashboard = new DatabricksDashboard({
          instanceUrl: process.env.NEXT_PUBLIC_DATABRICKS_URL!,
          workspaceId: process.env.NEXT_PUBLIC_WORKSPACE_ID!,
          dashboardId: process.env.NEXT_PUBLIC_DASHBOARD_ID!,
          token: data.access_token,
          container,
        });

        dashboard.initialize();
      } catch (e) {
        console.error(e);
      }
    }

    init();

    return () => {
      // Si la librería expone método de cleanup, llamarlo aquí (p.ej. dashboard?.destroy())
    };
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--brand-ink)]">Lakeview Dashboard</h1>
          <p className="text-sm text-[var(--muted-ink)]">Visualización embebida desde Databricks.</p>
        </div>
        <Link
          href="/"
          className="rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-1.5 text-sm text-[var(--brand-ink)] hover:bg-[var(--brand-primary-50)]"
        >
          Volver
        </Link>
      </div>

      <div
        id="dashboard-container"
        style={{ width: "100%", height: "80vh", border: "none" }}
      />
    </main>
  );
}
