type YMProperties = Record<string, string | number | boolean>

/** Общий тип payload для методов */
export interface YandexMetrikaPayload {
  event: string
  name?: string
  userId?: string
  properties?: YMProperties
  traits?: YMProperties
}

export interface YandexMetrikaPluginOptions {
  counterId: number
  enabled?: boolean
  mapEvents?: Record<string, string> // analyticsEvent → yandexGoalId
}

interface YandexMetrikaFunction {
  (counterId: number, command: string, ...params: unknown[]): void
  a?: unknown[]
  l?: number
}

declare global {
  interface Window {
    ym?: YandexMetrikaFunction
  }
}
