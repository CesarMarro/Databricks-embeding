import { Card, CardContent } from "@/components/ui/card";
import { WIDGET_STYLES } from "@/lib/dashboard/widget-styles";
import type { Widget } from "@/lib/dashboard/types";

interface TextWidgetProps {
  widget: Widget;
}

export function TextWidget({ widget }: TextWidgetProps) {
  const lines = widget.multilineTextboxSpec?.lines || [];

  return (
    <Card className="bg-white border-gray-200 h-full p-4">
      <CardContent className="pt-6 space-y-2">
        {lines.map((line, idx) => {
          // Simple markdown-like parsing
          const isHeading = line.trim().startsWith("#");
          const text = line.replace(/^#+\s*/, "").trim();

          if (isHeading) {
            return (
              <h2
                key={idx}
                className={`${WIDGET_STYLES.text.heading.fontSize} ${WIDGET_STYLES.text.heading.fontWeight} ${WIDGET_STYLES.text.heading.color}`}
              >
                {text}
              </h2>
            );
          }

          if (!text) return <div key={idx} className="h-2" />;

          return (
            <p
              key={idx}
              className={`${WIDGET_STYLES.text.paragraph.fontSize} ${WIDGET_STYLES.text.paragraph.color} ${WIDGET_STYLES.text.paragraph.lineHeight}`}
            >
              {text}
            </p>
          );
        })}
      </CardContent>
    </Card>
  );
}
