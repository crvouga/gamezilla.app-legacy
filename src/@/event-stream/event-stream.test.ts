import { describe, expect, it } from 'bun:test'
import { EventStreamInMemory } from '.'
import { UnixMs } from '../time/posix'

//
//
//
//
//

type EventId = string

type EventMeta = {
  happenedAt: UnixMs
  eventId: EventId
}

const withId = <T>(eventNew: T): T & EventMeta => {
  return {
    ...eventNew,
    happenedAt: UnixMs.now(),
    eventId: Math.random().toString(),
  }
}

type Event =
  | {
      t: 'incremented'
      userId: string
      counterId: string
    }
  | {
      t: 'decremented'
      userId: string
      counterId: string
    }

type Indexes = 'byUserId' | 'byCounterId'

const withMetaAt = (event: Event, happenedAt: UnixMs): Event & EventMeta => {
  return {
    ...withId<Event>(event),
    happenedAt,
  }
}

//
//
//
//
//
//

const EventStream = EventStreamInMemory<EventId, Event & EventMeta, Indexes>()

const config = EventStream.config({
  indexes: {
    byUserId: (event) => event.userId,
    byCounterId: (event) => event.counterId,
  },
  toId: (event) => event.eventId,
  toOrdering: (event) => event.happenedAt,
})

describe(import.meta.file, async () => {
  it('should be able to append events', async () => {
    const before = await EventStream.init(config)
    const event = withId<Event>({
      t: 'incremented',
      userId: '1',
      counterId: '1',
    })
    const after = await EventStream.append(config, before, event)

    expect(await EventStream.toArray(before)).toEqual([])
    expect(await EventStream.toArray(after)).toEqual([event])
  })

  it('should be able to append events', async () => {
    const event1 = withId<Event>({
      t: 'incremented',
      userId: '1',
      counterId: '1',
    })
    const event2 = withId<Event>({
      t: 'incremented',
      userId: '1',
      counterId: '2',
    })
    const event3 = withId<Event>({
      t: 'incremented',
      userId: '1',
      counterId: '3',
    })
    const before = await EventStream.fromArray(config, [event1, event2])

    const after = await EventStream.append(config, before, event3)

    expect(await EventStream.toArray(before)).toEqual([event1, event2])

    expect(await EventStream.toArray(after)).toEqual([event1, event2, event3])
  })

  it('should be able get subsets', async () => {
    const user_a_count_a = withId<Event>({
      t: 'incremented',
      userId: 'userA',
      counterId: 'counterA',
    })

    const user_a_count_b = withId<Event>({
      t: 'incremented',
      userId: 'userA',
      counterId: 'counterB',
    })

    const user_b_count_a = withId<Event>({
      t: 'incremented',
      userId: 'userB',
      counterId: 'counterB',
    })

    const stream = await EventStream.fromArray(config, [user_a_count_a, user_a_count_b, user_b_count_a])

    const userA = await EventStream.subset(config, stream, 'byUserId', 'userA')
    const userB = await EventStream.subset(config, stream, 'byUserId', 'userB')
    const counterA = await EventStream.subset(config, stream, 'byCounterId', 'counterA')
    const counterB = await EventStream.subset(config, stream, 'byCounterId', 'counterB')

    expect(await EventStream.toArray(userA)).toEqual([user_a_count_a, user_a_count_b])
    expect(await EventStream.toArray(userB)).toEqual([user_b_count_a])
    expect(await EventStream.toArray(counterA)).toEqual([user_a_count_a])
    expect(await EventStream.toArray(counterB)).toEqual([user_a_count_b, user_b_count_a])
  })

  it('should be able to merge', async () => {
    const t0 = UnixMs.now()

    const event1 = withMetaAt(
      {
        t: 'incremented',
        userId: '1',
        counterId: '1',
      },
      t0,
    )

    const event2 = withMetaAt(
      {
        t: 'incremented',
        userId: '1',
        counterId: '2',
      },
      UnixMs.init(t0 + 1000),
    )

    const event3 = withMetaAt(
      {
        t: 'incremented',
        userId: '1',
        counterId: '3',
      },
      UnixMs.init(t0 + 2000),
    )

    const streamA = await EventStream.fromArray(config, [event1, event3])
    const streamB = await EventStream.fromArray(config, [event2])
    const actual = await EventStream.mergeLeft(config, streamA, streamB)
    const expected = await EventStream.fromArray(config, [event1, event2, event3])

    expect(await EventStream.toArray(actual)).toEqual(await EventStream.toArray(expected))
  })
})
