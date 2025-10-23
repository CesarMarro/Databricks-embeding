"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ParameterStore } from "@/lib/dashboard/parameter-store";
import type { DashboardJSON } from "@/lib/dashboard/types";

export default function JsonAutoPage() {
  const [dragOver, setDragOver] = useState(false);
  const [jsonText, setJsonText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [paramStore, setParamStore] = useState<ParameterStore | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("json_auto_dashboard");
      if (saved) setJsonText(saved);
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      if (jsonText) localStorage.setItem("json_auto_dashboard", jsonText);
    } catch {}
  }, [jsonText]);

  const parsed = useMemo(() => {
    if (!jsonText.trim()) {
      setError("");
      return null;
    }
    try {
      const obj = JSON.parse(jsonText) as DashboardJSON;
      setError("");
      return obj;
    } catch (e: any) {
      setError("JSON inválido. Verifica comas y comillas.");
      return null;
    }
  }, [jsonText]);

  // Initialize parameter store when JSON is parsed
  useEffect(() => {
    if (parsed?.datasets) {
      const allParams = parsed.datasets.flatMap((d) => d.parameters || []);
      const store = ParameterStore.fromJSON(allParams);
      setParamStore(store);
      
      // Set first page as active
      if (parsed.pages?.length > 0) {
        setActiveTab(parsed.pages[0].name);
      }
    }
  }, [parsed]);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.name.endsWith(".json")) {
      setError("Sube un archivo .json");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const txt = String(reader.result || "");
      setJsonText(txt);
    };
    reader.onerror = () => setError("No se pudo leer el archivo");
    reader.readAsText(file);
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">JSON Auto</h1>
            <p className="text-sm text-gray-500">Sube un archivo .json de Lakeview y lo convertiremos en un dashboard dinámico.</p>
          </div>
          <Link href="/" className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50">
            Volver
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-md border border-gray-200 p-4">
            <h2 className="mb-3 text-sm font-medium text-gray-900">Sube tu archivo JSON</h2>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
              className={`flex h-48 cursor-pointer items-center justify-center rounded-md border-2 border-dashed ${
                dragOver ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-gray-50"
              }`}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Arrastra y suelta tu archivo.json aquí</div>
                <div className="text-xs text-gray-500 mt-1">o haz clic para seleccionar</div>
              </div>
            </div>
            <input
              id="file-input"
              type="file"
              accept="application/json,.json"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />

            <Separator className="my-4" />
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">JSON (opcional: editar manualmente)</span>
              <button
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                onClick={() => setJsonText("")}
              >
                Limpiar
              </button>
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
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
            <h2 className="mb-3 text-sm font-medium text-gray-900">Resumen</h2>
            <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-700">
              <p className="mb-1"><span className="font-semibold">Detectado:</span> {parsed ? "JSON válido" : "A la espera de JSON"}</p>
              {parsed && (
                <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words">{JSON.stringify({
                  datasets: parsed.datasets?.length ?? 0,
                  pages: parsed.pages?.length ?? 0,
                  hasParameters: !!parsed.datasets?.some((d: any) => Array.isArray(d.parameters) && d.parameters.length > 0),
                }, null, 2)}</pre>
              )}
            </div>

            <Separator className="my-4" />
            {parsed && !showDashboard && (
              <button
                onClick={() => setShowDashboard(true)}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
              >
                Construir dashboard
              </button>
            )}
            {showDashboard && (
              <button
                onClick={() => setShowDashboard(false)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Ocultar dashboard
              </button>
            )}
          </section>
        </div>

        {/* Dashboard rendering */}
        {showDashboard && parsed && paramStore && (
          <section className="mt-6">
            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Dashboard generado</h2>
              </div>
              
              {/* Global threshold control */}
              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-900 mb-2 block">
                        Umbral global de churn
                      </label>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[paramStore.get("threshold_global") || 50]}
                        onValueChange={(values) => {
                          paramStore.set("threshold_global", values[0]);
                          setRefreshKey(k => k + 1); // Force refresh
                        }}
                        className="w-full"
                      />
                    </div>
                    <div className="text-2xl font-bold text-indigo-600 min-w-[60px] text-right">
                      {paramStore.get("threshold_global") || 50}%
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Los clientes con probabilidad de churn mayor a este umbral se consideran "en riesgo"
                  </p>
                </CardContent>
              </Card>
            </div>

            {parsed.pages && parsed.pages.length > 0 ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white border border-gray-200">
                  {parsed.pages
                    .filter((p) => p.pageType !== "PAGE_TYPE_GLOBAL_FILTERS")
                    .map((page) => (
                      <TabsTrigger key={page.name} value={page.name} className="data-[state=active]:bg-gray-100">
                        {page.displayName || page.name}
                      </TabsTrigger>
                    ))}
                </TabsList>

                {parsed.pages
                  .filter((p) => p.pageType !== "PAGE_TYPE_GLOBAL_FILTERS")
                  .map((page) => (
                    <TabsContent key={page.name} value={page.name} className="mt-4">
                      <DashboardLayout key={refreshKey} page={page} parameters={paramStore.getAll()} />
                    </TabsContent>
                  ))}
              </Tabs>
            ) : (
              <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-500">
                No hay páginas para renderizar
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
