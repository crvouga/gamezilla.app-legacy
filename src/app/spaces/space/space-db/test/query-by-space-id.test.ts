import { unwrap } from '~/@/result'
import { describe, expect, test } from '~/@/test-runner'
import { UnixMs } from '~/@/time/unix-ms'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '../../space'
import { SpaceEntity } from '../space-entity'
import { Fixtures } from './fixture'

describe('SpaceDb - query by space id', () => {
  test('query by space id', async () => {
    for (const f of await Fixtures()) {
      const randomSpace1 = Space.random({ spaceId: SpaceId.generate() })
      const randomSpace2 = Space.random({ spaceId: SpaceId.generate() })
      const randomSpace3 = Space.random({ spaceId: SpaceId.generate() })
      const spaceId1 = Space.toSpaceId(randomSpace1)
      const spaceId2 = Space.toSpaceId(randomSpace2)
      const spaceId3 = Space.toSpaceId(randomSpace3)
      
      if (spaceId1) {
        const entity1: SpaceEntity = {
          id: spaceId1,
          createdAt: UnixMs.now(),
          updatedAt: UnixMs.now(),
          deletedAt: null,
          space: randomSpace1,
        }
        unwrap(await f.spacesDb.upsert({ entities: [entity1] }))
      }
      if (spaceId2) {
        const entity2: SpaceEntity = {
          id: spaceId2,
          createdAt: UnixMs.now(),
          updatedAt: UnixMs.now(),
          deletedAt: null,
          space: randomSpace2,
        }
        unwrap(await f.spacesDb.upsert({ entities: [entity2] }))
      }
      if (spaceId3) {
        const entity3: SpaceEntity = {
          id: spaceId3,
          createdAt: UnixMs.now(),
          updatedAt: UnixMs.now(),
          deletedAt: null,
          space: randomSpace3,
        }
        unwrap(await f.spacesDb.upsert({ entities: [entity3] }))
      }

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

  test('list spaces', async () => {
    for (const f of await Fixtures()) {
      const before = unwrap(await f.spacesDb.query({ where: { op: '=', column: 'id', value: f.spaceId } }))

      const spaceEntity: SpaceEntity = {
        id: f.spaceId,
        createdAt: UnixMs.now(),
        updatedAt: UnixMs.now(),
        deletedAt: null,
        space: f.space,
      }
      unwrap(await f.spacesDb.upsert({ entities: [spaceEntity] }))

      const after = unwrap(await f.spacesDb.query({ where: { op: '=', column: 'id', value: f.spaceId } }))

      expect(before.entities.items).toEqual([])
      expect(after.entities.items.map((e) => e.space)).toEqual([f.space])
    }
  })

  test('get with fallback', async () => {
    for (const f of await Fixtures()) {
      const before = unwrap(await f.spacesDb.query({ where: { op: '=', column: 'id', value: f.spaceId } }))

      const spaceEntity: SpaceEntity = {
        id: f.spaceId,
        createdAt: UnixMs.now(),
        updatedAt: UnixMs.now(),
        deletedAt: null,
        space: f.space,
      }
      unwrap(await f.spacesDb.upsert({ entities: [spaceEntity] }))

      const after = unwrap(await f.spacesDb.query({ where: { op: '=', column: 'id', value: f.spaceId } }))
      expect(Space.toSpaceProjection(before.entities.items[0]?.space ?? Space.init)?.type).toEqual('initial')
      expect(Space.toSpaceProjection(after.entities.items[0]?.space ?? Space.init)?.type).toEqual('started')
    }
  })
})
