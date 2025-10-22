import { describe, expect, test } from '~/@/test-runner'
import { unwrap } from '~/@/result'
import { Fixtures } from './fixture'

describe('SpaceDb - query by host id', () => {
  test('query by host id', async () => {
    for (const f of await Fixtures()) {
      const before = await f.spacesDb.query({ where: { op: '=', column: 'hostId', value: f.hostId } })

      unwrap(await f.spacesDb.upsert({ entities: [f.space] }))

      const after = await f.spacesDb.query({ where: { op: '=', column: 'hostId', value: f.hostId } })

      expect(unwrap(before).entities.items).toEqual([])
      expect(unwrap(after).entities.items).toEqual([f.space])
    }
  })
})
