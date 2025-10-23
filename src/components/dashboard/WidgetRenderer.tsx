/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Widget } from "@/lib/dashboard/types";
import { CounterWidget } from "./CounterWidget";
import { PieWidget } from "./PieWidget";
import { BarWidget } from "./BarWidget";
import { TableWidget } from "./TableWidget";
import { TextWidget } from "./TextWidget";
import { RangeSliderWidget } from "./RangeSliderWidget";
import { PivotTableWidget } from "./PivotTableWidget";
import { FilterSingleSelectWidget } from "./FilterSingleSelectWidget";

interface WidgetRendererProps {
  widget: Widget;
  data: any[];
  parameters?: Record<string, any>;
  onParameterChange?: (paramName: string, value: any) => void;
}

export function WidgetRenderer({ widget, data, parameters, onParameterChange }: WidgetRendererProps) {
  // Handle text widgets (no data needed)
  if (widget.multilineTextboxSpec) {
    return <TextWidget widget={widget} />;
  }

  const widgetType = widget.spec?.widgetType;

  switch (widgetType) {
    case "counter":
      return <CounterWidget widget={widget} data={data} parameters={parameters} />;
    
    case "pie":
      return <PieWidget widget={widget} data={data} parameters={parameters} />;
    
    case "bar":
      return <BarWidget widget={widget} data={data} parameters={parameters} />;
    
    case "table":
      return <TableWidget widget={widget} data={data} parameters={parameters} />;
    
    case "pivot":
      return <PivotTableWidget widget={widget} data={data} parameters={parameters} />;
    
    case "range-slider":
      return <RangeSliderWidget widget={widget} parameters={parameters || {}} onParameterChange={onParameterChange} />;
    
    case "filter-single-select":
      return <FilterSingleSelectWidget widget={widget} parameters={parameters || {}} onParameterChange={onParameterChange} />;
    
    case "choropleth-map":
      return (
        <div className="h-full bg-white border-2 border-dashed border-blue-300 rounded-md p-4 flex flex-col items-center justify-center">
          <div className="text-blue-600 font-semibold mb-2">🗺️ Mapa no implementado</div>
          <div className="text-sm text-gray-700 mb-1">Tipo: <code className="bg-gray-100 px-1 rounded">choropleth-map</code></div>
          <div className="text-sm text-gray-700 mb-3">Nombre: <code className="bg-gray-100 px-1 rounded">{widget.name}</code></div>
          <div className="text-xs text-gray-500 text-center">
            Añade el componente en:<br/>
            <code className="bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
              src/components/dashboard/MapWidget.tsx
            </code>
          </div>
        </div>
      );
    
    default:
      return (
        <div className="h-full bg-white border-2 border-dashed border-red-300 rounded-md p-4 flex flex-col items-center justify-center">
          <div className="text-red-600 font-semibold mb-2">❌ Widget no identificado</div>
          <div className="text-sm text-gray-700 mb-1">
            Tipo: <code className="bg-gray-100 px-1 rounded">{widgetType || "sin tipo"}</code>
          </div>
          <div className="text-sm text-gray-700 mb-3">
            Nombre: <code className="bg-gray-100 px-1 rounded">{widget.name}</code>
          </div>
          <div className="text-xs text-gray-500 text-center mb-2">
            Añade el componente en:<br/>
            <code className="bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
              src/components/dashboard/WidgetRenderer.tsx
            </code>
          </div>
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-900">Ver spec completo</summary>
            <pre className="mt-2 p-2 bg-gray-50 rounded text-[10px] overflow-auto max-h-32">
              {JSON.stringify(widget.spec, null, 2)}
            </pre>
          </details>
        </div>
      );
  }
}
