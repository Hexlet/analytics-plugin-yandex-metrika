import type { AnalyticsPlugin } from 'analytics'

import { YandexMetrikaPayload, YandexMetrikaPluginOptions } from '../types'

/**
* Фабрика плагина для интеграции с Яндекс Метрикой.
* Реализует методы initialize, loaded, track, page и identify.
*
* @param options - Опции плагина, включая counterId и флаг enabled.
* @returns Объект, реализующий интерфейс AnalyticsPlugin.
*/
export default function yandexMetrika(
  options: YandexMetrikaPluginOptions,
): AnalyticsPlugin {
  const defaultOptions: Record<string, boolean> = {
    enabled: true,
  }

  /**
   * Проверяет, что плагин включен и функция ym доступна и готова к вызову.
   */
  function isYmAvailable(config: YandexMetrikaPluginOptions): boolean {
    return !!config.enabled && typeof window.ym === 'function'
  }

  return {
    name: 'yandexMetrika',
    config: { ...defaultOptions, ...options },

    /**
    * Метод инициализации плагина.
    */
    initialize({ config }: { config: YandexMetrikaPluginOptions }) {
      const { counterId } = config

      if (!counterId) {
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
      window.ym(counterId, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
      })
    },

    /**
    * Отслеживает, что реальный скрипт Яндекс Метрики был успешно загружен.
    */
    loaded({ config }: { config: YandexMetrikaPluginOptions }) {
      return isYmAvailable(config)
    },
    /**
    * Отслеживает событие через Яндекс Метрику с использованием команды reachGoal.
    *
    * @param event - Название события.
    * @param properties - Дополнительные параметры.
    */
    track: ({ payload, config }: { payload: YandexMetrikaPayload, config: YandexMetrikaPluginOptions }) => {
      if (!isYmAvailable(config)) return

      window.ym!(config.counterId, 'reachGoal', payload.event, payload.properties)
    },

    /**
    * Регистрирует посещение страницы через команду hit.
    *
    * @param name - Имя страницы (не используется напрямую – используется текущий URL).
    * @param properties - Дополнительные параметры.
    */
    page: ({ payload, config }: { payload: YandexMetrikaPayload, config: YandexMetrikaPluginOptions }) => {
      if (!isYmAvailable(config)) return

      window.ym!(options.counterId, 'hit', window.location.href, payload.properties ?? {})
    },

    /**
    * Устанавливает идентификатор пользователя (setUserID) и, при наличии, дополнительные параметры (userParams).
    *
    * @param userId - Идентификатор пользователя.
    * @param traits - Дополнительные атрибуты пользователя.
    */
    identify: ({ payload, config }: { payload: YandexMetrikaPayload, config: YandexMetrikaPluginOptions }) => {
      if (!isYmAvailable(config)) return

      const { counterId } = config

      window.ym!(counterId, 'setUserID', payload.userId)
      if (payload.traits && Object.keys(payload.traits).length > 0) {
        window.ym!(counterId, 'userParams', payload.traits)
      }
    },
  }
}
