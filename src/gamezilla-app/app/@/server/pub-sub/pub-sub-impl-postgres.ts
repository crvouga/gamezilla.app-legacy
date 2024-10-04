import type { PubSub as IPubSub } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import type { IDbConnSql } from '../db-conn-sql'
import type { ILogger } from '../logger/interface'

export type Config<T> = {
  t: 'postgres'
  dbConnSql: IDbConnSql
  logger: ILogger
  channel: string
  encode: (msg: T) => string
  decode: (msg: string | null) => T
}

export const PubSub = <T>({ dbConnSql, channel, logger, encode, decode }: Config<T>): IPubSub<T> => {
  const runningSubscriberId = 0

  const subscribers = new Map<number, (msg: T) => void>()

  const instanceId = Math.random().toString(36).substring(2)
  const SEPARATOR = '___'

  dbConnSql.query(p.unknown, `LISTEN ${channel}`, {})

  dbConnSql.listen(channel, (notification) => {
    if (notification.payload === undefined) {
      return
    }

    const [payloadInstanceId, payload] = notification.payload.split(SEPARATOR)

    if (payloadInstanceId === instanceId) {
      return
    }

    if (!payload) {
      return
    }

    logger.info(`received notification channel=${channel} instanceId=${instanceId} payload=${payload?.slice(0, 100)}`)

    const msg = decode(payload ?? null)

    for (const subscriber of subscribers.values()) {
      subscriber(msg)
    }
  })

  return {
    once(_subscriber) {
      throw new Error('Method not implemented.')
    },
    pub(msg) {
      const payload = encode(msg)
      dbConnSql.query(p.unknown, `NOTIFY ${channel}, '${instanceId}${SEPARATOR}${payload}'`, {})
    },

    isSubbed() {
      return subscribers.size > 0
    },

    sub(subscriber) {
      const subscriberId = runningSubscriberId + 1

      subscribers.set(subscriberId, subscriber)

      return () => {
        subscribers.delete(subscriberId)
      }
    }
  }
}
