// Types para el sistema de dashboard dinámico

export interface DashboardJSON {
  datasets: Dataset[];
  pages: Page[];
}

export interface Dataset {
  name: string;
  displayName: string;
  queryLines: string[];
  parameters?: Parameter[];
}

export interface Parameter {
  displayName: string;
  keyword: string;
  dataType: string;
  defaultSelection?: {
    values: {
      dataType: string;
      values: Array<{ value: string }>;
    };
  };
}

export interface Page {
  name: string;
  displayName: string;
  layout: LayoutItem[];
  pageType?: string;
}

export interface LayoutItem {
  widget: Widget;
  position: Position;
}

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Widget {
  name: string;
  queries?: Query[];
  spec?: WidgetSpec;
  multilineTextboxSpec?: {
    lines: string[];
  };
}

export interface Query {
  name: string;
  query: {
    datasetName: string;
    fields?: Field[];
    parameters?: Array<{ name: string; keyword: string }>;
    disaggregated?: boolean;
  };
}

export interface Field {
  name: string;
  expression: string;
}

export interface WidgetSpec {
  version: number;
  widgetType: WidgetType;
  encodings?: any;
  frame?: {
    showTitle?: boolean;
    title?: string;
    showDescription?: boolean;
    description?: string;
  };
  selection?: any;
}

export type WidgetType =
  | "counter"
  | "pie"
  | "bar"
  | "table"
  | "filter-single-select"
  | "range-slider"
  | "choropleth-map"
  | "multiline-text";

export interface WidgetRenderProps {
  widget: Widget;
  data: any[];
  parameters?: Record<string, any>;
}
