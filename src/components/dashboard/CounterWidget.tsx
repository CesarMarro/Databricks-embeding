import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WIDGET_STYLES, getColorByPosition } from "@/lib/dashboard/widget-styles";
import type { WidgetRenderProps } from "@/lib/dashboard/types";

export function CounterWidget({ widget, data }: WidgetRenderProps) {
  const spec = widget.spec;
  
  // Debug logging
  console.log('[CounterWidget]', {
    widgetName: widget.name,
    hasSpec: !!spec,
    hasData: !!data,
    dataLength: data?.length,
    data: data,
  });
  
  if (!spec || !data || data.length === 0) {
    return (
      <Card className="bg-white border-gray-200 h-full flex items-center justify-center">
        <CardContent className="text-gray-500 text-sm">
          Sin datos ({widget.name})
        </CardContent>
      </Card>
    );
  }

  const row = data[0];
  const valueEncoding = spec.encodings?.value;
  const targetEncoding = spec.encodings?.target;
  
  let valueField = valueEncoding?.fieldName;
  let targetField = targetEncoding?.fieldName;
  
  // Remove aggregation functions like sum(), avg(), etc.
  if (valueField) {
    valueField = valueField.replace(/^(sum|avg|count|min|max)\(/i, '').replace(/\)$/, '');
  }
  if (targetField) {
    targetField = targetField.replace(/^(sum|avg|count|min|max)\(/i, '').replace(/\)$/, '');
  }
  
  console.log('[CounterWidget] Fields', {
    widgetName: widget.name,
    valueField,
    targetField,
    availableFields: Object.keys(row),
    rowData: row,
  });
  
  // Try to find value in row (case insensitive)
  let value = row[valueField];
  if (value === undefined && valueField) {
    // Try lowercase
    const lowerField = Object.keys(row).find(k => k.toLowerCase() === valueField.toLowerCase());
    if (lowerField) {
      console.log(`[CounterWidget] Found field via case-insensitive: ${lowerField}`);
      value = row[lowerField];
    }
  }
  
  const target = targetField ? row[targetField] : null;
  
  console.log('[CounterWidget] Values', {
    widgetName: widget.name,
    value,
    target,
  });

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
    <Card className="bg-white border-gray-200 h-full flex flex-col">
      {spec.frame?.showTitle && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-900">
            {spec.frame.title}
          </CardTitle>
          {spec.frame.showDescription && spec.frame.description && (
            <CardDescription className="text-xs text-gray-700">
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
