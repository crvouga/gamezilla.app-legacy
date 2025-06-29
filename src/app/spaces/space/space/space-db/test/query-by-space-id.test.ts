import { describe, expect, test } from '~/@/test-runner'
import { unwrap } from '~/@/result'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '../..'
import { Fixtures } from './fixture'

describe('SpaceDb - query by space id', () => {
  test('query by space id', async () => {
    for (const f of await Fixtures()) {
      unwrap(await f.spacesDb.upsert(Space.random({ spaceId: SpaceId.generate() })))
      unwrap(await f.spacesDb.upsert(Space.random({ spaceId: SpaceId.generate() })))
      unwrap(await f.spacesDb.upsert(Space.random({ spaceId: SpaceId.generate() })))

      const spaceId = Space.toSpaceStarted(f.space)?.spaceId ?? SpaceId.generate()

      const before = await f.spacesDb.query({ where: { spaceId: { '=': spaceId } } })

      unwrap(await f.spacesDb.upsert(f.space))

      const after = await f.spacesDb.query({ where: { spaceId: { '=': spaceId } } })

      expect(unwrap(before).items).toEqual([])
      expect(unwrap(after).items).toEqual([f.space])
    }
  })

  test('list spaces', async () => {
    for (const f of await Fixtures()) {
      const before = unwrap(await f.spacesDb.query({ where: { spaceId: { '=': f.spaceId } } }))

      unwrap(await f.spacesDb.upsert(f.space))

      const after = unwrap(await f.spacesDb.query({ where: { spaceId: { '=': f.spaceId } } }))

      expect(before.items).toEqual([])
      expect(after.items).toEqual([f.space])
    }
  })

  test('get with fallback', async () => {
    for (const f of await Fixtures()) {
      const before = unwrap(await f.spacesDb.query({ where: { spaceId: { '=': f.spaceId } } }))

      unwrap(await f.spacesDb.upsert(f.space))

      const after = unwrap(await f.spacesDb.query({ where: { spaceId: { '=': f.spaceId } } }))
      expect(Space.toSpaceProjection(before.items[0] ?? Space.init)?.type).toEqual('initial')
      expect(Space.toSpaceProjection(after.items[0] ?? Space.init)?.type).toEqual('started')
    }
  })
})
