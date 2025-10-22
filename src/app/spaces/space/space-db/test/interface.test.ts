import { withEventId } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { unwrap } from '~/@/result'
import { describe, expect, test } from '~/@/test-runner'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '../../space'
import { Fixtures } from './fixture'

describe('SpaceDb', () => {
  test('should work', async () => {
    for (const f of await Fixtures()) {
      const spaceId = Space.toSpaceStarted(f.space)?.spaceId ?? SpaceId.generate()

      const before = await f.spacesDb.query({ where: { op: '=', column: 'id', value: spaceId } })

      unwrap(await f.spacesDb.upsert({ entities: [f.space] }))

      const after = await f.spacesDb.query({ where: { op: '=', column: 'id', value: spaceId } })

      expect(unwrap(before).entities.items).toEqual([])
      expect(unwrap(after).entities.items).toEqual([f.space])
    }
  })

  test("multiple spaces don't collide", async () => {
    for (const f1 of await Fixtures()) {
      for (const f2 of await Fixtures()) {
        unwrap(await f1.spacesDb.upsert({ entities: [f1.space] }))
        unwrap(await f2.spacesDb.upsert({ entities: [f2.space] }))
        const after1 = unwrap(await f1.spacesDb.query({ where: { op: '=', column: 'id', value: f1.spaceId } }))
        const after2 = unwrap(await f2.spacesDb.query({ where: { op: '=', column: 'id', value: f2.spaceId } }))
        expect(after1.entities.items).toEqual([f1.space])
        expect(after2.entities.items).toEqual([f2.space])
      }
    }
  })

  test('upsert updates existing records', async () => {
    for (const f of await Fixtures()) {
      unwrap(await f.spacesDb.upsert({ entities: [f.space] }))
      const before = unwrap(await f.spacesDb.query({ where: { op: '=', column: 'id', value: f.spaceId } }))

      const modifiedSpace = pipe(f.space, (model) =>
        Space.append(
          model,
          withEventId({ t: 'userJoinedSpace', spaceId: f.spaceId, userId: UserId.generate() } as const),
        ),
      )

      unwrap(await f.spacesDb.upsert({ entities: [modifiedSpace] }))
      const after = unwrap(await f.spacesDb.query({ where: { op: '=', column: 'id', value: f.spaceId } }))

      expect((before.entities.items[0]?.events.length ?? 0) < (after.entities.items[0]?.events.length ?? 0)).toEqual(
        true,
      )
      expect(after.entities.items).toEqual([modifiedSpace])
    }
  })
})
