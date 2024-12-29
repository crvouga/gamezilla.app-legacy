import { Task } from '~/@/core'
import { EventId } from './event-id'

export type IStream<TValue> = {
  append: (streamId: string, eventId: EventId, event: TValue) => Task<string, null>
  startingFrom: (streamId: string, eventId: EventId) => Task<string, TValue[]>
  has: (streamId: string, eventId: EventId) => Task<string, boolean>
}
