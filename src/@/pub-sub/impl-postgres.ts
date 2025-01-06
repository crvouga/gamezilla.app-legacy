import { p } from '~/@/parser'
import type { IDbConnSql } from '../db-conn-sql'
import type { ILogger } from '../logger/interface'
import { IPubSub } from './interface'

export type Config = {
  t: 'postgres'
  dbConnSql: IDbConnSql
  logger: ILogger
  channel: string
}

export const PubSub = (config: Config): IPubSub => {
  const runningSubscriberId = 0

  const subscribers = new Map<number, (msg: string) => void>()

  const instanceId = Math.random().toString(36).substring(2)
  const SEPARATOR = '___'

  config.dbConnSql.query(p.unknown, `LISTEN ${config.channel}`, {})

  config.dbConnSql.listen(config.channel, (notification) => {
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

    config.logger.info(
      `received notification channel=${config.channel} instanceId=${instanceId} payload=${payload?.slice(0, 100)}`,
    )

    for (const subscriber of subscribers.values()) {
      subscriber(notification.payload ?? '')
    }
  })

  return {
    async pub(msg) {
      config.dbConnSql.query(p.unknown, `NOTIFY ${config.channel}, '${instanceId}${SEPARATOR}${msg}'`, {})
    },

    async sub(subscriber) {
      const subscriberId = runningSubscriberId + 1

      subscribers.set(subscriberId, subscriber)

      return async () => {
        subscribers.delete(subscriberId)
      }
    },
  }
}
