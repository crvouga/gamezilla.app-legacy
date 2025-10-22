import { unwrap } from '~/@/result'
import { describe, expect, test } from '~/@/test-runner'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '../../space'
import { Fixtures } from './fixture'

describe('SpaceDb - query by space id', () => {
  test('query by space id', async () => {
    for (const f of await Fixtures()) {
      unwrap(await f.spacesDb.upsert({ entities: [Space.random({ spaceId: SpaceId.generate() })] }))
      unwrap(await f.spacesDb.upsert({ entities: [Space.random({ spaceId: SpaceId.generate() })] }))
      unwrap(await f.spacesDb.upsert({ entities: [Space.random({ spaceId: SpaceId.generate() })] }))

      const spaceId = Space.toSpaceStarted(f.space)?.spaceId ?? SpaceId.generate()

      const before = await f.spacesDb.query({ where: { op: '=', column: 'id', value: spaceId } })

      unwrap(await f.spacesDb.upsert({ entities: [f.space] }))

      const after = await f.spacesDb.query({ where: { op: '=', column: 'id', value: spaceId } })

      expect(unwrap(before).entities.items).toEqual([])
      expect(unwrap(after).entities.items).toEqual([f.space])
    }
  })

  test('list spaces', async () => {
    for (const f of await Fixtures()) {
      const before = unwrap(await f.spacesDb.query({ where: { op: '=', column: 'id', value: f.spaceId } }))

      unwrap(await f.spacesDb.upsert({ entities: [f.space] }))

      const after = unwrap(await f.spacesDb.query({ where: { op: '=', column: 'id', value: f.spaceId } }))

      expect(before.entities.items).toEqual([])
      expect(after.entities.items).toEqual([f.space])
    }
  })

  test('get with fallback', async () => {
    for (const f of await Fixtures()) {
      const before = unwrap(await f.spacesDb.query({ where: { op: '=', column: 'id', value: f.spaceId } }))

      unwrap(await f.spacesDb.upsert({ entities: [f.space] }))

      const after = unwrap(await f.spacesDb.query({ where: { op: '=', column: 'id', value: f.spaceId } }))
      expect(Space.toSpaceProjection(before.entities.items[0] ?? Space.init)?.type).toEqual('initial')
      expect(Space.toSpaceProjection(after.entities.items[0] ?? Space.init)?.type).toEqual('started')
    }
  })
})
