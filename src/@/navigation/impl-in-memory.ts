import { ILogger } from '../logger'
import { Ok } from '../result'
import { PubSub, Sub } from '../sub'
import { INavigation } from './interface'

export type Config = {
  t: 'in-memory'
  logger: ILogger
}

export const Navigation = (config: Config): INavigation => {
  const logger = config.logger.child(['navigation'])
  let history: { name: string; value: string }[] = []
  const subsByName: Record<string, PubSub<string>> = {}

  const get = (name: string) => {
    return history.find((h) => h.name === name)?.value ?? null
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
      history.push({ name, value })
      onChange(name)
      return Ok(null)
    },
    async replace(name: string, value: string) {
      logger.debug(`replace ${name}=${value}`)
      if (history.length > 0) {
        history[history.length - 1] = { name, value }
      } else {
        history.push({ name, value })
      }
      onChange(name)
      return Ok(null)
    },
    async back() {
      logger.debug('back')
      if (history.length > 0) {
        history.pop()
      }
      onChange(history[history.length - 1]?.name ?? '')
      return Ok(null)
    },
    get(name: string) {
      logger.debug(`get ${name}`)
      return get(name)
    },
    sub(name: string) {
      const existing = subsByName[name]
      if (existing) return existing
      const sub = Sub.create<string>()
      subsByName[name] = sub
      onChange(name)
      return sub
    },
    async clear() {
      history = []
      return Ok(null)
    },
  }
}
