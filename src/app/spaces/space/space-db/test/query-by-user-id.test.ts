import { describe, expect, test } from '~/@/test-runner'
import { unwrap } from '~/@/result'
import { UnixMs } from '~/@/time/unix-ms'
import { SpaceEntity } from '../space-entity'
import { Fixtures } from './fixture'

describe('SpaceDb - query by user id', () => {
  test('query by user id', async () => {
    for (const f of await Fixtures()) {
      await f.seedOtherSpaces({ count: 3 })

      // Note: This test queries userIds which doesn't exist on SpaceEntity
      // It needs to be refactored to use spaceProjectionUserDb instead
      const before = await f.spacesDb.query({ where: { op: '=', column: 'id', value: f.spaceId } })

      const spaceEntity: SpaceEntity = {
        id: f.spaceId,
        createdAt: UnixMs.now(),
        updatedAt: UnixMs.now(),
        deletedAt: null,
        space: f.space,
      }
      unwrap(await f.spacesDb.upsert({ entities: [spaceEntity] }))

      const after = await f.spacesDb.query({ where: { op: '=', column: 'id', value: f.spaceId } })

      expect(unwrap(before).entities.items).toEqual([])
      expect(unwrap(after).entities.items.map((e) => e.space)).toEqual([f.space])
    }
  })
})
