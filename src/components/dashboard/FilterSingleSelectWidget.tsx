import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import type { Widget } from "@/lib/dashboard/types";

interface FilterSingleSelectWidgetProps {
  widget: Widget;
  parameters: Record<string, any>;
  onParameterChange?: (paramName: string, value: any) => void;
}

export function FilterSingleSelectWidget({ widget, parameters, onParameterChange }: FilterSingleSelectWidgetProps) {
  const spec = widget.spec;
  const fieldName = spec?.encodings?.fields?.[0]?.fieldName;
  
  // Get parameter name from field name (e.g., "costo_retencion")
  const paramName = fieldName || widget.name;
  
  // Get current value from parameters or default
  const [value, setValue] = useState<string>(
    String(parameters[paramName] || spec?.encodings?.fields?.[0]?.defaultValue || "0")
  );
  
  useEffect(() => {
    setValue(String(parameters[paramName] || spec?.encodings?.fields?.[0]?.defaultValue || "0"));
  }, [parameters, paramName, spec]);
  
  const handleChange = (newValue: string) => {
    setValue(newValue);
    
    // Parse as number if it looks like a number
    const numValue = parseFloat(newValue);
    const finalValue = !isNaN(numValue) ? numValue : newValue;
    
    // Update parameters
    if (onParameterChange) {
      onParameterChange(paramName, finalValue);
    }
  };
  
  const handleBlur = () => {
    // Ensure value is valid on blur
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setValue("0");
      if (onParameterChange) {
        onParameterChange(paramName, 0);
      }
    }
  };
  
  return (
    <Card className="bg-white border-gray-200 h-full flex flex-col">
      <CardContent className="p-4 flex items-center gap-3">
        <Label htmlFor={paramName} className="text-sm font-semibold text-gray-900 whitespace-nowrap">
          {spec?.frame?.title || paramName}
        </Label>
        <Input
          id={paramName}
          type="number"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          className="flex-1 text-right font-medium"
          step="0.01"
        />
      </CardContent>
    </Card>
  );
}
