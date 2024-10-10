import { Ok, Result } from 'gamezilla-app/@/core'
import { Parser } from 'gamezilla-app/@/core/parser/parser'
import { DbConnKv, IDbConnKv } from '../db-conn-kv'
import { IStream } from './inteface'
import { p } from 'gamezilla-app/@/core/parser'

export type Config<T> = {
  t: 'db-conn-kv'
  dbConnKv: IDbConnKv
  parser: Parser<T>
}

export const Stream = <T>(config: Config<T>): IStream<T> => {
  const eventsByStreamId = DbConnKv.withNamespace(
    config.dbConnKv,
    ['stream', 'events-by-stream-id'],
    p.arr(config.parser)
  )
  return {
    async append(streamId, event) {
      const events = Result.unwrapOr(await eventsByStreamId.get(streamId), null) ?? []
      const eventsNew = [...events, event]
      await eventsByStreamId.set(streamId, eventsNew)
      return Ok(null)
    },
    async startingFrom(streamId, fromId) {
      const events = Result.unwrapOr(await eventsByStreamId.get(streamId), null) ?? []
      const fromIndex = fromId ? events.findIndex((e) => e === fromId) : 0
      const sliced = events.slice(fromIndex)
      return Ok(sliced)
    }
  }
}
