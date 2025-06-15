import { describe, expect, test } from 'bun:test'
import { unwrap } from '~/@/result'
import { Fixtures } from './fixture'

describe('SpaceDb - query by host id', () => {
  test('query by host id', async () => {
    for (const f of await Fixtures()) {
      const before = await f.spacesDb.query({ where: { hostId: { '=': f.hostId } } })

      unwrap(await f.spacesDb.upsert(f.space))

      const after = await f.spacesDb.query({ where: { hostId: { '=': f.hostId } } })

      expect(unwrap(before).items).toEqual([])
      expect(unwrap(after).items).toEqual([f.space])
    }
  })
})
