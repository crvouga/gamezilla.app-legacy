import { Ok, Result } from 'gamezilla-app/@/core'
import { Parser } from 'gamezilla-app/@/core/parser/parser'
import { DbConnKv, IDbConnKv } from '../db-conn-kv'
import { IStream } from './interface'
import { p } from 'gamezilla-app/@/core/parser'
import { EventId } from './event-id'

export type Config<T> = {
  t: 'db-conn-kv'
  dbConnKv: IDbConnKv
  parser: Parser<T>
}

export const Stream = <T>(config: Config<T>): IStream<T> => {
  const eventIdsByStreamId = DbConnKv.withNamespace(
    config.dbConnKv,
    ['stream', 'event-ids-by-stream-id'],
    p.arr(EventId.parser)
  )
  const eventsById = DbConnKv.withNamespace(config.dbConnKv, ['stream', 'events-by-id'], p.arr(config.parser))
  return {
    async append(streamId, eventId, event) {
      const eventIds = Result.unwrapOr(await eventIdsByStreamId.get(streamId), null) ?? []
      const eventIdsNew = [...eventIds, eventId]
      await eventIdsByStreamId.set(streamId, eventIdsNew)
      const events = Result.unwrapOr(await eventsById.get(eventId), null) ?? []
      await eventsById.set(eventId, [...events, event])
      return Ok(null)
    },
    async startingFrom(streamId, eventId) {
      const eventIds = Result.unwrapOr(await eventIdsByStreamId.get(streamId), null) ?? []
      const index = eventId ? eventIds.indexOf(eventId) : -1
      const sliced = index === -1 ? eventIds : eventIds.slice(index)
      const slicedEvents = Result.unwrapOr(await eventsById.getMany(sliced), []).flat()
      return Ok(slicedEvents)
    }
  }
}
