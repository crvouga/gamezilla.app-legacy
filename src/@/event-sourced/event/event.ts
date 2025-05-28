import { LamportTimestamp } from '~/@/lamport-clock/lamport-timestamp'
import { EventId } from './event-id'
import { s } from '~/@/schema'

export const EventMeta = s.obj({
  happenedAt: LamportTimestamp,
  eventId: EventId,
})

export type EventMeta = s.Infer<typeof EventMeta>

export type WithEventId<T> = T & {
  eventId: EventId
  happenedAt?: LamportTimestamp | null | undefined
}

export type WithEventMeta<T> = T & EventMeta

export const WithEventMeta = <T>(schema: s.Parser<T>) => {
  return s.and(schema, EventMeta)
}

export const withEventMeta = <T>(event: T): WithEventMeta<T> => {
  return {
    ...event,
    happenedAt: LamportTimestamp.fromNumber(0),
    eventId: EventId.generate(),
  }
}

export const withEventMetaAt = <T>(happenedAt: number, event: T): WithEventMeta<T> => {
  return {
    ...event,
    happenedAt: LamportTimestamp.fromNumber(happenedAt),
    eventId: EventId.generate(),
  }
}

export const withEventId = <T>(event: T): WithEventId<T> => {
  return {
    ...event,
    eventId: EventId.generate(),
  }
}
