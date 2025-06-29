import { describe, expect, test } from '~/@/test-runner'
import { withEventId } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { unwrap } from '~/@/result'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '../..'
import { Fixtures } from './fixture'

describe('SpaceDb', () => {
  test('should work', async () => {
    for (const f of await Fixtures()) {
      const spaceId = Space.toSpaceStarted(f.space)?.spaceId ?? SpaceId.generate()

      const before = await f.spacesDb.query({ where: { spaceId: { '=': spaceId } } })

      unwrap(await f.spacesDb.upsert(f.space))

      const after = await f.spacesDb.query({ where: { spaceId: { '=': spaceId } } })

      expect(unwrap(before).items).toEqual([])
      expect(unwrap(after).items).toEqual([f.space])
    }
  })

  test("multiple spaces don't collide", async () => {
    for (const f1 of await Fixtures()) {
      for (const f2 of await Fixtures()) {
        unwrap(await f1.spacesDb.upsert(f1.space))
        unwrap(await f2.spacesDb.upsert(f2.space))
        const after1 = unwrap(await f1.spacesDb.query({ where: { spaceId: { '=': f1.spaceId } } }))
        const after2 = unwrap(await f2.spacesDb.query({ where: { spaceId: { '=': f2.spaceId } } }))
        expect(after1.items).toEqual([f1.space])
        expect(after2.items).toEqual([f2.space])
      }
    }
  })

  test('upsert updates existing records', async () => {
    for (const f of await Fixtures()) {
      unwrap(await f.spacesDb.upsert(f.space))
      const before = unwrap(await f.spacesDb.query({ where: { spaceId: { '=': f.spaceId } } }))

      const modifiedSpace = pipe(f.space, (model) =>
        Space.append(
          model,
          withEventId({ t: 'user-joined-space', spaceId: f.spaceId, userId: UserId.generate() } as const),
        ),
      )

      unwrap(await f.spacesDb.upsert(modifiedSpace))
      const after = unwrap(await f.spacesDb.query({ where: { spaceId: { '=': f.spaceId } } }))

      expect((before.items[0]?.events.length ?? 0) < (after.items[0]?.events.length ?? 0)).toEqual(true)
      expect(after.items).toEqual([modifiedSpace])
    }
  })
})
