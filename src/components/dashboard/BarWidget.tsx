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

  const xField = spec.encodings?.x?.fieldName;
  const yField = spec.encodings?.y?.fieldName;
  const colorField = spec.encodings?.color?.fieldName;
  const showLabel = spec.encodings?.label?.show ?? true;
  
  const yFormat = spec.encodings?.y?.format?.type || "number-plain";
  const isPercentFormat = yFormat === "number-percent";

  // Determine if vertical or horizontal based on x scale type
  const isVertical = spec.encodings?.x?.scale?.type === "categorical" || spec.encodings?.x?.scale?.type === "quantitative";

  // Find max value for scaling
  const maxValue = Math.max(...data.map((row) => row[yField] || 0));

  return (
    <Card className={`${WIDGET_STYLES.bar.card.padding} ${WIDGET_STYLES.bar.card.minHeight} h-full`}>
      {spec.frame?.showTitle && (
        <CardHeader>
          <CardTitle className={WIDGET_STYLES.bar.title.fontSize}>
            {spec.frame.title}
          </CardTitle>
          {spec.frame.showDescription && spec.frame.description && (
            <CardDescription>{spec.frame.description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={spec.frame?.showTitle ? "" : "pt-6"}>
        {isVertical ? (
          // Vertical bars
          <div className={`flex items-end justify-center ${WIDGET_STYLES.bar.container.gap} ${WIDGET_STYLES.bar.container.height}`}>
            {data.map((row, idx) => {
              const xValue = row[xField];
              const yValue = row[yField] || 0;
              const heightPct = maxValue > 0 ? (yValue / maxValue) * 100 : 0;
              const color = idx === 0 ? WIDGET_STYLES.bar.colors.secondary : WIDGET_STYLES.bar.colors.primary;
              
              const displayValue = isPercentFormat ? `${(yValue * 100).toFixed(0)}%` : yValue.toFixed(0);

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  {showLabel && (
                    <div className={`${WIDGET_STYLES.bar.value.fontSize} ${WIDGET_STYLES.bar.value.fontWeight}`}>
                      {displayValue}
                    </div>
                  )}
                  <div
                    className={`${WIDGET_STYLES.bar.barWidth} rounded-t`}
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: color,
                    }}
                  />
                  <div className={`${WIDGET_STYLES.bar.label.fontSize} ${WIDGET_STYLES.bar.label.color}`}>
                    {xValue}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Horizontal bars
          <div className="space-y-2">
            {data.map((row, idx) => {
              const xValue = row[xField];
              const yValue = row[yField] || 0;
              const widthPct = maxValue > 0 ? (yValue / maxValue) * 100 : 0;
              const color = idx === 0 ? WIDGET_STYLES.bar.colors.secondary : WIDGET_STYLES.bar.colors.primary;
              
              const displayValue = isPercentFormat ? `${(yValue * 100).toFixed(0)}%` : yValue.toFixed(0);

              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-24 ${WIDGET_STYLES.bar.label.fontSize} ${WIDGET_STYLES.bar.label.color}`}>
                    {xValue}
                  </div>
                  <div className="flex-1 bg-gray-200 h-2 rounded">
                    <div
                      className="h-2 rounded"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  {showLabel && (
                    <div className={`w-16 text-right ${WIDGET_STYLES.bar.value.fontSize} ${WIDGET_STYLES.bar.value.fontWeight}`}>
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
