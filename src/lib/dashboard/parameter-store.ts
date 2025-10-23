// Parameter store: gestiona parámetros globales y por widget

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Parameter } from "./types";

export class ParameterStore {
  private params: Record<string, any> = {};
  private listeners: Set<() => void> = new Set();

  constructor(initialParams?: Record<string, any>) {
    if (initialParams) {
      Object.entries(initialParams).forEach(([key, value]) => {
        this.params[key] = value;
      });
    }
  }

  get(key: string): any {
    return this.params[key];
  }

  set(key: string, value: any): void {
    this.params[key] = value;
    this.notifyListeners();
  }

  getAll(): Record<string, any> {
    return { ...this.params };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  static fromJSON(parameters: Parameter[]): ParameterStore {
    const initialParams: Record<string, any> = {};
    
    parameters.forEach((param) => {
      const defaultValue = param.defaultSelection?.values?.values?.[0]?.value;
      if (defaultValue !== undefined) {
        // Convertir a número si es posible
        const numValue = Number(defaultValue);
        initialParams[param.keyword] = isNaN(numValue) ? defaultValue : numValue;
      }
    });

    return new ParameterStore(initialParams);
  }
}
