import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WIDGET_STYLES } from "@/lib/dashboard/widget-styles";
import type { WidgetRenderProps } from "@/lib/dashboard/types";

export function PieWidget({ widget, data }: WidgetRenderProps) {
  const spec = widget.spec;
  if (!spec || !data || data.length === 0) {
    return (
      <Card className={WIDGET_STYLES.pie.card.padding}>
        <CardContent className="pt-6 text-gray-500 text-sm">Sin datos</CardContent>
      </Card>
    );
  }

  const angleField = spec.encodings?.angle?.fieldName;
  const colorField = spec.encodings?.color?.fieldName;
  const showLabel = spec.encodings?.label?.show ?? true;

  // Calculate total and percentages
  const total = data.reduce((sum, row) => sum + (row[angleField] || 0), 0);
  
  // Build segments
  const segments = data.map((row, idx) => {
    const value = row[angleField] || 0;
    const label = row[colorField] || `Segment ${idx + 1}`;
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const degrees = percentage * 3.6;
    
    return { label, value, percentage, degrees };
  });

  // Generate conic gradient
  let currentDeg = 0;
  const gradientStops = segments.map((seg, idx) => {
    const color = idx === 0 ? WIDGET_STYLES.pie.colors.secondary : WIDGET_STYLES.pie.colors.primary;
    const start = currentDeg;
    const end = currentDeg + seg.degrees;
    currentDeg = end;
    return `${color} ${start}deg ${end}deg`;
  }).join(", ");

  const firstSegment = segments[0];

  return (
    <Card className={`${WIDGET_STYLES.pie.card.padding} ${WIDGET_STYLES.pie.card.minHeight} h-full`}>
      {spec.frame?.showTitle && (
        <CardHeader>
          <CardTitle className={WIDGET_STYLES.pie.title.fontSize}>
            {spec.frame.title}
          </CardTitle>
          {spec.frame.showDescription && spec.frame.description && (
            <CardDescription>{spec.frame.description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={spec.frame?.showTitle ? "" : "pt-6"}>
        <div className="flex items-center gap-8">
          {/* Donut */}
          <div
            className={`relative ${WIDGET_STYLES.pie.donut.size}`}
            style={{
              backgroundImage: `conic-gradient(${gradientStops})`,
              borderRadius: "9999px",
              mask: `radial-gradient(circle at center, transparent ${WIDGET_STYLES.pie.donut.thickness}, black calc(${WIDGET_STYLES.pie.donut.thickness} + 1%))`,
              WebkitMask: `radial-gradient(circle at center, transparent ${WIDGET_STYLES.pie.donut.thickness}, black calc(${WIDGET_STYLES.pie.donut.thickness} + 1%))`,
            }}
          >
            {showLabel && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-semibold">{firstSegment.percentage.toFixed(1)}%</div>
                  <div className="text-[11px] text-gray-500">{firstSegment.label}</div>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className={`space-y-2 ${WIDGET_STYLES.pie.legend.fontSize}`}>
            {segments.map((seg, idx) => {
              const color = idx === 0 ? WIDGET_STYLES.pie.colors.secondary : WIDGET_STYLES.pie.colors.primary;
              return (
                <div key={idx} className={`flex items-center ${WIDGET_STYLES.pie.legend.itemGap}`}>
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-gray-700">{seg.label}:</span>
                  <span className="font-semibold">{seg.value.toLocaleString()}</span>
                  <span className="text-gray-500">({seg.percentage.toFixed(1)}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
