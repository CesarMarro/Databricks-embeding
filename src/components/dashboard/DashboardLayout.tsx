"use client";

import { useEffect, useState } from "react";
import type { Page } from "@/lib/dashboard/types";
import { WidgetRenderer } from "./WidgetRenderer";
import { runDatasetQuery } from "@/lib/dashboard/query-runner";

interface DashboardLayoutProps {
  page: Page;
  parameters: Record<string, unknown>;
  onParameterChange?: (paramName: string, value: unknown) => void;
}

export function DashboardLayout({ page, parameters, onParameterChange }: DashboardLayoutProps) {
  const [widgetData, setWidgetData] = useState<Map<string, Record<string, unknown>[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    async function fetchAllWidgets() {
      setLoading(true);
      const newData = new Map<string, Record<string, unknown>[]>();
      const newErrors = new Map<string, string>();

      // Fetch data for all widgets in parallel
      await Promise.all(
        page.layout.map(async (layoutItem) => {
          const widget = layoutItem.widget;
          
          // Skip text widgets (no data needed)
          if (widget.multilineTextboxSpec) {
            return;
          }
          
          // Skip filter widgets (they don't need data fetching)
          const widgetType = widget.spec?.widgetType;
          if (widgetType === "filter-single-select" || widgetType === "range-slider") {
            return;
          }

          // Get first query's dataset
          const query = widget.queries?.[0];
          if (!query?.query?.datasetName) {
            newErrors.set(widget.name, "No dataset configurado");
            return;
          }

          const datasetName = query.query.datasetName;
          
          // Run query
          const { data, error } = await runDatasetQuery(datasetName, parameters);
          
          if (error) {
            newErrors.set(widget.name, error);
          } else {
            newData.set(widget.name, data);
          }
        })
      );

      setWidgetData(newData);
      setErrors(newErrors);
      setLoading(false);
    }

    fetchAllWidgets();
  }, [page, parameters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando widgets...</div>
      </div>
    );
  }

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: "repeat(6, 1fr)",
        gridAutoRows: "80px",
      }}
    >
      {page.layout.map((layoutItem) => {
        const { widget, position } = layoutItem;
        const data = widgetData.get(widget.name) || [];
        const error = errors.get(widget.name);

        return (
          <div
            key={widget.name}
            className="flex"
            style={{
              gridColumn: `${position.x + 1} / span ${position.width}`,
              gridRow: `${position.y + 1} / span ${position.height}`,
            }}
          >
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600 w-full">
                Error: {error}
              </div>
            ) : (
              <div className="w-full">
                <WidgetRenderer 
                  widget={widget} 
                  data={data} 
                  parameters={parameters}
                  onParameterChange={onParameterChange}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
