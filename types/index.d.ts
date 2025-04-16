export type YMProperties = Record<string, string | number | boolean>;

export interface YandexMetrikaPluginOptions {
  counterId: number;
  enabled?: boolean;
}

interface YandexMetrikaFunction {
  (counterId: number, command: string, ...params: unknown[]): void;
  a?: unknown[];
  l?: number;
}

declare global {
  interface Window {
    ym?: YandexMetrikaFunction;
  }
}
