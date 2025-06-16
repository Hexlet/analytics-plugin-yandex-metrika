import type { AnalyticsPlugin } from 'analytics'
import { YandexMetrikaPayload, YandexMetricaPayloadForIdentify, YandexMetrikaPluginOptions, FirstPartyParams } from './types'

/**
* Фабрика плагина для интеграции с Яндекс Метрикой.
* Реализует методы initialize, loaded, track, page и identify.
*
* @param options - Опции плагина, включая counterId и флаг enabled.
* @returns Объект, реализующий интерфейс AnalyticsPlugin.
*/
export default function yandexMetrika(options: YandexMetrikaPluginOptions): AnalyticsPlugin {
  const defaultOptions: Record<string, boolean> = {
    enabled: true,
  }

  const loaded = () => {
    // Защита от SSR — если window или document нет, считаем, что не загружено
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return false;
    }

    return typeof window.ym === 'function'
  }

  const isYmAvailable = (config: YandexMetrikaPluginOptions): boolean => {
    return !!config.enabled && loaded()
  }

  return {
    name: 'yandexMetrika',
    config: { ...defaultOptions, ...options },

    /**
    * Метод инициализации плагина.
    */
    initialize({ config }: { config: YandexMetrikaPluginOptions }) {

      if (!config.enabled || loaded()) return

      if (!config.counterId) {
        throw new Error('YandexMetrikaPlugin: counterId is required.')
      }

      // Динамически загружаем скрипт Яндекс Метрики
      ((m: Window, e: Document, t: string, r: string, i: 'ym') => {
        m[i] ??= function (...args: unknown[]) {
          if (!m.ym) return
          m.ym.a ??= []
          m.ym.a.push(args)
        }
        m[i].l = new Date().getTime()
        const k = e.createElement(t) as HTMLScriptElement
        const a = e.getElementsByTagName(t)[0]
        k.async = true
        k.src = r
        a.parentNode?.insertBefore(k, a)
      })(
        window,
        document,
        'script',
        'https://mc.yandex.ru/metrika/tag.js',
        'ym',
      )

      // Если ym не определена, задаём заглушку (она позже заменится загруженным скриптом)
      window.ym ??= (...args: unknown[]): void => {
        (window.ym!.a ??= []).push(args)
      }
      // Инициализируем Яндекс Метрику
      window.ym(config.counterId, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
      })
    },

    loaded() {
      return loaded()
    },
    /**
    * Отслеживает событие через Яндекс Метрику с использованием команды reachGoal.
    *
    * @param event - Название события.
    * @param properties - Дополнительные параметры.
    */
    track: ({ payload, config }: { payload: YandexMetrikaPayload, config: YandexMetrikaPluginOptions }) => {
      if (!isYmAvailable(config)) return

      const eventMap = config.mapEvents || {}
      const mappedEvent = eventMap[payload.event] || payload.event

      if (config.dev && !eventMap[payload.event]) {
        console.warn(`[YandexMetrika] No mapped goal for event "${payload.event}", sending as-is`)
      }

      window.ym!(config.counterId, 'reachGoal', mappedEvent, payload.properties)
    },

    /**
    * Регистрирует посещение страницы через команду hit.
    *
    * @param name - Имя страницы (не используется напрямую – используется текущий URL).
    * @param properties - Дополнительные параметры.
    */
    page: ({ payload, config }: { payload: YandexMetrikaPayload, config: YandexMetrikaPluginOptions }) => {
      if (!isYmAvailable(config)) return

      // Если payload.properties не задан — ставим пустой объект
      const { properties = {} } = payload

      // Если внутри нет url — используем window.location.href
      const url = properties.url ?? window.location.href

      window.ym!(config.counterId, 'hit', url, properties)
    },

    /**
    * Устанавливает идентификатор пользователя (setUserID) и, при наличии, дополнительные параметры (userParams).
    *
    * @param userId - Идентификатор пользователя.
    * @param traits - Дополнительные атрибуты пользователя.
    */
    identify: ({ payload, config }: { payload: YandexMetricaPayloadForIdentify, config: YandexMetrikaPluginOptions }) => {
      if (!isYmAvailable(config)) return

      const traits = payload.traits

      window.ym!(config.counterId, 'setUserID', payload.userId)
      if (traits && Object.keys(traits).length > 0) {
        window.ym!(config.counterId, 'userParams', { ...traits, UserID: payload.userId })

        const firstPartyParams: FirstPartyParams = {}
        if (traits.email) {
          firstPartyParams.email = traits.email
        }
        if (traits.phone_number) {
          firstPartyParams.phone_number = traits.phone_number
        }
        if (traits.first_name) {
          firstPartyParams.first_name = traits.first_name
        }
        if (traits.last_name) {
          firstPartyParams.last_name = traits.last_name
        }
        if (traits.yandex_cid) {
          firstPartyParams.yandex_cid = traits.yandex_cid
        }
        window.ym!(config.counterId, 'firstPartyParams', firstPartyParams);
      }
    },
  }
}
