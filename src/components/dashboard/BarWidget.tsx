import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WIDGET_STYLES } from "@/lib/dashboard/widget-styles";
import type { WidgetRenderProps } from "@/lib/dashboard/types";

export function BarWidget({ widget, data }: WidgetRenderProps) {
  const spec = widget.spec;
  if (!spec || !data || data.length === 0) {
    return (
      <Card className={WIDGET_STYLES.bar.card.padding}>
        <CardContent className="pt-6 text-gray-500 text-sm">Sin datos</CardContent>
      </Card>
    );
  }

  let xField = spec.encodings?.x?.fieldName;
  let yField = spec.encodings?.y?.fieldName;
  let colorField = spec.encodings?.color?.fieldName;
  const showLabel = spec.encodings?.label?.show ?? true;
  
  // Remove aggregation functions like sum(), avg(), etc.
  if (xField) {
    xField = xField.replace(/^(sum|avg|count|min|max)\(/i, '').replace(/\)$/, '');
  }
  if (yField) {
    yField = yField.replace(/^(sum|avg|count|min|max)\(/i, '').replace(/\)$/, '');
  }
  if (colorField) {
    colorField = colorField.replace(/^(sum|avg|count|min|max)\(/i, '').replace(/\)$/, '');
  }
  
  const yFormat = spec.encodings?.y?.format?.type || "number-plain";
  const isPercentFormat = yFormat === "number-percent";

  // Determine if vertical or horizontal based on x scale type
  const isVertical = spec.encodings?.x?.scale?.type === "categorical" || spec.encodings?.x?.scale?.type === "quantitative";

  // Group data by xField if there are duplicates (e.g., multiple rows per country)
  const groupedData = data.reduce((acc: any[], row) => {
    const xValue = row[xField];
    const existing = acc.find(r => r[xField] === xValue);
    if (existing) {
      // Average the y values if multiple rows exist
      existing[yField] = (existing[yField] + (row[yField] || 0)) / 2;
    } else {
      acc.push({ [xField]: xValue, [yField]: row[yField] || 0 });
    }
    return acc;
  }, []);
  
  // Sort by xField (for quantitative like age) or yField (for categorical like country)
  const xScaleType = spec.encodings?.x?.scale?.type;
  const sortedData = xScaleType === "quantitative"
    ? groupedData.sort((a, b) => (a[xField] || 0) - (b[xField] || 0)) // Sort by X ascending for age
    : groupedData.sort((a, b) => (b[yField] || 0) - (a[yField] || 0)).slice(0, 10); // Sort by Y descending for country, top 10

  // Find max value for scaling
  const maxValue = Math.max(...sortedData.map((row) => row[yField] || 0));

  return (
    <Card className="bg-white border-gray-200 h-full flex flex-col p-4">
      {(spec.frame?.showTitle || spec.frame?.title) && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            {spec.frame.title || "Gráfica"}
          </CardTitle>
          {spec.frame.showDescription && spec.frame.description && (
            <CardDescription className="text-gray-700">{spec.frame.description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className="flex-1 overflow-hidden p-2">
        {isVertical ? (
          // Vertical bars with axes and grid
          <div className="h-full flex flex-col">
            {/* Y axis label */}
            {spec.encodings?.y?.displayName && (
              <div className="text-[10px] font-medium text-gray-700 mb-1">
                {spec.encodings.y.displayName}
              </div>
            )}
            
            <div className="flex-1 flex gap-2">
              {/* Y axis with scale */}
              <div className="flex flex-col justify-between text-[9px] text-gray-600 w-10 text-right pr-1">
                <span>{isPercentFormat ? `${(maxValue * 100).toFixed(0)}%` : maxValue.toFixed(0)}</span>
                <span>{isPercentFormat ? `${(maxValue * 0.75 * 100).toFixed(0)}%` : (maxValue * 0.75).toFixed(0)}</span>
                <span>{isPercentFormat ? `${(maxValue * 0.5 * 100).toFixed(0)}%` : (maxValue * 0.5).toFixed(0)}</span>
                <span>{isPercentFormat ? `${(maxValue * 0.25 * 100).toFixed(0)}%` : (maxValue * 0.25).toFixed(0)}</span>
                <span>0%</span>
              </div>
              
              {/* Chart area with grid */}
              <div className="flex-1 relative">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-t border-gray-200" />
                  ))}
                </div>
                
                {/* Bars */}
                <div className="absolute inset-0 flex items-end justify-around gap-[2px] pb-6">
                  {sortedData.map((row, idx) => {
                    const xValue = row[xField];
                    const yValue = row[yField] || 0;
                    const heightPct = maxValue > 0 ? (yValue / maxValue) * 100 : 0;
                    
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 min-w-0 h-full justify-end">
                        <div
                          className="w-full"
                          style={{
                            height: `${heightPct}%`,
                            backgroundColor: '#0ea5e9',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                
                {/* X axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-around">
                  {sortedData.filter((_, idx) => idx % Math.ceil(sortedData.length / 10) === 0).map((row, idx) => (
                    <div key={idx} className="text-[9px] text-gray-600">
                      {row[xField]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* X axis label */}
            {xField && (
              <div className="text-[10px] font-medium text-gray-700 text-center mt-1">
                {xField}
              </div>
            )}
          </div>
        ) : (
          // Horizontal bars
          <div className="space-y-3 overflow-y-auto max-h-full">
            {sortedData.map((row, idx) => {
              const xValue = row[xField];
              const yValue = row[yField] || 0;
              const widthPct = maxValue > 0 ? (yValue / maxValue) * 100 : 0;
              const color = WIDGET_STYLES.bar.colors.gradient[idx % WIDGET_STYLES.bar.colors.gradient.length];
              
              const displayValue = isPercentFormat ? `${(yValue * 100).toFixed(0)}%` : yValue.toFixed(1);

              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-16 text-xs text-gray-900 truncate">
                    {xValue}
                  </div>
                  <div className="flex-1 bg-gray-200 h-6 rounded-full overflow-hidden">
                    <div
                      className="h-6 rounded-full transition-all"
                      style={{
                        width: `${Math.max(widthPct, 5)}%`,
                        minWidth: '12px',
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  {showLabel && (
                    <div className="w-12 text-right text-xs font-semibold text-gray-900">
                      {displayValue}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
