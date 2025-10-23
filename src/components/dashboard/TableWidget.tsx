import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { WidgetRenderProps } from "@/lib/dashboard/types";

export function TableWidget({ widget, data }: WidgetRenderProps) {
  const spec = widget.spec;
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 20;
  
  if (!data || data.length === 0) {
    return (
      <Card className="bg-white border-gray-200 h-full flex items-center justify-center p-4">
        <CardContent className="text-gray-500 text-sm">Sin datos</CardContent>
      </Card>
    );
  }

  // Get columns from spec or infer from data
  const columns = spec?.encodings?.columns?.map((col: any) => col.fieldName) || Object.keys(data[0]);
  
  // Pagination
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIdx = currentPage * rowsPerPage;
  const endIdx = Math.min(startIdx + rowsPerPage, data.length);
  const paginatedData = data.slice(startIdx, endIdx);

  return (
    <Card className="bg-white border-gray-200 h-full flex flex-col">
      {spec?.frame?.showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            {spec.frame.title}
          </CardTitle>
          {spec.frame.showDescription && spec.frame.description && (
            <CardDescription className="text-sm text-gray-700">{spec.frame.description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr className="border-b">
                {columns.map((col: string) => (
                  <th
                    key={col}
                    className="text-xs font-medium text-gray-900 p-3 text-left whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                  {columns.map((col: string) => {
                    // Try exact match first, then case-insensitive
                    let value = row[col];
                    if (value === undefined) {
                      const lowerCol = Object.keys(row).find(k => k.toLowerCase() === col.toLowerCase());
                      if (lowerCol) value = row[lowerCol];
                    }
                    let displayValue = value !== null && value !== undefined ? String(value) : "-";
                    
                    // Format numbers
                    if (typeof value === "number") {
                      if (col.toLowerCase().includes("prob") || col.toLowerCase().includes("pct")) {
                        displayValue = `${(value * 100).toFixed(2)}%`;
                      } else if (col.toLowerCase().includes("balance")) {
                        displayValue = `$${value.toLocaleString()}`;
                      } else {
                        displayValue = value.toLocaleString();
                      }
                    }
                    
                    return (
                      <td
                        key={col}
                        className="text-sm text-gray-900 p-3 whitespace-nowrap"
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length > 100 && (
          <div className="mt-2 text-xs text-gray-500">Mostrando primeros 100 de {data.length} registros</div>
        )}
      </CardContent>
    </Card>
  );
}
