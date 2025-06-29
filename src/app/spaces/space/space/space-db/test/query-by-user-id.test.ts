import { describe, expect, test } from 'vitest'
import { unwrap } from '~/@/result'
import { Fixtures } from './fixture'

describe('SpaceDb - query by user id', () => {
  test('query by user id', async () => {
    for (const f of await Fixtures()) {
      await f.seedOtherSpaces({ count: 3 })

      const before = await f.spacesDb.query({ where: { userId: { in: f.userIds } } })

      unwrap(await f.spacesDb.upsert(f.space))

      const after = await f.spacesDb.query({ where: { userId: { in: f.userIds } } })

      expect(unwrap(before).items).toEqual([])
      expect(unwrap(after).items).toEqual([f.space])
    }
  })
})
