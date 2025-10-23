import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import type { Widget } from "@/lib/dashboard/types";

interface FilterSingleSelectWidgetProps {
  widget: Widget;
  parameters: Record<string, unknown>;
  onParameterChange?: (paramName: string, value: unknown) => void;
}

export function FilterSingleSelectWidget({ widget, parameters, onParameterChange }: FilterSingleSelectWidgetProps) {
  const spec = widget.spec;
  const field = spec?.encodings?.fields?.[0];
  
  // Get parameter name - try parameterName first, then fieldName, then widget name
  const paramName = field?.parameterName || field?.fieldName || widget.name;
  
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
    <Card className="bg-white border-gray-200 h-full flex flex-col shadow-sm">
      <CardContent className="p-4">
        <Label htmlFor={paramName} className="text-sm font-semibold text-gray-900 block mb-2">
          {spec?.frame?.title || paramName}
        </Label>
        <Input
          id={paramName}
          type="number"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          className="w-full text-lg font-semibold text-gray-900 border-2 border-gray-300 focus:border-indigo-500"
          step="0.01"
        />
      </CardContent>
    </Card>
  );
}
