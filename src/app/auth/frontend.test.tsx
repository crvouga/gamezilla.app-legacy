import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { FixtureAuth } from './@/test/fixture'

const Fixture = async () => {
  const f = await FixtureAuth()
  return f
}

describe('Auth', () => {
  let f: Awaited<ReturnType<typeof Fixture>>

  beforeEach(async () => {
    f = await Fixture()
  })

  afterEach(async () => {
    await f.cleanUp()
  })

  test('login screen', async () => {
    const [screen] = await f.frontend.query(`[data-testid='auth/login-screen']`)
    expect(screen).toBeDefined()
  })

  test('continue with sms', async () => {
    const [button] = await f.frontend.query(`[data-testid='auth/continue-with-phone-button']`)
    await button!.do({ t: 'click' })
    const [screen] = await f.frontend.query(`[data-testid='auth/send-code-screen']`)
    expect(screen).toBeDefined()
  })
})
