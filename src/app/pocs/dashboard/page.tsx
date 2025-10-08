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
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard para el sistema bancario</h1>
            <p className="text-sm text-gray-500">Visualización de lo que podria ser tu dashboard</p>
          </div>
          <Link
            href="/"
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
          >
            Volver
          </Link>
        </div>

        <div
          id="dashboard-container"
          style={{ width: "100%", height: "80vh", border: "none" }}
        />
      </main>
    </div>
  );
}

