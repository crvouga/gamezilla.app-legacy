import { describe, expect, test } from 'bun:test'
import { difference } from '~/@/array/difference'
import { eventually } from '~/@/test/eventually'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { FixtureAuth } from '../@/test/fixture'

const Fixture = async () => {
  const f = await FixtureAuth()

  const [button] = await f.frontend.query(`[data-testid='auth/continue-with-phone-button']`)
  await button!.do({ t: 'click' })
  const [screen] = await f.frontend.query(`[data-testid='auth/send-code-screen']`)
  expect(screen).toBeDefined()

  const sendCode = async (config?: { phoneNumber?: string }) => {
    await f.frontend.query(`[data-testid='auth/send-code-screen']`)
    const [input] = await f.frontend.query(`input[type='tel']`)
    await input!.do({ t: 'input', value: config?.phoneNumber ?? '4802098698' })
    const [button] = await f.frontend.query(`button[type='submit']`)
    await button!.do({ t: 'click' })
  }

  const verifyCode = async (config?: { code?: string }) => {
    await f.frontend.query(`[data-testid='auth/verify-code-screen']`)
    const [input] = await f.frontend.query(`input[type='tel']`)
    await input!.do({ t: 'input', value: config?.code ?? '123' })
    const [button] = await f.frontend.query(`button[type='submit']`)
    await button!.do({ t: 'click' })
  }

  return { ...f, sendCode, verifyCode }
}

describe('login with sms', () => {
  describe('send code', () => {
    test('send code screen back button', async () => {
      await using f = await Fixture()
      const [sendCodeScreen] = await f.frontend.query(`[data-testid='auth/send-code-screen']`)
      expect(sendCodeScreen).toBeDefined()
      const [backButton] = await f.frontend.query(`[data-testid='nav/back-button']`)
      await backButton!.do({ t: 'click' })
      const [loginScreen] = await f.frontend.query(`[data-testid='auth/login-screen']`)
      expect(loginScreen).toBeDefined()
    })

    test('go to verify code screen', async () => {
      await using f = await Fixture()
      await f.sendCode()
      const [screen] = await f.frontend.query(`[data-testid='auth/verify-code-screen']`)
      expect(screen).toBeDefined()
    })

    test('show alert on sending code', async () => {
      await using f = await Fixture()
      await f.sendCode()
      const [alert] = await f.frontend.query(`[role='alert'][data-info='true']`)
      expect(alert).toBeDefined()
    })

    test('should error alert when phone number is invalid', async () => {
      await using f = await Fixture()
      await f.sendCode({ phoneNumber: '123' })
      const [alert] = await f.frontend.query(`[role='alert'][data-error='true']`)
      expect(alert).toBeDefined()
    })

    test('play sound on sending code', async () => {
      await using f = await Fixture()
      const before = f.frontend.audio.played()
      await f.sendCode()
      await eventually(async () => {
        const after = f.frontend.audio.played()
        const played = difference(after, before, (x) => x.id)
        expect(played.map((x) => x.src)).toEqual([APP_SOUND.tap, APP_SOUND.navForwardMin])
      })
    })
  })

  describe('verify code', () => {
    test('verify code screen back button', async () => {
      await using f = await Fixture()
      await f.sendCode()
      const [backButton] = await f.frontend.query(`[data-testid='nav/back-button']`)
      await backButton!.do({ t: 'click' })
      const [screen] = await f.frontend.query(`[data-testid='auth/send-code-screen']`)
      expect(screen).toBeDefined()
    })

    test('go to space screen after verifying code', async () => {
      await using f = await Fixture()
      await f.sendCode()
      await f.verifyCode()
      const [screen] = await f.frontend.query(`[data-testid='spaces/space-list-screen']`)
      expect(screen).toBeDefined()
    })

    test('show alert on verifying code', async () => {
      await using f = await Fixture()
      await f.sendCode()
      await f.verifyCode()
      const [alert] = await f.frontend.query(`[role='alert'][data-info='true']`)
      expect(alert).toBeDefined()
    })

    test('enter wrong code does not go to space screen', async () => {
      await using f = await Fixture()
      await f.sendCode()
      await f.verifyCode({ code: '111' })
      const [spaceScreen] = await f.frontend.query(`[data-testid='spaces/space-list-screen']`)
      expect(spaceScreen).toBeUndefined()
      const [verifyCodeScreen] = await f.frontend.query(`[data-testid='auth/verify-code-screen']`)
      expect(verifyCodeScreen).toBeDefined()
    })

    test('show error alert when code is wrong', async () => {
      await using f = await Fixture()
      await f.sendCode()
      await f.verifyCode({ code: '111' })
      const [error] = await f.frontend.query(`[role='alert'][data-error='true']`)
      expect(error).toBeDefined()
    })

    test('fail for correct code after enough wrong attempts', async () => {
      await using f = await Fixture()
      await f.sendCode()
      for (let i = 0; i < 5; i++) {
        await f.verifyCode({ code: '111' })
      }
      await f.verifyCode({ code: '123' })
      const [error] = await f.frontend.query(`[role='alert'][data-error='true']`)
      expect(error).toBeDefined()
    })
  })
})
