/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function JsonDashboardPOC() {
  const [raw, setRaw] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [threshold, setThreshold] = useState<string>("50");
  const [kpi, setKpi] = useState<any>(null);
  const [pie, setPie] = useState<any[]>([]);
  const [barCountry, setBarCountry] = useState<any[]>([]);
  const [ageBars, setAgeBars] = useState<any[]>([]);
  const [mapData, setMapData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("panel");
  const [clientes, setClientes] = useState<any[]>([]);
  const [rendimiento, setRendimiento] = useState<any>(null);
  const [confusion, setConfusion] = useState<any[]>([]);
  const [calculadora, setCalculadora] = useState<any[]>([]);
  const [changePct, setChangePct] = useState<any[]>([]);
  const [changeKpi, setChangeKpi] = useState<any>(null);
  const [probMin, setProbMin] = useState<string>("0");
  const [probMax, setProbMax] = useState<string>("1");
  const [costoRetencion, setCostoRetencion] = useState<string>("100");
  const [tasaExito, setTasaExito] = useState<string>("70");
  const [valorCliente, setValorCliente] = useState<string>("500");
  const [costoAdquisicion, setCostoAdquisicion] = useState<string>("200");
  const [loading, setLoading] = useState(false);
  const [rpcError, setRpcError] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);

  function log(msg: string) {
    const line = `${new Date().toISOString()} | ${msg}`;
    // console for browser devtools
    // eslint-disable-next-line no-console
    console.debug(line);
    setLogs((prev) => [line, ...prev].slice(0, 200));
  }

  const parsed = useMemo(() => {
    if (!raw.trim()) {
      setError("");
      return null;
    }
    try {
      const obj = JSON.parse(raw);
      setError("");
      return obj;
    } catch (e: any) {
      setError("JSON inválido. Verifica comas y comillas.");
      return null;
    }
  }, [raw]);

  useEffect(() => {
    testFetchKPI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCalculadora() {
    try {
      const supabase = getSupabaseBrowser();
      const th = Number(threshold);
      const { data, error } = await supabase.rpc("get_calculadora", {
        threshold_global: th,
        costo_retencion: Number(costoRetencion),
        tasa_exito_retencion: Number(tasaExito),
        valor_cliente_promedio: Number(valorCliente),
        costo_adquisicion: Number(costoAdquisicion),
      });
      if (error) throw error;
      setCalculadora(Array.isArray(data) ? data : []);
      log(`calculadora.len=${Array.isArray(data) ? data.length : 0}`);
    } catch (e: any) {
      log(`Calculadora error: ${e?.message || e}`);
    }
  }

  async function testFetchKPI() {
    setLoading(true);
    setRpcError("");
    setKpi(null);
    setPie([]);
    setBarCountry([]);
    setAgeBars([]);
    try {
      const supabase = getSupabaseBrowser();
      const th = Number(threshold);
      if (Number.isNaN(th)) throw new Error("Umbral inválido");
      const t0 = performance.now();
      log(`RPC start threshold_global=${th}`);
      const [
        { data: kpiData, error: kpiErr },
        { data: pieData, error: pieErr },
        { data: geoData, error: geoErr },
        { data: ageData, error: ageErr },
        { data: mapDataRaw, error: mapErr },
        { data: clientesData, error: clientesErr },
        { data: rendimientoData, error: rendimientoErr },
        { data: confusionData, error: confusionErr },
        { data: changePctData, error: changePctErr },
        { data: changeKpiData, error: changeKpiErr },
      ] = await Promise.all([
        supabase.rpc("get_panel_kpi", { threshold_global: th }),
        supabase.rpc("get_panel_pie", { threshold_global: th }),
        supabase.rpc("get_panel_geography", { threshold_global: th }),
        supabase.rpc("get_panel_age"),
        supabase.rpc("get_panel_map", { threshold_global: th }),
        supabase.rpc("get_tus_clientes", { prob_min: Number(probMin), prob_max: Number(probMax) }),
        supabase.rpc("get_rendimiento", { threshold_global: th }),
        supabase.rpc("get_confusion", { threshold_global: th }),
        supabase.rpc("get_change_pct"),
        supabase.rpc("get_change_kpi", { threshold_global: th }),
      ]);
      const t1 = performance.now();
      log(`RPC done in ${(t1 - t0).toFixed(0)}ms`);
      if (kpiErr) throw kpiErr;
      if (pieErr) throw pieErr;
      if (geoErr) throw geoErr;
      if (ageErr) throw ageErr;
      if (mapErr) throw mapErr;
      if (clientesErr) throw clientesErr;
      if (rendimientoErr) throw rendimientoErr;
      if (confusionErr) throw confusionErr;
      if (changePctErr) throw changePctErr;
      if (changeKpiErr) throw changeKpiErr;
      const kpiRow = Array.isArray(kpiData) ? kpiData[0] : kpiData;
      setKpi(kpiRow);
      setPie(Array.isArray(pieData) ? pieData : []);
      log(`kpi keys=${Object.keys(kpiRow ?? {}).join(",")} pie.len=${Array.isArray(pieData) ? pieData.length : 0}`);
      // Bar país: usar pais, churn_rate_pct
      const bc = Array.isArray(geoData)
        ? geoData
            .filter((r: any) => r.pais && typeof r.churn_rate_pct === "number")
            .reduce((acc: Record<string, number>, r: any) => {
              acc[r.pais] = r.churn_rate_pct; // ya es promedio
              return acc;
            }, {})
        : {};
      const bcArr = Object.entries(bc)
        .map(([pais, val]) => ({ pais, churn_rate_pct: Number(val) }))
        .sort((a, b) => b.churn_rate_pct - a.churn_rate_pct);
      setBarCountry(bcArr);
      log(`geo.len=${Array.isArray(geoData) ? geoData.length : 0} barCountry.len=${bcArr.length}`);
      // Barras edad: usar edad, prob_churn_pct
      const ab = Array.isArray(ageData)
        ? ageData
            .filter((r: any) => typeof r.edad === "number" && typeof r.prob_churn_pct === "number")
            .sort((a, b) => a.edad - b.edad)
        : [];
      setAgeBars(ab);
      log(`age.len=${Array.isArray(ageData) ? ageData.length : 0} ageBars.len=${ab.length}`);
      if (ab.length > 0) {
        log(`age sample: ${ab.slice(0, 3).map((a: any) => `${a.edad}:${a.prob_churn_pct}`).join(", ")}`);
      }
      setMapData(Array.isArray(mapDataRaw) ? mapDataRaw : []);
      log(`map.len=${Array.isArray(mapDataRaw) ? mapDataRaw.length : 0}`);
      setClientes(Array.isArray(clientesData) ? clientesData.slice(0, 100) : []);
      setRendimiento(Array.isArray(rendimientoData) ? rendimientoData[0] : rendimientoData);
      setConfusion(Array.isArray(confusionData) ? confusionData : []);
      setChangePct(Array.isArray(changePctData) ? changePctData : []);
      setChangeKpi(Array.isArray(changeKpiData) ? changeKpiData[0] : changeKpiData);
      log(`clientes.len=${Array.isArray(clientesData) ? clientesData.length : 0} rendimiento=${!!rendimientoData} confusion.len=${Array.isArray(confusionData) ? confusionData.length : 0}`);
      log(`States: kpi=${!!kpiRow} pie=${pie.length} barCountry=${bcArr.length} ageBars=${ab.length} map=${Array.isArray(mapDataRaw) ? mapDataRaw.length : 0}`);
    } catch (e: any) {
      setRpcError(e?.message ?? "Error al consultar Supabase");
      log(`RPC error: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard desde JSON</h1>
            <p className="text-sm text-gray-500">POC para recrear un Lakeview Dashboard en código</p>
          </div>
          <Link
            href="/"
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
          >
            Volver
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-md border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-900">Pega el JSON del dashboard</h2>
              <button
                onClick={() => setRaw("")}
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                Limpiar
              </button>
            </div>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="Pega aquí el JSON del dashboard"
              className="h-72 w-full resize-y rounded-md border border-gray-200 p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {error ? (
              <p className="mt-2 text-xs text-red-600">{error}</p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">El JSON no se envía a ningún servidor.</p>
            )}
          </section>

          <section className="rounded-md border border-gray-200 p-4">
            <h2 className="mb-3 text-sm font-medium text-gray-900">Estatus y plan</h2>
            <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
              <li>
                <span className="font-semibold">Parseo:</span> Detectamos datasets, parámetros y páginas del JSON.
              </li>
              <li>
                <span className="font-semibold">Fuentes de datos:</span> Propondré subir tablas a Supabase (Postgres) o usar una base existente. Campos clave: prob_churn, exited, age, geography, period, etc.
              </li>
              <li>
                <span className="font-semibold">Recreación UI:</span> Render de KPI, pie/bar charts, mapa coroplético y tabla, respetando filtros globales.
              </li>
              <li>
                <span className="font-semibold">Rutas:</span> Esta página vive en /pocs/json-dashboard y queda enlazada desde el home.
              </li>
            </ol>
            <div className="mt-4 rounded-md bg-gray-50 p-3 text-xs text-gray-700">
              <p className="mb-1"><span className="font-semibold">Detectado:</span> {parsed ? "JSON válido" : "A la espera de JSON"}</p>
              {parsed ? (
                <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words">
{JSON.stringify({
  datasets: parsed.datasets?.length ?? 0,
  pages: parsed.pages?.length ?? 0,
  hasParameters: !!parsed.datasets?.some((d: any) => Array.isArray(d.parameters) && d.parameters.length > 0),
}, null, 2)}
                </pre>
              ) : null}
            </div>
          </section>
        </div>

        {/* Tabs: usar pages del JSON si existe */}
        <section className="mt-2 rounded-md border border-gray-200 p-4">
          <h2 className="text-sm font-medium text-gray-900">Preview (próximo paso)</h2>
          <p className="mt-2 text-sm text-gray-600">
            Aquí montaremos widgets equivalentes (KPI, pie, bar, tabla, mapa). Para datos usaremos una API basada en Postgres/Supabase o archivos CSV temporales mientras cargas tus tablas.
          </p>
          <div className="mt-4 flex items-end gap-3">
            <div>
              <label className="block text-xs text-gray-700 mb-1">Umbral (%)</label>
              <input
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-28 rounded-md border border-gray-200 px-2 py-1 text-sm"
                placeholder="50"
              />
            </div>
            <button
              onClick={testFetchKPI}
              disabled={loading}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              {loading ? "Consultando..." : "Probar KPI (Supabase)"}
            </button>
          </div>
          <div className="mt-3 text-xs">
            {rpcError && <p className="text-red-600">{rpcError}</p>}
            <details className="mt-2" open>
              <summary className="cursor-pointer text-gray-700 font-semibold">Debug (auto-abierto)</summary>
              <div className="mt-2 space-y-1 text-xs">
                <div>KPI: {kpi ? "✓" : "✗"} | Pie: {pie.length} | País: {barCountry.length} | Edad: {ageBars.length}</div>
                {ageBars.length > 0 && (
                  <div>Edad sample: {ageBars.slice(0, 5).map((a: any) => `${a.edad}:${(a.prob_churn_pct * 100).toFixed(1)}%`).join(", ")}</div>
                )}
              </div>
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-50 p-2 text-[11px] text-gray-800">
                {logs.join("\n")}
              </pre>
            </details>
            {/* Tabs funcionales */}
            <div className="mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="panel">Panel de control</TabsTrigger>
                  <TabsTrigger value="clientes">Tus clientes</TabsTrigger>
                  <TabsTrigger value="rendimiento">Rendimiento</TabsTrigger>
                  <TabsTrigger value="calculadora">Calculadora</TabsTrigger>
                  <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
                </TabsList>
                <Separator className="my-3" />

                {/* Tab: Panel de control */}
                <TabsContent value="panel">
                  {/* Panel de control layout (6 cols) */}
                  <div className="grid grid-cols-6 gap-4">
                    {/* Texto descriptivo (x:0,y:0,width:6,height:2) */}
                    <div className="col-span-6">
                      <Card>
                        <CardContent className="pt-6 text-sm text-gray-700 space-y-2">
                          <div className="font-semibold">Panel de control de churn</div>
                          <div>
                            para estimar y analizar el riesgo de pérdida de clientes, segmentado por variables demográficas y de comportamiento.
                          </div>
                          <div className="text-xs text-gray-500">Probabilidades basadas en el modelo entrenado de machine learning (XGBoost).</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Counters fila (y:2) -> colocamos en 3 bloques de 2 cols cada uno */}
                    <div className="col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Total Clientes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold italic">{kpi?.total_clientes ?? "-"}</div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base"># de clientes con probabilidad mayor al umbral</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold text-rose-600 italic">{kpi?.clientes_en_riesgo ?? "-"}</div>
                          {kpi?.total_clientes ? (
                            <div className="text-xs text-gray-500 mt-1">
                              Target: {kpi.total_clientes}
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    </div>
                    <div className="col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Probabilidad promedio</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold">
                            {typeof kpi?.prob_promedio_pct === "number" ? (kpi.prob_promedio_pct * 100).toFixed(2) + "%" : "-"}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Pie (x:0,y:6,width:3,height:6) */}
                    <div className="col-span-6 md:col-span-3">
                      <Card className="h-full">
                        <CardHeader>
                          <CardTitle className="text-base">Predicciones de mis clientes</CardTitle>
                          <CardDescription>Los clientes "en riesgo" superan el umbral {threshold}%</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {pie?.length ? (
                            (() => {
                              const enRiesgo = pie.find((r: any) => r.estado === "En riesgo")?.cantidad ?? 0;
                              const retenidos = pie.find((r: any) => r.estado === "Retenidos")?.cantidad ?? 0;
                              const total = enRiesgo + retenidos;
                              const pRiesgo = total ? (enRiesgo / total) * 100 : 0;
                              const pRetenidos = 100 - pRiesgo;
                              const degRiesgo = pRiesgo * 3.6;
                              return (
                                <div className="flex items-center gap-8">
                                  {/* Donut */}
                                  <div
                                    aria-label="pie-donut"
                                    className="relative h-40 w-40"
                                    style={{
                                      backgroundImage: `conic-gradient(#f59e0b 0deg ${degRiesgo}deg, #0ea5e9 ${degRiesgo}deg 360deg)`,
                                      borderRadius: "9999px",
                                      mask: "radial-gradient(circle at center, transparent 58%, black 59%)",
                                      WebkitMask: "radial-gradient(circle at center, transparent 58%, black 59%)",
                                    }}
                                  >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="text-sm text-gray-700">
                                        <div className="text-xl font-semibold">{pRiesgo.toFixed(2)}%</div>
                                        <div className="text-[11px] text-gray-500">En riesgo</div>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Leyenda */}
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: "#0ea5e9" }} />
                                      <span className="text-gray-700">Retenidos:</span>
                                      <span className="font-semibold">{retenidos.toLocaleString()}</span>
                                      <span className="text-gray-500">({pRetenidos.toFixed(2)}%)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
                                      <span className="text-gray-700">En riesgo:</span>
                                      <span className="font-semibold">{enRiesgo.toLocaleString()}</span>
                                      <span className="text-gray-500">({pRiesgo.toFixed(2)}%)</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="text-gray-500">Sin datos.</div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Bar por país (x:3,y:6,width:3,height:6) - barras verticales */}
                    <div className="col-span-6 md:col-span-3">
                      <Card className="h-full">
                        <CardHeader>
                          <CardTitle className="text-base">% de churn esperado por país</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {barCountry.length ? (
                            <div className="flex items-end justify-center gap-4 h-48">
                              {(() => {
                                const max = Math.max(...barCountry.map((b) => b.churn_rate_pct));
                                return barCountry.map((r) => {
                                  const heightPct = (r.churn_rate_pct * 100).toFixed(0);
                                  return (
                                    <div key={r.pais} className="flex flex-col items-center gap-2">
                                      <div className="text-xs font-semibold">{heightPct}%</div>
                                      <div
                                        className="w-16 rounded-t"
                                        style={{
                                          height: `${heightPct}%`,
                                          backgroundColor: r.churn_rate_pct === max ? "#f59e0b" : "#0ea5e9",
                                        }}
                                      />
                                      <div className="text-xs text-gray-700">{r.pais}</div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          ) : (
                            <div className="text-gray-500">Sin datos.</div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Bar edad (x:0,y:18,width:4,height:6) */}
                    <div className="col-span-6 md:col-span-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Probabilidad de churn basado en edad</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {ageBars.length ? (
                            <div className="flex items-end justify-center gap-[2px] h-48">
                              {ageBars.map((r) => {
                                const heightPx = Math.max(4, (r.prob_churn_pct * 100 * 1.8));
                                return (
                                  <div key={r.edad} className="flex flex-col items-center gap-1" title={`Edad ${r.edad}: ${(r.prob_churn_pct * 100).toFixed(2)}%`}>
                                    <div className="w-4 bg-emerald-500 rounded-t" style={{ height: `${heightPx}px` }} />
                                    <div className="text-[9px] text-gray-600">{r.edad}</div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-gray-500">Sin datos.</div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* KPI edad promedio (x:4,y:18,width:2,height:6) */}
                    <div className="col-span-6 md:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Edad promedio de tus clientes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold">{typeof kpi?.edad_promedio === "number" ? kpi.edad_promedio.toFixed(1) : "-"}</div>
                        </CardContent>
                      </Card>
                    </div>

                </div>
                </TabsContent>

                {/* Tab: Tus clientes */}
                <TabsContent value="clientes">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tus clientes</CardTitle>
                      <CardDescription>Ordenados de mayor probabilidad de churn a menor. Mostrando primeros 100.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {clientes.length ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">ID</th>
                                <th className="text-left p-2">Apellido</th>
                                <th className="text-left p-2">País</th>
                                <th className="text-left p-2">Género</th>
                                <th className="text-right p-2">Edad</th>
                                <th className="text-right p-2">Balance</th>
                                <th className="text-right p-2"># Productos</th>
                                <th className="text-right p-2">Prob. Churn</th>
                              </tr>
                            </thead>
                            <tbody>
                              {clientes.map((c: any, idx: number) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                  <td className="p-2">{c.customer_id}</td>
                                  <td className="p-2">{c.surname}</td>
                                  <td className="p-2">{c.geography}</td>
                                  <td className="p-2">{c.gender}</td>
                                  <td className="text-right p-2">{c.age}</td>
                                  <td className="text-right p-2">${c.balance?.toLocaleString()}</td>
                                  <td className="text-right p-2">{c.num_products}</td>
                                  <td className="text-right p-2">
                                    <span className={`font-semibold ${c.prob_pct > 0.5 ? "text-red-600" : "text-green-600"}`}>
                                      {(c.prob_pct * 100).toFixed(2)}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-gray-500">Sin datos de clientes.</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Rendimiento */}
                <TabsContent value="rendimiento">
                  <div className="space-y-4">
                    {/* Métricas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Accuracy</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold">{rendimiento?.accuracy ? (rendimiento.accuracy * 100).toFixed(1) + "%" : "-"}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Precision</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold">{rendimiento?.precision_score ? (rendimiento.precision_score * 100).toFixed(1) + "%" : "-"}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Recall</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold">{rendimiento?.recall ? (rendimiento.recall * 100).toFixed(1) + "%" : "-"}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">F1 Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold">{rendimiento?.f1_score ? (rendimiento.f1_score * 100).toFixed(1) + "%" : "-"}</div>
                        </CardContent>
                      </Card>
                    </div>
                    {/* Matriz de confusión */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Matriz de confusión (2024)</CardTitle>
                        <CardDescription>Comparación entre valores reales y predichos</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {confusion.length ? (
                          <div className="grid grid-cols-2 gap-4 max-w-md">
                            {confusion.map((c: any, idx: number) => (
                              <div key={idx} className="border rounded p-3 text-center">
                                <div className="text-xs text-gray-600">{c.valor_real}</div>
                                <div className="text-xs text-gray-600">{c.valor_predicho}</div>
                                <div className="text-2xl font-semibold mt-2">{c.cantidad}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500">Sin datos de confusión.</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Tab: Calculadora */}
                <TabsContent value="calculadora">
                  <div className="space-y-4">
                    {/* Inputs */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Parámetros de la calculadora</CardTitle>
                        <CardDescription>Ajusta los valores para calcular el ROI</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs text-gray-700 mb-1">Costo retención ($)</label>
                            <input
                              type="number"
                              value={costoRetencion}
                              onChange={(e) => setCostoRetencion(e.target.value)}
                              className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-700 mb-1">Tasa éxito (%)</label>
                            <input
                              type="number"
                              value={tasaExito}
                              onChange={(e) => setTasaExito(e.target.value)}
                              className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-700 mb-1">Valor cliente ($)</label>
                            <input
                              type="number"
                              value={valorCliente}
                              onChange={(e) => setValorCliente(e.target.value)}
                              className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-700 mb-1">Costo adquisición ($)</label>
                            <input
                              type="number"
                              value={costoAdquisicion}
                              onChange={(e) => setCostoAdquisicion(e.target.value)}
                              className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                            />
                          </div>
                        </div>
                        <button
                          onClick={fetchCalculadora}
                          className="mt-4 rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                        >
                          Calcular ROI
                        </button>
                      </CardContent>
                    </Card>
                    {/* Resultados */}
                    {calculadora.length > 0 && (() => {
                      const row = calculadora[0];
                      return (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Clientes en riesgo</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-semibold">{row.clientes_en_riesgo}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Costo total retención</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-semibold">${row.costo_total_retencion?.toLocaleString()}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Clientes retenidos esperados</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-semibold">{row.clientes_retenidos_esperados?.toFixed(0)}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Valor conservado</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-semibold">${row.valor_conservado?.toLocaleString()}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">ROI estimado</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-semibold text-green-600">{(row.roi_estimado * 100).toFixed(1)}%</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Pérdida sin acción</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-semibold text-red-600">${row.perdida_sin_accion?.toLocaleString()}</div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })()}
                  </div>
                </TabsContent>

                {/* Tab: Comparativo */}
                <TabsContent value="comparativo">
                  <div className="space-y-4">
                    {/* KPIs comparativos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">En riesgo 2025</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold">{changeKpi?.clientes_en_riesgo_2025 ?? "-"}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">En riesgo 2024</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold">{changeKpi?.clientes_en_riesgo_2024 ?? "-"}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Total 2025</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold">{changeKpi?.total_clientes_2025 ?? "-"}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Total 2024</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold">{changeKpi?.total_clientes_2024 ?? "-"}</div>
                        </CardContent>
                      </Card>
                    </div>
                    {/* Gráfica de cambio */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Evolución del churn promedio</CardTitle>
                        <CardDescription>Comparación entre periodos</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {changePct.length ? (
                          <div className="flex items-end justify-center gap-8 h-48">
                            {changePct.map((r: any) => {
                              const heightPct = (r.churn_promedio_pct * 100).toFixed(0);
                              return (
                                <div key={r.period} className="flex flex-col items-center gap-2">
                                  <div className="text-xs font-semibold">{heightPct}%</div>
                                  <div
                                    className="w-24 rounded-t"
                                    style={{
                                      height: `${heightPct}%`,
                                      backgroundColor: r.period === "2025" ? "#f59e0b" : "#0ea5e9",
                                    }}
                                  />
                                  <div className="text-sm text-gray-700">{r.period}</div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-gray-500">Sin datos de comparativo.</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
