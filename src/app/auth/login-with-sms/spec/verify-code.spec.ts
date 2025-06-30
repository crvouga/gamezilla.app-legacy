import { difference } from '~/@/array/difference'
import { describe, expect, test } from '~/@/test-runner'
import { eventually } from '~/@/test/eventually'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { Fixture } from './fixture'

describe('verify code', () => {
  test('verify code screen back button', async (e) => {
    await using f = await Fixture(e)
    await f.sendCode()
    await f.frontend.query(`[data-testid='auth/verify-code-screen']`)
    const [backButton] = await f.frontend.query(`[data-testid='nav/back-button']`)
    await backButton!.do({ t: 'click' })
    const [sendCodeScreen] = await f.frontend.query(`[data-testid='auth/send-code-screen']`)
    expect(sendCodeScreen).toBeDefined()
  })

  test('verify code screen back button play sound', async (e) => {
    if (e.e2e) return
    await using f = await Fixture(e)
    await f.sendCode()
    await f.frontend.query(`[data-testid='auth/verify-code-screen']`)
    const before = await f.frontend.audio()
    const [backButton] = await f.frontend.query(`[data-testid='nav/back-button']`)
    await backButton!.do({ t: 'click' })
    await eventually(async () => {
      const after = await f.frontend.audio()
      const played = difference(after, before, (x) => x.id)
      expect(played.map((x) => x.src)).toEqual([APP_SOUND.navBackwardMin])
    })
  })

  test('go to space screen after verifying code', async (e) => {
    await using f = await Fixture(e)
    await f.sendCode()
    const [sendCodeError] = await f.frontend.query(`[role='alert'][data-error='true']`)
    expect(sendCodeError).toBeUndefined()
    await f.verifyCode()
    const [screen] = await f.frontend.query(`[data-testid='spaces/space-list-screen']`)
    expect(screen).toBeDefined()
  })

  test('show alert on verifying code', async (e) => {
    await using f = await Fixture(e)
    await f.sendCode()
    await f.verifyCode()
    const [alert] = await f.frontend.query(`[role='alert'][data-info='true']`)
    expect(alert).toBeDefined()
  })

  test('enter wrong code does not go to space screen', async (e) => {
    await using f = await Fixture(e)
    await f.sendCode()
    await f.verifyCode({ code: '111' })
    const [spaceScreen] = await f.frontend.query(`[data-testid='spaces/space-list-screen']`)
    expect(spaceScreen).toBeUndefined()
    const [verifyCodeScreen] = await f.frontend.query(`[data-testid='auth/verify-code-screen']`)
    expect(verifyCodeScreen).toBeDefined()
  })

  test('show error alert when code is wrong', async (e) => {
    await using f = await Fixture(e)
    await f.sendCode()
    await f.verifyCode({ code: '111' })
    const [error] = await f.frontend.query(`[role='alert'][data-error='true']`)
    expect(error).toBeDefined()
  })

  test('fail for correct code after enough wrong attempts', async (e) => {
    await using f = await Fixture(e)
    await f.sendCode()
    for (let i = 0; i < 5; i++) {
      await f.verifyCode({ code: '111' })
    }
    await f.verifyCode({ code: '123' })
    const [error] = await f.frontend.query(`[role='alert'][data-error='true']`)
    expect(error).toBeDefined()
  })
})
