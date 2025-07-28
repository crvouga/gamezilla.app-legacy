import { IKeyValueDbSync } from '../key-value-db-sync'
import { ILogger } from '../logger'
import { Ok, unwrapOr } from '../result'
import { s } from '../schema'
import { PubSub, Sub } from '../sub'
import { INavigation } from './interface'

export type NavigationImplKeyValueDbSync = {
  t: 'key-value-db-sync'
  keyValueDbSync: IKeyValueDbSync
  logger: ILogger
  key: string
  maxHistoryLength: number
}

const HistoryItem = s.obj({
  name: s.str(),
  value: s.str(),
})
type HistoryItem = s.Infer<typeof HistoryItem>

const init = (config: NavigationImplKeyValueDbSync): INavigation => {
  const logger = config.logger.child(['navigation'])

  const getHistory = (): HistoryItem[] => {
    const result = config.keyValueDbSync.get(config.key, s.arr(HistoryItem))
    const history = unwrapOr(result, []) ?? []
    return history.slice(-config.maxHistoryLength)
  }

  const setHistory = (history: HistoryItem[]) => {
    const trimmedHistory = history.slice(-config.maxHistoryLength)
    config.keyValueDbSync.set(config.key, trimmedHistory)
  }

  const subsByName: Record<string, PubSub<string | null>> = {}

  const get = (name: string) => {
    const history = getHistory()
    return history.findLast((h) => h.name === name)?.value ?? null
  }

  const onChange = () => {
    for (const name in subsByName) {
      const sub = subsByName[name]
      if (!sub) return
      const value = get(name)
      sub.pub(value)
    }
  }

  return {
    async push(name: string, value: string) {
      logger.debug(`push ${name}=${value}`)
      const history = getHistory()
      history.push({ name, value })
      setHistory(history)
      onChange()
      return Ok(null)
    },
    async replace(name: string, value: string) {
      logger.debug(`replace ${name}=${value}`)
      const history = getHistory()
      if (history.length > 0) {
        history[history.length - 1] = { name, value }
      } else {
        history.push({ name, value })
      }
      setHistory(history)
      onChange()
      return Ok(null)
    },
    async back() {
      logger.debug('back')
      const history = getHistory()
      if (history.length > 0) {
        history.pop()
      }
      setHistory(history)
      onChange()
      return Ok(null)
    },
    get(name: string) {
      logger.debug(`get ${name}`)
      return get(name)
    },
    sub(name: string) {
      const existing = subsByName[name]
      if (existing) return existing
      const sub = Sub.init<string | null>()
      subsByName[name] = sub
      onChange()
      return sub
    },
    async clear() {
      setHistory([])
      onChange()
      return Ok(null)
    },
  }
}

export const NavigationImplKeyValueDbSync = {
  init,
}
