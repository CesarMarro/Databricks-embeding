import type { Widget } from "@/lib/dashboard/types";
import { CounterWidget } from "./CounterWidget";
import { PieWidget } from "./PieWidget";
import { BarWidget } from "./BarWidget";
import { TableWidget } from "./TableWidget";
import { TextWidget } from "./TextWidget";

interface WidgetRendererProps {
  widget: Widget;
  data: any[];
  parameters?: Record<string, any>;
}

export function WidgetRenderer({ widget, data, parameters }: WidgetRendererProps) {
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
    
    case "filter-single-select":
    case "range-slider":
      // TODO: implement filter widgets
      return (
        <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-500">
          Widget tipo "{widgetType}" - próximamente
        </div>
      );
    
    case "choropleth-map":
      return (
        <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-500">
          Mapa - próximamente
        </div>
      );
    
    default:
      return (
        <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-500">
          Widget tipo desconocido: {widgetType || "sin tipo"}
        </div>
      );
  }
}
