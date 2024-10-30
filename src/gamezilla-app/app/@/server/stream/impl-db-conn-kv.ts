import { Err, Ok, unwrapOr } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { Parser } from 'gamezilla-app/@/core/parser/parser'
import { DbConnKv, IDbConnKv } from '../db-conn-kv'
import { EventId } from './event-id'
import { IStream } from './interface'

export type Config<T> = {
  t: 'db-conn-kv'
  dbConnKv: IDbConnKv
  parser: Parser<T>
}

export const Stream = <T>(config: Config<T>): IStream<T> => {
  const eventIdsByStreamId = DbConnKv.withNamespace({
    dbConnKv: config.dbConnKv,
    namespace: ['stream', 'event-ids-by-stream-id'],
    parser: p.arr(EventId.parser)
  })
  const eventsById = DbConnKv.withNamespace({
    dbConnKv: config.dbConnKv,
    namespace: ['stream', 'events-by-id'],
    parser: p.arr(config.parser)
  })
  return {
    async append(streamId, eventId, event) {
      const eventIds = unwrapOr(await eventIdsByStreamId.get(streamId), null) ?? []
      for (const existingEventId of eventIds) {
        if (existingEventId === eventId) {
          return Err('EventId already exists')
        }
      }
      const eventIdsNew = [...eventIds, eventId]
      await eventIdsByStreamId.set(streamId, eventIdsNew)
      const events = unwrapOr(await eventsById.get(eventId), null) ?? []
      await eventsById.set(eventId, [...events, event])
      return Ok(null)
    },
    async startingFrom(streamId, eventId) {
      const eventIds = unwrapOr(await eventIdsByStreamId.get(streamId), null) ?? []

      const index = eventId ? eventIds.indexOf(eventId) : -1
      const sliced = index === -1 ? eventIds : eventIds.slice(index)
      const slicedEvents = unwrapOr(await eventsById.getMany(sliced), []).flat()
      return Ok(slicedEvents)
    },
    async has(streamId, eventId) {
      const eventIds = unwrapOr(await eventIdsByStreamId.get(streamId), null) ?? []
      return Ok(eventIds.includes(eventId))
    }
  }
}
