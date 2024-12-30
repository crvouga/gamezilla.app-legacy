import { LamportTimestamp } from '~/@/lamport-clock/lamport-timestamp'
import { EventId } from './event-id'
import { p } from '~/@/parser'

export const EventMeta = p.obj({
  happenedAt: LamportTimestamp,
  eventId: EventId
})

export type EventMeta = p.Infer<typeof EventMeta>

export type WithEventId<T> = T & {
  eventId: EventId
  happenedAt?: LamportTimestamp | null | undefined
}

export type WithEventMeta<T> = T & EventMeta

export const WithEventMeta = <T>(parser: p.Parser<T>) => {
  return p.and(parser, EventMeta)
}

export const withEventMeta = <T>(event: T): WithEventMeta<T> => {
  return {
    ...event,
    happenedAt: LamportTimestamp.fromNumber(0),
    eventId: EventId.generate()
  }
}

export const withEventId = <T>(event: T): WithEventId<T> => {
  return {
    ...event,
    eventId: EventId.generate()
  }
}
