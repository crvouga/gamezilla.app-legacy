import { IKeyValueDb } from '../key-value-db'
import { ILogger } from '../logger'
import { Ok, unwrapOr } from '../result'
import { s } from '../schema'
import { PubSub, Sub } from '../sub'
import { INavigation } from './interface'

export type NavigationImplKeyValueDb = {
  t: 'key-value-db'
  keyValueDb: IKeyValueDb
  logger: ILogger
  key: string
  maxHistoryLength: number
}

const HistoryItem = s.obj({
  name: s.str(),
  value: s.str(),
})
type HistoryItem = s.Infer<typeof HistoryItem>

const init = (config: NavigationImplKeyValueDb): INavigation => {
  const logger = config.logger.child(['navigation'])

  // Cache history in memory
  let historyCache: HistoryItem[] = []

  const getHistory = async (): Promise<HistoryItem[]> => {
    const result = await config.keyValueDb.get(config.key, s.arr(HistoryItem))
    const history = unwrapOr(result, []) ?? []
    const trimmed = history.slice(-config.maxHistoryLength)
    historyCache = trimmed // Update cache
    return trimmed
  }

  getHistory() // Initialize cache

  const persistHistory = async (history: HistoryItem[]) => {
    const trimmedHistory = history.slice(-config.maxHistoryLength)
    // Persist in background
    config.keyValueDb.set(config.key, trimmedHistory).catch((err) => {
      logger.error('Failed to persist history', err)
    })
  }

  const subsByName: Record<string, PubSub<string | null>> = {}

  const getSync = (name: string) => {
    return historyCache.findLast((h) => h.name === name)?.value ?? null
  }

  const onChange = () => {
    for (const name in subsByName) {
      const sub = subsByName[name]
      if (!sub) return
      const value = getSync(name)
      sub.pub(value)
    }
  }

  return {
    async push(name: string, value: string) {
      logger.debug(`push ${name}=${value}`)
      historyCache.push({ name, value })
      historyCache = historyCache.slice(-config.maxHistoryLength)
      persistHistory(historyCache)
      onChange()
      return Ok(null)
    },
    async replace(name: string, value: string) {
      logger.debug(`replace ${name}=${value}`)
      if (historyCache.length > 0) {
        historyCache[historyCache.length - 1] = { name, value }
      } else {
        historyCache.push({ name, value })
      }
      persistHistory(historyCache)
      onChange()
      return Ok(null)
    },
    async back() {
      logger.debug('back')
      if (historyCache.length > 0) {
        historyCache.pop()
      }
      persistHistory(historyCache)
      onChange()
      return Ok(null)
    },
    get(name: string) {
      logger.debug(`get ${name}`)
      return getSync(name)
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
      historyCache = []
      persistHistory(historyCache)
      onChange()
      return Ok(null)
    },
  }
}

export const NavigationImplKeyValueDb = {
  init,
}
