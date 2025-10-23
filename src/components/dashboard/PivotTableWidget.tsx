import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { WidgetRenderProps } from "@/lib/dashboard/types";

export function PivotTableWidget({ widget, data }: WidgetRenderProps) {
  const spec = widget.spec;
  
  if (!data || data.length === 0) {
    return (
      <Card className="bg-white border-gray-200 h-full flex items-center justify-center p-4">
        <CardContent className="text-gray-500 text-sm">Sin datos</CardContent>
      </Card>
    );
  }

  // Get row, column, and cell field names
  const rowField = spec?.encodings?.rows?.[0]?.fieldName;
  const colField = spec?.encodings?.columns?.[0]?.fieldName;
  const cellField = spec?.encodings?.cell?.fields?.[0]?.fieldName;
  
  if (!rowField || !colField || !cellField) {
    return (
      <Card className="bg-white border-gray-200 h-full flex items-center justify-center p-4">
        <CardContent className="text-gray-500 text-sm">
          Configuración de pivot incompleta
        </CardContent>
      </Card>
    );
  }

  // Build pivot structure
  const rowValues = [...new Set(data.map(row => row[rowField]))].sort();
  const colValues = [...new Set(data.map(row => row[colField]))].sort();
  
  // Create pivot map
  const pivotMap = new Map<string, Map<string, any>>();
  data.forEach(row => {
    const rowVal = row[rowField];
    const colVal = row[colField];
    const cellVal = row[cellField];
    
    if (!pivotMap.has(rowVal)) {
      pivotMap.set(rowVal, new Map());
    }
    pivotMap.get(rowVal)!.set(colVal, cellVal);
  });

  return (
    <Card className="bg-white border-gray-200 h-full flex flex-col">
      {spec?.frame?.showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            {spec.frame.title}
          </CardTitle>
          {spec.frame.showDescription && spec.frame.description && (
            <CardDescription className="text-sm text-gray-700">
              {spec.frame.description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className="flex-1 overflow-auto p-0">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-800 text-white sticky top-0">
            <tr>
              {/* Top-left corner cell */}
              <th className="border border-gray-600 p-3 text-left font-medium text-xs">
                {rowField}
              </th>
              {/* Column headers */}
              <th 
                colSpan={colValues.length} 
                className="border border-gray-600 p-3 text-center font-medium text-xs"
              >
                {colField}
              </th>
            </tr>
            <tr>
              <th className="border border-gray-600 p-3 text-left font-medium text-xs bg-gray-700">
                {/* Empty for row header */}
              </th>
              {colValues.map((colVal) => (
                <th 
                  key={String(colVal)} 
                  className="border border-gray-600 p-3 text-center font-medium text-xs bg-gray-700"
                >
                  {String(colVal)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowValues.map((rowVal, rowIdx) => (
              <tr key={String(rowVal)} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {/* Row header */}
                <td className="border border-gray-300 p-3 font-medium text-gray-900 bg-gray-100">
                  {String(rowVal)}
                </td>
                {/* Data cells */}
                {colValues.map((colVal) => {
                  const cellValue = pivotMap.get(rowVal)?.get(colVal);
                  const displayValue = cellValue !== null && cellValue !== undefined 
                    ? typeof cellValue === 'number' 
                      ? cellValue.toLocaleString()
                      : String(cellValue)
                    : "-";
                  
                  return (
                    <td 
                      key={String(colVal)} 
                      className="border border-gray-300 p-3 text-center text-gray-900"
                    >
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
