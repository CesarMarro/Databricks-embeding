import { NextResponse } from "next/server";

type AuthorizationDetail = {
  type?: string;
  actions?: string[];
  // Databricks may include additional fields we don't explicitly use
  [key: string]: unknown;
};

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
  if (!m2m.ok) {
    const err = await safeJson(m2m);
    return NextResponse.json(
      { error: "m2m_token_failed", detail: err },
      { status: 500 }
    );
  }
  const { access_token } = await m2m.json();
  if (!access_token) {
    return NextResponse.json(
      { error: "m2m_token_missing" },
      { status: 500 }
    );
  }

  // Paso 2: obtener tokeninfo
  const info = await fetch(
    `${base}/api/2.0/lakeview/dashboards/${dashboardId}/published/tokeninfo?external_viewer_id=testuser&external_value=testuser`,
    {
      headers: { Authorization: `Bearer ${access_token}` },
    }
  );
  if (!info.ok) {
    const err = await safeJson(info);
    return NextResponse.json(
      { error: "tokeninfo_failed", detail: err },
      { status: 500 }
    );
  }
  const tokenInfo = await info.json();
  const details: AuthorizationDetail[] = Array.isArray(tokenInfo?.authorization_details)
    ? (tokenInfo.authorization_details as AuthorizationDetail[])
    : [];
  if (details.length === 0) {
    return NextResponse.json(
      { error: "authorization_details_empty", tokenInfo },
      { status: 500 }
    );
  }

  // Heurística robusta: buscar el detalle que corresponda a published dashboard external embedding
  const byType = details.find((d: AuthorizationDetail) =>
    typeof d?.type === "string" && /dashboard|lakeview|published/i.test(d.type as string)
  );
  const byActions = details.find((d: AuthorizationDetail) =>
    Array.isArray(d?.actions) && d.actions.some((a: string) => /published|dashboard/i.test(a))
  );
  const authDetail = byType ?? byActions ?? details[details.length - 1];
  if (!authDetail) {
    return NextResponse.json(
      { error: "authorization_detail_not_found", details },
      { status: 500 }
    );
  }

  // Paso 3: mint scoped token
  const scoped = await fetch(`${base}/oidc/v1/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body:
      "grant_type=client_credentials&authorization_details=" +
      encodeURIComponent(JSON.stringify(authDetail)),
  });

  if (!scoped.ok) {
    const err = await safeJson(scoped);
    return NextResponse.json(
      { error: "scoped_token_failed", detail: err },
      { status: 500 }
    );
  }
  const scopedData = await scoped.json();
  if (!scopedData?.access_token) {
    return NextResponse.json(
      { error: "scoped_token_missing", data: scopedData },
      { status: 500 }
    );
  }
  return NextResponse.json(scopedData);
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    try {
      return await res.text();
    } catch {
      return { status: res.status, statusText: res.statusText };
    }
  }
}
