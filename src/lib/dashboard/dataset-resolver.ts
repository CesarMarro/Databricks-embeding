// Dataset resolver: mapea datasetName del JSON a RPCs de Supabase

export interface DatasetMapping {
  rpcName: string;
  params: string[];
}

// Mapa de equivalencias Dataset -> RPC
const DATASET_TO_RPC: Record<string, DatasetMapping> = {
  // Panel de control
  "3fe836cc": { rpcName: "get_panel_kpi", params: ["threshold_global"] },
  "82d91fb3": { rpcName: "get_panel_pie", params: ["threshold_global"] },
  "f4077d86": { rpcName: "get_panel_geography", params: ["threshold_global"] },
  "84ab7433": { rpcName: "get_panel_age", params: [] },
  "1b998146": { rpcName: "get_panel_map", params: ["threshold_global"] },
  
  // Tus clientes
  "85eee3cd": { rpcName: "get_tus_clientes", params: ["prob_min", "prob_max"] },
  
  // Rendimiento
  "27cdf85d": { rpcName: "get_rendimiento", params: ["threshold_global"] },
  "e026c21f": { rpcName: "get_confusion", params: ["threshold_global"] },
  
  // Comparativo
  "92ad8ba4": { rpcName: "get_change_pct", params: [] },
  "fbaf2785": { rpcName: "get_change_kpi", params: ["threshold_global"] },
  
  // Calculadora
  "b913f749": { 
    rpcName: "get_calculadora", 
    params: ["threshold_global", "costo_retencion", "tasa_exito_retencion", "valor_cliente_promedio", "costo_adquisicion"] 
  },
};

export function resolveDataset(datasetName: string): DatasetMapping | null {
  return DATASET_TO_RPC[datasetName] || null;
}

export function isDatasetSupported(datasetName: string): boolean {
  return datasetName in DATASET_TO_RPC;
}

export function getAllSupportedDatasets(): string[] {
  return Object.keys(DATASET_TO_RPC);
}
