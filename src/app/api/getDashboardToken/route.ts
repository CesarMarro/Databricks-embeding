import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_DATABRICKS_URL!;
  const clientId = process.env.DATABRICKS_CLIENT_ID!;
  const clientSecret = process.env.DATABRICKS_CLIENT_SECRET!;
  const dashboardId = process.env.NEXT_PUBLIC_DASHBOARD_ID!;
  const workspaceId = process.env.NEXT_PUBLIC_WORKSPACE_ID!;
  const legacyAclPath = process.env.NEXT_PUBLIC_DASHBOARD_LEGACY_ACL_PATH; // opcional

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  // Paso 1: obtener token M2M
  const m2m = await fetch(`${base}/oidc/v1/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=all-apis",
  });
  await m2m.json(); // no necesitamos el body; solo validar que el SP es válido

  // Paso 2: construir authorization_details explícitos (como en el curl que funcionó)
  const details = [
    {
      type: "workspace_rule_set",
      resource_name: `workspaces/${workspaceId}`,
      grant_rules: [
        { permission_set: "permissionSets/workspace.workspace-access" },
      ],
    },
    {
      type: "workspace_rule_set",
      resource_name: `workspaces/${workspaceId}`,
      grant_rules: [
        { permission_set: "permissionSets/workspace.dbsql-access" },
      ],
    },
    {
      type: "workspace_rule_set",
      resource_name: `workspaces/${workspaceId}/dashboards/${dashboardId}`,
      ...(legacyAclPath
        ? { resource_legacy_acl_path: legacyAclPath }
        : {}),
      grant_rules: [
        { permission_set: "permissionSets/dashboard.runner" },
      ],
    },
  ];

  const scoped = await fetch(`${base}/oidc/v1/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body:
      "grant_type=client_credentials&authorization_details=" +
      encodeURIComponent(JSON.stringify(details)),
  });

  const scopedData = await scoped.json();
  return NextResponse.json(scopedData);
}
