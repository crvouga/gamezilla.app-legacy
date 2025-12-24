import { withEventId } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { unwrap } from '~/@/result'
import { describe, expect, test } from '~/@/test-runner'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { UnixMs } from '~/@/time/unix-ms'
import { Space } from '../../space'
import { SpaceEntity } from '../space-entity'
import { Fixtures } from './fixture'

describe('SpaceDb', () => {
  test('should work', async () => {
    for (const f of await Fixtures()) {
      const spaceId = Space.toSpaceStarted(f.space)?.spaceId ?? SpaceId.generate()

      const before = await f.spacesDb.query({ where: { op: '=', column: 'id', value: spaceId } })

      const spaceEntity: SpaceEntity = {
        id: f.spaceId,
        createdAt: UnixMs.now(),
        updatedAt: UnixMs.now(),
        deletedAt: null,
        space: f.space,
      }
      unwrap(await f.spacesDb.upsert({ entities: [spaceEntity] }))

      const after = await f.spacesDb.query({ where: { op: '=', column: 'id', value: spaceId } })

      expect(unwrap(before).entities.items).toEqual([])
      expect(unwrap(after).entities.items.map((e) => e.space)).toEqual([f.space])
    }
  })

  test("multiple spaces don't collide", async () => {
    for (const f1 of await Fixtures()) {
      for (const f2 of await Fixtures()) {
        const entity1: SpaceEntity = {
          id: f1.spaceId,
          createdAt: UnixMs.now(),
          updatedAt: UnixMs.now(),
          deletedAt: null,
          space: f1.space,
        }
        const entity2: SpaceEntity = {
          id: f2.spaceId,
          createdAt: UnixMs.now(),
          updatedAt: UnixMs.now(),
          deletedAt: null,
          space: f2.space,
        }
        unwrap(await f1.spacesDb.upsert({ entities: [entity1] }))
        unwrap(await f2.spacesDb.upsert({ entities: [entity2] }))
        const after1 = unwrap(await f1.spacesDb.query({ where: { op: '=', column: 'id', value: f1.spaceId } }))
        const after2 = unwrap(await f2.spacesDb.query({ where: { op: '=', column: 'id', value: f2.spaceId } }))
        expect(after1.entities.items.map((e) => e.space)).toEqual([f1.space])
        expect(after2.entities.items.map((e) => e.space)).toEqual([f2.space])
      }
    }
  })

  test('upsert updates existing records', async () => {
    for (const f of await Fixtures()) {
      const entity: SpaceEntity = {
        id: f.spaceId,
        createdAt: UnixMs.now(),
        updatedAt: UnixMs.now(),
        deletedAt: null,
        space: f.space,
      }
      unwrap(await f.spacesDb.upsert({ entities: [entity] }))
      const before = unwrap(await f.spacesDb.query({ where: { op: '=', column: 'id', value: f.spaceId } }))

      const modifiedSpace = pipe(f.space, (model) =>
        Space.append(
          model,
          withEventId({ t: 'userJoinedSpace', spaceId: f.spaceId, userId: UserId.generate() } as const),
        ),
      )

      const modifiedEntity: SpaceEntity = {
        id: f.spaceId,
        createdAt: UnixMs.now(),
        updatedAt: UnixMs.now(),
        deletedAt: null,
        space: modifiedSpace,
      }
      unwrap(await f.spacesDb.upsert({ entities: [modifiedEntity] }))
      const after = unwrap(await f.spacesDb.query({ where: { op: '=', column: 'id', value: f.spaceId } }))

      expect(
        (before.entities.items[0]?.space.events.length ?? 0) < (after.entities.items[0]?.space.events.length ?? 0),
      ).toEqual(true)
      expect(after.entities.items.map((e) => e.space)).toEqual([modifiedSpace])
    }
  })
})
