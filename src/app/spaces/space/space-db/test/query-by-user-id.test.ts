import { describe, expect, test } from '~/@/test-runner'
import { unwrap } from '~/@/result'
import { Fixtures } from './fixture'

describe('SpaceDb - query by user id', () => {
  test('query by user id', async () => {
    for (const f of await Fixtures()) {
      await f.seedOtherSpaces({ count: 3 })

      const before = await f.spacesDb.query({ where: { op: 'in', column: 'userIds', value: [f.userIds] } })

      unwrap(await f.spacesDb.upsert({ entities: [f.space] }))

      const after = await f.spacesDb.query({ where: { op: 'in', column: 'userIds', value: [f.userIds] } })

      expect(unwrap(before).entities.items).toEqual([])
      expect(unwrap(after).entities.items).toEqual([f.space])
    }
  })
})
