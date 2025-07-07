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
  const subsByName: Record<string, PubSub<string | null>> = {}

  const getAll = () => {
    return new URLSearchParams(window.location.search)
  }

  const get = (name: string) => {
    return getAll().get(name) ?? null
  }

  const onChange = () => {
    for (const name in subsByName) {
      const sub = subsByName[name]
      if (!sub) return
      const value = get(name)
      sub.pub(value)
    }
  }

  window.addEventListener('popstate', onChange)
  window.addEventListener('pushstate', onChange)
  window.addEventListener('replacestate', onChange)
  window.addEventListener('hashchange', onChange)
  window.addEventListener('load', onChange)
  window.addEventListener('beforeunload', onChange)
  window.addEventListener('unload', onChange)
  window.addEventListener('pageshow', onChange)
  window.addEventListener('pagehide', onChange)
  window.addEventListener('visibilitychange', onChange)
  window.addEventListener('focus', onChange)
  window.addEventListener('blur', onChange)

  return {
    async push(name: string, value: string) {
      logger.debug(`push ${name}=${value}`)
      try {
        const url = new URL(window.location.href)
        url.searchParams.set(name, value)
        window.history.pushState(null, '', url.toString())
        window.dispatchEvent(new Event('popstate'))
        await new Promise((resolve) => setTimeout(resolve, 1))
        onChange()
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
        await new Promise((resolve) => setTimeout(resolve, 1))
        onChange()
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
        await new Promise((resolve) => setTimeout(resolve, 1))
        onChange()
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
      const sub = Sub.create<string | null>()
      subsByName[name] = sub
      return sub
    },
    async clear() {
      try {
        window.history.replaceState(null, '', '/')
        await new Promise((resolve) => setTimeout(resolve, 1))
        onChange()
        return Ok(null)
      } catch (e) {
        logger.error(e)
        return Err(String(e))
      }
    },
  }
}
