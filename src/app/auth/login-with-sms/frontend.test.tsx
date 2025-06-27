import { describe, expect, it } from 'bun:test'
import { FixtureAuth } from '../@/test/fixture'

const Fixture = async () => {
  const f = await FixtureAuth()
  const [button] = await f.client.query(`[data-testid='continue-with-phone-button']`)
  await button!.do({ t: 'click' })
  const [screen] = await f.client.query(`[data-testid='send-code-screen']`)
  expect(screen).toBeDefined()
  return f
}

describe('login with sms', () => {
  it('should navigate to verify code screen after sending code', async () => {
    await using f = await Fixture()
    const [input] = await f.client.query(`[data-testid='phone-number-input']`)
    await input!.do({ t: 'input', value: '4802098698' })
    const [button] = await f.client.query(`button[type='submit']`)
    await button!.do({ t: 'click' })
    const [screen] = await f.client.query(`[data-testid='verify-code-screen']`)
    expect(screen).toBeDefined()
  })
})
