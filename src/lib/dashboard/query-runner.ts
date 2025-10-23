// Query runner: ejecuta consultas a Supabase con caching

import { getSupabaseBrowser } from "@/lib/supabase";
import { resolveDataset } from "./dataset-resolver";

interface QueryCache {
  [key: string]: {
    data: any[];
    timestamp: number;
  };
}

const cache: QueryCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function runDatasetQuery(
  datasetName: string,
  parameters: Record<string, any>
): Promise<{ data: any[]; error: string | null }> {
  // Sort parameters for consistent cache keys
  const sortedParams = Object.keys(parameters).sort().reduce((acc, key) => {
    acc[key] = parameters[key];
    return acc;
  }, {} as Record<string, any>);
  
  const cacheKey = `${datasetName}_${JSON.stringify(sortedParams)}`;
  const cached = cache[cacheKey];
  
  // Disable cache for now to ensure fresh data
  // if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
  //   console.debug(`[QueryRunner] Cache hit for ${datasetName}`);
  //   return { data: cached.data, error: null };
  // }

  // Resolve dataset to RPC
  const mapping = resolveDataset(datasetName);
  if (!mapping) {
    console.warn(`[QueryRunner] Dataset ${datasetName} not mapped to RPC`);
    console.warn(`[QueryRunner] Available datasets:`, Object.keys(require('./dataset-resolver').DATASET_TO_RPC || {}));
    return { data: [], error: `Dataset ${datasetName} no soportado` };
  }

  try {
    const supabase = getSupabaseBrowser();
    
    // Build RPC params
    const rpcParams: Record<string, any> = {};
    mapping.params.forEach((paramName) => {
      if (paramName in parameters) {
        rpcParams[paramName] = parameters[paramName];
      }
    });

    console.log(`[QueryRunner] Calling RPC: ${mapping.rpcName}`);
    console.log(`[QueryRunner] With params:`, rpcParams);
    console.log(`[QueryRunner] For dataset:`, datasetName);
    
    // Add timeout to RPC call
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('RPC timeout after 10s')), 10000)
    );
    
    const rpcPromise = supabase.rpc(mapping.rpcName, rpcParams);
    
    const { data, error } = await Promise.race([rpcPromise, timeoutPromise]) as any;
    
    if (error) {
      console.error(`[QueryRunner] ❌ Error calling ${mapping.rpcName}:`, error);
      console.error(`[QueryRunner] Error details:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return { data: [], error: error.message };
    }

    const resultData = Array.isArray(data) ? data : data ? [data] : [];
    
    console.log(`[QueryRunner] ✅ Success ${mapping.rpcName}:`, {
      rowCount: resultData.length,
      firstRow: resultData[0],
    });
    
    // Update cache
    cache[cacheKey] = {
      data: resultData,
      timestamp: Date.now(),
    };

    return { data: resultData, error: null };
  } catch (e: any) {
    console.error(`[QueryRunner] ❌ Exception:`, e);
    return { data: [], error: e.message || "Error desconocido" };
  }
}

export function clearCache(): void {
  Object.keys(cache).forEach((key) => delete cache[key]);
}
