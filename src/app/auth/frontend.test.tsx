import { describe, expect, test } from 'bun:test'
import { FixtureAuth } from './@/test/fixture'

const Fixture = async () => {
  const f = await FixtureAuth()

  return {
    ...f,
  }
}

describe('Auth', () => {
  test('login screen', async () => {
    const f = await Fixture()
    const [screen] = await f.client.query(`[data-testid='auth-login-screen']`)
    expect(screen).toBeDefined()
  })
})
