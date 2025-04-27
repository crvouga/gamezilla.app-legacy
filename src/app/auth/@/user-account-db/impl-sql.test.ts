import { describe, expect, it } from 'bun:test'
import { UserId } from '~/app/@/data/user-id'
import { UserAccountRow } from './impl-sql'

describe(import.meta.file, () => {
  it('should parse correctly', async () => {
    const row: UserAccountRow = {
      created_at_posix: '2021-01-01T00:00:00Z',
      id: UserId.generate(),
      user_role: 'guest',
      phone_number: null,
    }

    expect(UserAccountRow.parse(row).t === 'ok').toBe(true)
  })
})
