import { describe, expect, it, test } from 'bun:test'
import { FixtureAuth } from '../@/test/fixture'

const Fixture = async () => {
  const f = await FixtureAuth()

  const [button] = await f.client.query(`[data-testid='auth/continue-with-phone-button']`)
  await button!.do({ t: 'click' })
  const [screen] = await f.client.query(`[data-testid='auth/send-code-screen']`)
  expect(screen).toBeDefined()

  const sendCode = async () => {
    const [input] = await f.client.query(`input[type='tel']`)
    await input!.do({ t: 'input', value: '4802098698' })
    const [button] = await f.client.query(`button[type='submit']`)
    await button!.do({ t: 'click' })
  }

  return { ...f, sendCode }
}

describe('login with sms', () => {
  it('should navigate to verify code screen after sending code', async () => {
    await using f = await Fixture()
    await f.sendCode()
    const [screen] = await f.client.query(`[data-testid='auth/verify-code-screen']`)
    expect(screen).toBeDefined()
  })

  test('show toasts on sending code', async () => {
    await using f = await Fixture()
    await f.sendCode()
    const [toast] = await f.client.query(`[data-testid='toaster/toast']`)
    expect(toast).toBeDefined()
  })
})
