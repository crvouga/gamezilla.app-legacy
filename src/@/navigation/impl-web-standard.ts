import { ILogger } from '../logger'
import { Err, Ok } from '../result'
import { PubSub, Sub } from '../sub'
import { INavigation } from './interface'

export type Config = {
  t: 'web-standard'
  logger: ILogger
}

export const Navigation = (config: Config): INavigation => {
  const logger = config.logger.child(['navigation'])
  const subsByName: Record<string, PubSub<string>> = {}

  const get = (name: string) => {
    return new URLSearchParams(window.location.search).get(name) ?? null
  }

  const onChange = (name: string) => {
    const sub = subsByName[name]
    if (!sub) return
    const value = get(name)
    if (!value) return
    sub.pub(value)
  }

  return {
    async push(name: string, value: string) {
      logger.debug(`push ${name}=${value}`)
      try {
        const url = new URL(window.location.href)
        url.searchParams.set(name, value)
        window.history.pushState(null, '', url.toString())
        window.dispatchEvent(new Event('popstate'))
        await new Promise((resolve) => setTimeout(resolve, 0))
        onChange(name)
        return Ok(null)
      } catch (e) {
        logger.error(e)
        return Err(String(e))
      }
    },
    async replace(name: string, value: string) {
      logger.debug(`replace ${name}=${value}`)
      try {
        const url = new URL(window.location.href)
        url.searchParams.set(name, value)
        window.history.replaceState(null, '', url.toString())
        window.dispatchEvent(new Event('popstate'))
        await new Promise((resolve) => setTimeout(resolve, 0))
        onChange(name)
        return Ok(null)
      } catch (e) {
        logger.error(e)
        return Err(String(e))
      }
    },
    async back() {
      try {
        logger.debug('back')
        window.history.back()
        await new Promise((resolve) => setTimeout(resolve, 0))
        for (const paramName of new URLSearchParams(window.location.search).keys()) {
          onChange(paramName)
        }
        return Ok(null)
      } catch (e) {
        logger.error(e)
        return Err(String(e))
      }
    },
    get(name: string) {
      logger.debug(`get ${name}`)
      return new URLSearchParams(window.location.search).get(name) ?? null
    },
    sub(name: string) {
      const existing = subsByName[name]
      if (existing) return existing
      const sub = Sub.create<string>()
      subsByName[name] = sub
      return sub
    },
    async clear() {
      try {
        window.history.replaceState({}, '', '/')
        await new Promise((resolve) => setTimeout(resolve, 0))
        for (const paramName of new URLSearchParams(window.location.search).keys()) {
          onChange(paramName)
        }
        return Ok(null)
      } catch (e) {
        logger.error(e)
        return Err(String(e))
      }
    },
  }
}
