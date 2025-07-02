import { difference } from '~/@/array/difference'
import { describe, expect, test } from '~/@/test-runner'
import { eventually } from '~/@/test/eventually'
import { Fixture } from './fixture'
import { ScreenTestIds } from '~/app/@/ui/screen/screen-test-ids'

describe('verify code', () => {
  test('verify code screen back button', async (e) => {
    await using f = await Fixture(e)
    await f.sendCode()
    const verifyCodeScreen = await f.frontend.byDataTestId('auth/verify-code-screen')
    expect(verifyCodeScreen).toBeTruthy()
    const backButton = await f.frontend.byDataTestId(ScreenTestIds.backButton)
    await backButton!.do({ t: 'click' })
    const sendCodeScreen = await f.frontend.byDataTestId('auth/send-code-screen')
    expect(sendCodeScreen).toBeTruthy()
  })

  test('verify code screen back button play sound', async (e) => {
    if (e.e2e) return
    await using f = await Fixture(e)
    await f.sendCode()
    const verifyCodeScreen = await f.frontend.byDataTestId('auth/verify-code-screen')
    expect(verifyCodeScreen).toBeTruthy()
    const before = await f.frontend.audio()
    const backButton = await f.frontend.byDataTestId(ScreenTestIds.backButton)
    await backButton!.do({ t: 'click' })
    await eventually(async () => {
      const after = await f.frontend.audio()
      const played = difference(after, before, (x) => x.id)
      expect(played.map((x) => x.tag)).toEqual(['interaction.navigate'])
    })
  })

  test('go to space screen after verifying code', async (e) => {
    await using f = await Fixture(e)
    await f.sendCode()
    const [sendCodeError] = await f.frontend.query(`[role='alert'][data-error='true']`)
    expect(sendCodeError).toBeFalsy()
    await f.verifyCode()
    const screen = await f.frontend.byDataTestId('spaces/space-list-screen')
    expect(screen).toBeTruthy()
  })

  test('show alert on verifying code', async (e) => {
    await using f = await Fixture(e)
    await f.sendCode()
    await f.verifyCode()
    const [alert] = await f.frontend.query(`[role='alert'][data-info='true']`)
    expect(alert).toBeTruthy()
  })

  test('enter wrong code does not go to space screen', async (e) => {
    await using f = await Fixture(e)
    await f.sendCode()
    await f.verifyCode({ code: '111' })
    const [spaceScreen] = await f.frontend.query(`[data-testid='spaces/space-list-screen']`)
    expect(spaceScreen).toBeFalsy()
    const [verifyCodeScreen] = await f.frontend.query(`[data-testid='auth/verify-code-screen']`)
    expect(verifyCodeScreen).toBeTruthy()
  })

  test('show error alert when code is wrong', async (e) => {
    await using f = await Fixture(e)
    await f.sendCode()
    await f.verifyCode({ code: '111' })
    const [error] = await f.frontend.query(`[role='alert'][data-error='true']`)
    expect(error).toBeTruthy()
  })

  test('fail for correct code after enough wrong attempts', async (e) => {
    await using f = await Fixture(e)
    await f.sendCode()
    for (let i = 0; i < 5; i++) {
      await f.verifyCode({ code: '111' })
    }
    await f.verifyCode({ code: '123' })
    const [error] = await f.frontend.query(`[role='alert'][data-error='true']`)
    expect(error).toBeTruthy()
  })
})
