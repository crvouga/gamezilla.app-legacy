import { describe, expect, test } from 'bun:test'
import { difference } from '~/@/array/difference'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { FixtureAuth } from '../@/test/fixture'

const Fixture = async () => {
  const f = await FixtureAuth()

  const [button] = await f.frontend.query(`[data-testid='auth/continue-with-phone-button']`)
  await button!.do({ t: 'click' })
  const [screen] = await f.frontend.query(`[data-testid='auth/send-code-screen']`)
  expect(screen).toBeDefined()

  const sendCode = async () => {
    await f.frontend.query(`[data-testid='auth/send-code-screen']`)
    const [input] = await f.frontend.query(`input[type='tel']`)
    await input!.do({ t: 'input', value: '4802098698' })
    const [button] = await f.frontend.query(`button[type='submit']`)
    await button!.do({ t: 'click' })
  }

  const verifyCode = async (code?: string) => {
    await f.frontend.query(`[data-testid='auth/verify-code-screen']`)
    const [input] = await f.frontend.query(`input[type='tel']`)
    await input!.do({ t: 'input', value: code ?? '123' })
    const [button] = await f.frontend.query(`button[type='submit']`)
    await button!.do({ t: 'click' })
  }

  return { ...f, sendCode, verifyCode }
}

describe('login with sms', () => {
  describe('send code', () => {
    test('go to verify code screen', async () => {
      await using f = await Fixture()
      await f.sendCode()
      const [screen] = await f.frontend.query(`[data-testid='auth/verify-code-screen']`)
      expect(screen).toBeDefined()
    })

    test('show toasts on sending code', async () => {
      await using f = await Fixture()
      await f.sendCode()
      const [toast] = await f.frontend.query(`[data-testid='toaster/toast']`)
      expect(toast).toBeDefined()
    })

    test('play sound on sending code', async () => {
      await using f = await Fixture()
      const before = f.frontend.audio.played()
      await f.sendCode()
      await new Promise((resolve) => setTimeout(resolve, 0))
      const after = f.frontend.audio.played()
      const played = difference(after, before, (x) => x.id)
      expect(played.map((x) => x.src)).toEqual([APP_SOUND.tap, APP_SOUND.navForwardMin])
    })
  })

  describe('verify code', () => {
    test('go to space screen after verifying code', async () => {
      await using f = await Fixture()
      await f.sendCode()
      await f.verifyCode()
      const [screen] = await f.frontend.query(`[data-testid='spaces/space-list-screen']`)
      expect(screen).toBeDefined()
    })

    test('show toasts on verifying code', async () => {
      await using f = await Fixture()
      await f.sendCode()
      await f.verifyCode()
      const [toast] = await f.frontend.query(`[data-testid='toaster/toast']`)
      expect(toast).toBeDefined()
    })

    test('enter wrong code does not go to space screen', async () => {
      await using f = await Fixture()
      await f.sendCode()
      await f.verifyCode('111')
      const [screen2] = await f.frontend.query(`[data-testid='spaces/space-list-screen']`)
      expect(screen2).toBeUndefined()
      const [screen] = await f.frontend.query(`[data-testid='auth/verify-code-screen']`)
      expect(screen).toBeDefined()
    })
  })
})
