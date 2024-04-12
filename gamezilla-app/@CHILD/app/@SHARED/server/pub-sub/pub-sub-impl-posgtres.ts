import { PubSub } from "gamezilla-app/@SHARED/core"
import { IDbConnSql } from "../db-conn-sql"
import { p } from "gamezilla-app/@SHARED/core/parser"
import { Logger } from "../logger"

export const PubSubPostgres = <T>({
  dbConnSql,
  channel,
  logger,
  encode,
  decode,
}: {
  dbConnSql: IDbConnSql
  logger: Logger
  channel: string
  encode: (msg: T) => string
  decode: (msg: string | null) => T
}): PubSub<T> => {
  let runningSubscriberId = 0

  const subscribers = new Map<number, (msg: T) => void>()

  const instanceId = Math.random().toString(36).substring(2)
  const SEPERATOR = "|||"

  dbConnSql.query(p.unknown, `LISTEN ${channel}`, {})

  dbConnSql.onNotification((notification) => {
    if (notification.channel !== channel) {
      return
    }

    if (notification.payload === undefined) {
      return
    }

    const [payloadInstanceId, payload] = notification.payload.split(SEPERATOR)

    logger.info(
      `[pubsub] recieved notification channel=${channel} instanceId=${instanceId} payload=${payload?.slice(
        0,
        200,
      )}`,
    )

    if (payloadInstanceId === instanceId) {
      logger.info(
        `[pubsub] skipping self notification channel=${channel} instanceId=${instanceId} payload=${payload?.slice(
          0,
          200,
        )}`,
      )
      return
    }

    const msg = decode(payload ?? null)

    for (const subscriber of subscribers.values()) {
      subscriber(msg)
    }
  })

  return {
    publish(msg) {
      const payload = encode(msg)
      dbConnSql.query(
        p.unknown,
        `NOTIFY ${channel}, '${instanceId}${SEPERATOR}${payload}'`,
        {},
      )
    },

    isSubscribed() {
      return subscribers.size > 0
    },

    subscribe(subscriber) {
      const subscriberId = runningSubscriberId + 1

      subscribers.set(subscriberId, subscriber)

      return () => {
        subscribers.delete(subscriberId)
      }
    },
  }
}
