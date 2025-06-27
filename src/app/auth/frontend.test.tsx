import { describe, expect, test } from 'bun:test'
import { FixtureAuth } from './@/test/fixture'

const Fixture = async () => {
  const f = await FixtureAuth()
  return f
}

describe('Auth', () => {
  test('login screen', async () => {
    await using f = await Fixture()
    const [screen] = await f.client.query(`[data-testid='login-screen']`)
    expect(screen).toBeDefined()
  })

  test('continue with sms', async () => {
    await using f = await Fixture()
    const [button] = await f.client.query(`[data-testid='continue-with-phone-button']`)
    await button!.do({ t: 'click' })
    const [screen] = await f.client.query(`[data-testid='send-code-screen']`)
    expect(screen).toBeDefined()
  })
})
