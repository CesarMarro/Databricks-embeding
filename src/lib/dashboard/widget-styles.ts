// Widget styles: configuración visual para cada tipo de widget

export const WIDGET_STYLES = {
  counter: {
    card: {
      padding: "p-4",
      minHeight: "min-h-[120px]",
    },
    title: {
      fontSize: "text-sm",
      fontWeight: "font-medium",
      color: "text-gray-700",
      marginBottom: "mb-2",
    },
    value: {
      fontSize: "text-3xl",
      fontWeight: "font-bold",
      color: "text-gray-900",
      marginBottom: "mb-1",
    },
    target: {
      fontSize: "text-xs",
      color: "text-gray-500",
    },
    description: {
      fontSize: "text-xs",
      color: "text-gray-500",
      marginTop: "mt-1",
    },
  },
  
  pie: {
    card: {
      padding: "p-4",
      minHeight: "min-h-[300px]",
    },
    title: {
      fontSize: "text-base",
      fontWeight: "font-semibold",
      color: "text-gray-900",
      marginBottom: "mb-4",
    },
    donut: {
      size: "h-40 w-40",
      thickness: "50%", // mask percentage for donut hole
    },
    legend: {
      fontSize: "text-sm",
      gap: "gap-2",
      itemGap: "gap-2",
    },
    colors: {
      primary: "#0ea5e9", // blue
      secondary: "#f59e0b", // orange
      success: "#22c55e", // green
      danger: "#ef4444", // red
    },
  },
  
  bar: {
    card: {
      padding: "p-4",
      minHeight: "min-h-[300px]",
    },
    title: {
      fontSize: "text-base",
      fontWeight: "font-semibold",
      color: "text-gray-900",
      marginBottom: "mb-4",
    },
    container: {
      height: "h-48",
      gap: "gap-4",
    },
    barWidth: "w-16", // for vertical bars
    barHeight: "h-2", // for horizontal bars
    label: {
      fontSize: "text-xs",
      color: "text-gray-700",
    },
    value: {
      fontSize: "text-xs",
      fontWeight: "font-semibold",
    },
    colors: {
      primary: "#0ea5e9",
      secondary: "#f59e0b",
      gradient: ["#0ea5e9", "#f59e0b", "#22c55e", "#ef4444"],
    },
  },
  
  table: {
    card: {
      padding: "p-4",
    },
    title: {
      fontSize: "text-base",
      fontWeight: "font-semibold",
      color: "text-gray-900",
      marginBottom: "mb-4",
    },
    header: {
      fontSize: "text-xs",
      fontWeight: "font-medium",
      color: "text-gray-700",
      padding: "p-2",
      background: "bg-gray-50",
    },
    cell: {
      fontSize: "text-sm",
      color: "text-gray-900",
      padding: "p-2",
    },
    row: {
      hover: "hover:bg-gray-50",
      border: "border-b border-gray-200",
    },
  },
  
  filter: {
    card: {
      padding: "p-4",
    },
    title: {
      fontSize: "text-sm",
      fontWeight: "font-medium",
      color: "text-gray-700",
      marginBottom: "mb-2",
    },
    input: {
      fontSize: "text-sm",
      padding: "px-3 py-2",
      border: "border border-gray-300",
      borderRadius: "rounded-md",
      focus: "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
    },
    description: {
      fontSize: "text-xs",
      color: "text-gray-500",
      marginTop: "mt-1",
    },
  },
  
  text: {
    card: {
      padding: "p-4",
    },
    heading: {
      fontSize: "text-lg",
      fontWeight: "font-semibold",
      color: "text-gray-900",
      marginBottom: "mb-2",
    },
    paragraph: {
      fontSize: "text-sm",
      color: "text-gray-700",
      lineHeight: "leading-relaxed",
    },
  },
} as const;

// Helper para combinar clases de estilo
export function getWidgetClasses(
  widgetType: keyof typeof WIDGET_STYLES,
  element: string
): string {
  const styles = WIDGET_STYLES[widgetType];
  if (!styles || !(element in styles)) return "";
  
  const elementStyles = (styles as any)[element];
  if (typeof elementStyles === "string") return elementStyles;
  
  return Object.values(elementStyles).join(" ");
}

// Colores por posición (para visualizationColors)
export const VISUALIZATION_COLORS = [
  "#0ea5e9", // blue
  "#f59e0b", // orange
  "#22c55e", // green
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange-600
];

export function getColorByPosition(position: number): string {
  return VISUALIZATION_COLORS[position % VISUALIZATION_COLORS.length];
}
