import { describe, expect, test } from 'bun:test'
import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { sleep } from '~/@/promise/sleep'
import { unwrap } from '~/@/result'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { Space, SpaceProjection } from '../..'
import { SpaceDbOutputMsg } from '../interface'
import { Fixtures } from './fixture'

describe('SpaceDb - invalid data', () => {
  test('error when db has invalid data', async () => {
    for (const f of await Fixtures()) {
      unwrap(await f.spacesDb.upsert(f.space))
      const before = await f.spacesDb.query({ where: { spaceId: { '=': f.spaceId } } })
      const invalid = toInvalidSpaceModel(f.space)
      const p = Sub.take(
        Sub.where(f.spacesDb.output, (m): m is SpaceDbOutputMsg => m.t === 'model-dangerously-overridden'),
      )
      await f.spacesDb.input.pub({ t: 'dangerously-override-model', model: invalid })
      await p
      await sleep(TimeSpan.milliseconds(100))
      const after = await f.spacesDb.query({ where: { spaceId: { '=': f.spaceId } } })
      expect(unwrap(before).items).toEqual([f.space])
      expect(unwrap(after).items).toEqual([])
    }
  })
})

const toInvalidSpaceModel = (space: Space.Model) => {
  const latestEventId = space.snapshots._orderNewestFirst[0]

  if (!latestEventId) throw new Error('latestEventId not found')

  const latestSnapshot = space.snapshots._valuesByKey[latestEventId]

  if (!latestSnapshot) throw new Error('latestSnapshot not found')

  const invalidSnapshot: Partial<SpaceProjection.Started> = {
    game: undefined,
    hostId: undefined,
    latestEventId: undefined,
    spaceId: 'spaceId' in latestSnapshot ? latestSnapshot.spaceId : undefined,
    type: 'started',
    users: {},
    visibility: undefined,
  }

  const corrupted: Space.Model = {
    ...space,
    snapshots: CappedOrderedDict.add(
      space.snapshots,
      latestEventId,
      // @ts-expect-error We are intentionally corrupting the snapshot
      invalidSnapshot,
    ),
  }

  return corrupted
}
