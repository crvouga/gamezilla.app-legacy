import { difference } from '~/@/array/difference'
import { describe, expect, test } from '~/@/test-runner'
import { eventually } from '~/@/test/eventually'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { Fixture } from './fixture'

describe('send code', () => {
  test('send code screen back button', async (e) => {
    await using f = await Fixture(e)
    const [sendCodeScreen] = await f.frontend.query(`[data-testid='auth/send-code-screen']`)
    expect(sendCodeScreen).toBeDefined()
    const [backButton] = await f.frontend.query(`[data-testid='nav/back-button']`)
    await backButton!.do({ t: 'click' })
    const [loginScreen] = await f.frontend.query(`[data-testid='auth/login-screen']`)
    expect(loginScreen).toBeDefined()
  })

  test('go to verify code screen', async (e) => {
    await using f = await Fixture(e)
    await f.sendCode()
    const [screen] = await f.frontend.query(`[data-testid='auth/verify-code-screen']`)
    expect(screen).toBeDefined()
  })

  test('show alert on sending code', async (e) => {
    await using f = await Fixture(e)
    await f.sendCode()
    const [alert] = await f.frontend.query(`[role='alert'][data-info='true']`)
    expect(alert).toBeDefined()
  })

  test('should error alert when phone number is invalid', async (e) => {
    await using f = await Fixture(e)
    await f.sendCode({ phoneNumber: '123' })
    const [alert] = await f.frontend.query(`[role='alert'][data-error='true']`)
    expect(alert).toBeDefined()
  })

  test('play sound on sending code', async (e) => {
    if (e.e2e) return
    await using f = await Fixture(e)
    const before = await f.frontend.audio()
    await f.sendCode()
    await eventually(async () => {
      const after = await f.frontend.audio()
      const played = difference(after, before, (x) => x.id)
      expect(played.map((x) => x.src)).toEqual([APP_SOUND.tap, APP_SOUND.navForwardMin])
    })
  })
})
