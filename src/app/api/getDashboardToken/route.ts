import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_DATABRICKS_URL!;
  const clientId = process.env.DATABRICKS_CLIENT_ID!;
  const clientSecret = process.env.DATABRICKS_CLIENT_SECRET!;
  const dashboardId = process.env.NEXT_PUBLIC_DASHBOARD_ID!;

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
  const { access_token } = await m2m.json();

  // Paso 2: obtener tokeninfo
  const info = await fetch(
    `${base}/api/2.0/lakeview/dashboards/${dashboardId}/published/tokeninfo?external_viewer_id=testuser&external_value=testuser`,
    {
      headers: { Authorization: `Bearer ${access_token}` },
    }
  );
  const tokenInfo = await info.json();

  // Paso 3: mint scoped token
  const scoped = await fetch(`${base}/oidc/v1/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body:
      "grant_type=client_credentials&authorization_details=" +
      encodeURIComponent(JSON.stringify(tokenInfo.authorization_details[2])),
  });

  const scopedData = await scoped.json();
  return NextResponse.json(scopedData);
}
