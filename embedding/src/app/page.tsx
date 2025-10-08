"use client";

import { useEffect } from "react";
import { DatabricksDashboard } from "@databricks/aibi-client";

export default function Home() {
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/getDashboardToken");
      const data = await res.json();

      const dashboard = new DatabricksDashboard({
        instanceUrl: process.env.NEXT_PUBLIC_DATABRICKS_URL!,
        workspaceId: process.env.NEXT_PUBLIC_WORKSPACE_ID!,
        dashboardId: process.env.NEXT_PUBLIC_DASHBOARD_ID!,
        token: data.access_token,
        container: document.getElementById("dashboard-container")!,
      });

      dashboard.initialize();
    }

    load();
  }, []);

  return (
    <div
      id="dashboard-container"
      style={{ width: "100%", height: "90vh", border: "none" }}
    />
  );
}
