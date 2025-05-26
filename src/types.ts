type YMProperties = Record<string, string | number | boolean>

export interface FirstPartyParams  {
  email?: string
  phone_number?: string
  first_name?: string
  last_name?: string
  yandex_cid?: string
}

/** Общий тип payload для методов */
export interface YandexMetrikaPayload {
  event: string
  name?: string
  userId?: string
  properties?: YMProperties
  traits?: YMProperties
}

export interface YandexMetricaPayloadForIdentify {
  userId: string
  traits: FirstPartyParams
}

export interface YandexMetrikaPluginOptions {
  counterId: number
  enabled?: boolean
  dev?: boolean,
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
