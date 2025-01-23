import { Ok } from '~/@/result'
import { IRuntime } from '~/@/runtime'
import { Logger } from '../logger'
import type { ILogger } from '../logger/interface'
import type { IKeyValueDb } from './interface'
import { TimeSpan } from '../time/time-span'

export type Config = {
  t: 'with-throttled-writes'
  keyValueDb: IKeyValueDb
  throttle: TimeSpan
  logger: ILogger
  runtime: IRuntime
}

export const withThrottledWrites = ({ keyValueDb, throttle, runtime, ...config }: Config): IKeyValueDb => {
  const logger = Logger.prefix('with-throttled-writes', config.logger)
  const throttleMs = TimeSpan.toMilliseconds(throttle)
  const timeouts = new Map<string, ReturnType<typeof setTimeout>>()
  const lastValues = new Map<string, unknown>()

  const scheduleSet = (key: string, value: unknown) => {
    if (!timeouts.has(key)) {
      timeouts.set(
        key,
        setTimeout(() => {
          const valueToSet = lastValues.get(key)
          keyValueDb.set(key, valueToSet)
          timeouts.delete(key)
          lastValues.delete(key)
        }, throttleMs),
      )
    }
    lastValues.set(key, value)
  }

  const scheduleSetMany = (entries: [string, unknown][]) => {
    const key = entries.map((entry) => entry[0]).join(',')
    if (!timeouts.has(key)) {
      timeouts.set(
        key,
        setTimeout(() => {
          const entriesToSet = lastValues.get(key)
          keyValueDb.setMany(entriesToSet as [string, unknown][])
          timeouts.delete(key)
          lastValues.delete(key)
        }, throttleMs),
      )
    }

    lastValues.set(key, entries)
  }

  const flush = async () => {
    logger.debug('Flushing throttled writes')
    for (const [key, timeout] of timeouts.entries()) {
      clearTimeout(timeout)
      const valueToSet = lastValues.get(key)
      if (valueToSet && Array.isArray(valueToSet) && Array.isArray(valueToSet[0])) {
        await keyValueDb.setMany(valueToSet)
      } else {
        await keyValueDb.set(key, valueToSet)
      }
      timeouts.delete(key)
      lastValues.delete(key)
    }
    logger.debug('Flushed throttled writes')
  }

  runtime.events.sub(async (event) => {
    switch (event.t) {
      case 'stopping': {
        flush()
        break
      }
    }
  })

  return {
    ...keyValueDb,
    async set(key, value) {
      scheduleSet(key, value)
      return Ok(null)
    },
    async setMany(entries) {
      scheduleSetMany(entries)
      return Ok(null)
    },
  }
}
