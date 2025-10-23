import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WIDGET_STYLES, getColorByPosition } from "@/lib/dashboard/widget-styles";
import type { WidgetRenderProps } from "@/lib/dashboard/types";

export function CounterWidget({ widget, data }: WidgetRenderProps) {
  const spec = widget.spec;
  if (!spec || !data || data.length === 0) {
    return (
      <Card className={WIDGET_STYLES.counter.card.padding}>
        <CardContent className="pt-6 text-gray-500 text-sm">Sin datos</CardContent>
      </Card>
    );
  }

  const row = data[0];
  const valueEncoding = spec.encodings?.value;
  const targetEncoding = spec.encodings?.target;
  
  const valueField = valueEncoding?.fieldName;
  const targetField = targetEncoding?.fieldName;
  
  const value = row[valueField];
  const target = targetField ? row[targetField] : null;

  // Format value
  const formatType = valueEncoding?.format?.type || "number-plain";
  let displayValue = value;
  
  if (formatType === "number-percent") {
    displayValue = `${(value * 100).toFixed(valueEncoding?.format?.decimalPlaces?.places ?? 2)}%`;
  } else if (formatType === "number-plain") {
    const decimals = valueEncoding?.format?.decimalPlaces?.places ?? 0;
    displayValue = typeof value === "number" ? value.toFixed(decimals) : value;
  }

  // Apply style rules (color based on conditions)
  let valueColor = "text-gray-900";
  if (valueEncoding?.style?.color?.themeColorType === "visualizationColors") {
    const colorPosition = valueEncoding.style.color.position ?? 0;
    const color = getColorByPosition(colorPosition);
    valueColor = `text-[${color}]`;
  } else if (valueEncoding?.style?.color && typeof valueEncoding.style.color === "string") {
    valueColor = `text-[${valueEncoding.style.color}]`;
  }

  const isBold = valueEncoding?.style?.bold;
  const isItalic = valueEncoding?.style?.italic;

  return (
    <Card className={`${WIDGET_STYLES.counter.card.padding} ${WIDGET_STYLES.counter.card.minHeight}`}>
      {spec.frame?.showTitle && (
        <CardHeader className="pb-2">
          <CardTitle className={WIDGET_STYLES.counter.title.fontSize}>
            {spec.frame.title}
          </CardTitle>
          {spec.frame.showDescription && spec.frame.description && (
            <CardDescription className={WIDGET_STYLES.counter.description.fontSize}>
              {spec.frame.description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={spec.frame?.showTitle ? "" : "pt-6"}>
        <div
          className={`${WIDGET_STYLES.counter.value.fontSize} ${WIDGET_STYLES.counter.value.fontWeight} ${valueColor} ${
            isBold ? "font-bold" : ""
          } ${isItalic ? "italic" : ""}`}
        >
          {displayValue}
        </div>
        {target !== null && (
          <div className={`${WIDGET_STYLES.counter.target.fontSize} ${WIDGET_STYLES.counter.target.color}`}>
            Target: {target}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
