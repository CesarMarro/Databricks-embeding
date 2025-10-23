import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import type { Widget } from "@/lib/dashboard/types";

interface RangeSliderWidgetProps {
  widget: Widget;
  parameters: Record<string, unknown>;
  onParameterChange?: (paramName: string, value: unknown) => void;
}

export function RangeSliderWidget({ widget, parameters, onParameterChange }: RangeSliderWidgetProps) {
  const spec = widget.spec;
  const fieldName = spec?.encodings?.fields?.[0]?.fieldName;
  
  // Determine parameter names from field name
  // For "prob_pct" -> prob_min, prob_max
  const paramPrefix = fieldName?.replace(/_pct$/, '') || 'value';
  const minParam = `${paramPrefix}_min`;
  const maxParam = `${paramPrefix}_max`;
  
  // Get current values from parameters or defaults
  const [range, setRange] = useState<[number, number]>([
    (parameters[minParam] as number) || 0,
    (parameters[maxParam] as number) || 1
  ]);
  
  useEffect(() => {
    setRange([
      (parameters[minParam] as number) || 0,
      (parameters[maxParam] as number) || 1
    ]);
  }, [parameters, minParam, maxParam]);
  
  const handleRangeChange = (values: number[]) => {
    const [min, max] = values;
    setRange([min, max]);
    
    // Update parameters
    if (onParameterChange) {
      onParameterChange(minParam, min);
      onParameterChange(maxParam, max);
    }
  };
  
  return (
    <Card className="bg-white border-gray-200 h-full flex flex-col">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="text-sm font-semibold text-gray-900">
            {spec?.frame?.title || "Rango"}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={range}
            onValueChange={handleRangeChange}
            className="w-full"
          />
        </div>
        <div className="flex gap-2 text-sm font-medium text-gray-900 flex-shrink-0">
          <span>{(range[0] * 100).toFixed(0)}%</span>
          <span className="text-gray-400">-</span>
          <span>{(range[1] * 100).toFixed(0)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
