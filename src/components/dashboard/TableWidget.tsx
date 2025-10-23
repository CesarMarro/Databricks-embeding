import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WIDGET_STYLES } from "@/lib/dashboard/widget-styles";
import type { WidgetRenderProps } from "@/lib/dashboard/types";

export function TableWidget({ widget, data }: WidgetRenderProps) {
  const spec = widget.spec;
  if (!data || data.length === 0) {
    return (
      <Card className={WIDGET_STYLES.table.card.padding}>
        <CardContent className="pt-6 text-gray-500 text-sm">Sin datos</CardContent>
      </Card>
    );
  }

  // Infer columns from first row
  const columns = Object.keys(data[0]);

  return (
    <Card className={WIDGET_STYLES.table.card.padding}>
      {spec?.frame?.showTitle && (
        <CardHeader>
          <CardTitle className={WIDGET_STYLES.table.title.fontSize}>
            {spec.frame.title}
          </CardTitle>
          {spec.frame.showDescription && spec.frame.description && (
            <CardDescription>{spec.frame.description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={spec?.frame?.showTitle ? "" : "pt-6"}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={WIDGET_STYLES.table.header.background}>
              <tr className="border-b">
                {columns.map((col) => (
                  <th
                    key={col}
                    className={`text-left ${WIDGET_STYLES.table.header.padding} ${WIDGET_STYLES.table.header.fontSize} ${WIDGET_STYLES.table.header.fontWeight}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 100).map((row, idx) => (
                <tr key={idx} className={`${WIDGET_STYLES.table.row.border} ${WIDGET_STYLES.table.row.hover}`}>
                  {columns.map((col) => {
                    const value = row[col];
                    const isNumber = typeof value === "number";
                    
                    return (
                      <td
                        key={col}
                        className={`${WIDGET_STYLES.table.cell.padding} ${WIDGET_STYLES.table.cell.fontSize} ${
                          isNumber ? "text-right" : ""
                        }`}
                      >
                        {isNumber && value > 0 && value < 1 && col.toLowerCase().includes("prob")
                          ? `${(value * 100).toFixed(2)}%`
                          : isNumber
                          ? value.toLocaleString()
                          : value}
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
