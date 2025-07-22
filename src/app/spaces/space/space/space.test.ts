import { withEventId } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { describe, expect, test } from '~/@/test-runner'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from './space'

describe('Space', () => {
  test('staring space', () => {
    const spaceId = SpaceId.generate()
    const hostId = UserId.generate()
    const before = Space.init
    const after = pipe(before, (m) =>
      Space.append(m, withEventId({ t: 'user-started-space', spaceId, userId: hostId })),
    )
    const beforeProjection = Space.toSpaceProjection(before)
    const afterProjection = Space.toSpaceProjection(after)
    expect(beforeProjection.type).toEqual('initial')
    expect(afterProjection.type).toEqual('started')
    if (afterProjection.type === 'started') {
      expect(afterProjection.spaceId).toEqual(spaceId)
      expect(afterProjection.hostId).toEqual(hostId)
      expect(afterProjection.users).toEqual({ [hostId]: hostId })
    }
  })

  test('joining space', () => {
    const spaceId = SpaceId.generate()
    const hostId = UserId.generate()
    const guestId = UserId.generate()
    const before = Space.init
    const after = pipe(
      before,
      (m) => Space.append(m, withEventId({ t: 'user-started-space', spaceId, userId: hostId })),
      (m) => Space.append(m, withEventId({ t: 'user-joined-space', spaceId, userId: guestId })),
    )
    const beforeProjection = Space.toSpaceProjection(before)
    const afterProjection = Space.toSpaceProjection(after)
    expect(beforeProjection.type).toEqual('initial')
    expect(afterProjection.type).toEqual('started')
    if (afterProjection.type === 'started') {
      expect(afterProjection.spaceId).toEqual(spaceId)
      expect(afterProjection.hostId).toEqual(hostId)
      expect(afterProjection.users).toEqual({ [hostId]: hostId, [guestId]: guestId })
    }
  })

  test('leaving space', () => {
    const spaceId = SpaceId.generate()
    const hostId = UserId.generate()
    const guestId = UserId.generate()
    const before = Space.init
    const after = pipe(
      before,
      (m) => Space.append(m, withEventId({ t: 'user-started-space', spaceId, userId: hostId })),
      (m) => Space.append(m, withEventId({ t: 'user-joined-space', spaceId, userId: guestId })),
      (m) => Space.append(m, withEventId({ t: 'user-left-space', spaceId, userId: guestId })),
    )
    const beforeProjection = Space.toSpaceProjection(before)
    const afterProjection = Space.toSpaceProjection(after)
    expect(beforeProjection.type).toEqual('initial')
    expect(afterProjection.type).toEqual('started')
    if (afterProjection.type === 'started') {
      expect(afterProjection.spaceId).toEqual(spaceId)
      expect(afterProjection.hostId).toEqual(hostId)
      expect(afterProjection.users).toEqual({ [hostId]: hostId })
    }
  })
})
