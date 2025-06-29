import { describe, expect, test } from '~/@/test-runner'
import { UserId } from '~/app/@/data/user-id'
import { Row } from './impl-sql'

describe('UserAccountDbImplSql', () => {
  test('should parse correctly', async () => {
    const row: Row = {
      created_at_unix_ms: '2021-01-01T00:00:00Z',
      id: UserId.generate(),
      user_role: 'guest',
      phone_number: null,
    }

    expect(Row.parse(row).t === 'ok').toEqual(true)
  })
})
