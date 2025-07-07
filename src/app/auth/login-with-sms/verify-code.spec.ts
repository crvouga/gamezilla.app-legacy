import { difference } from '~/@/array/difference'
import { describe, expect, test, TestRunnerEnv } from '~/@/test-runner'
import { eventually } from '~/@/test/eventually'
import { FixtureAppE2E } from '~/app/@/test/app-fixture/impl'
import { doClickBackButton } from '~/app/@/test/setup/do-click-back-button'
import { SpacesFrontend } from '~/app/spaces/frontend'
import { AuthFrontend } from '../frontend'
import { doOpenSendCodeScreen } from './test/do-open-send-code-screen'
import { doSendCode } from './test/do-send-code'
import { doVerifyCode } from './test/do-verify-code'

const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAppE2E(e)
  await doOpenSendCodeScreen(f)
  await doSendCode(f)
  return { ...f }
}

describe('verify code', () => {
  test('verify code screen back button', async (e) => {
    await using f = await Fixture(e)
    const verifyCodeScreen = await f.frontend.findByTestId(AuthFrontend.TEST_ID.VERIFY_CODE_SCREEN)
    expect(verifyCodeScreen).toBeTruthy()
    await doClickBackButton(f)
    const sendCodeScreen = await f.frontend.findByTestId(AuthFrontend.TEST_ID.SEND_CODE_SCREEN)
    expect(sendCodeScreen).toBeTruthy()
  })

  test('verify code screen back button play sound', async (e) => {
    if (e.e2e) return
    await using f = await Fixture(e)
    const verifyCodeScreen = await f.frontend.findByTestId(AuthFrontend.TEST_ID.VERIFY_CODE_SCREEN)
    expect(verifyCodeScreen).toBeTruthy()
    const before = await f.frontend.audio()
    await doClickBackButton(f)
    await eventually(async () => {
      const after = await f.frontend.audio()
      const played = difference(after, before, (x) => x.id)
      expect(played.map((x) => x.tag)).toEqual(['interaction.navigate'])
    })
  })

  test('go to space screen after verifying code', async (e) => {
    await using f = await Fixture(e)
    const [sendCodeError] = await f.frontend.find(`[role='alert'][data-error='true']`)
    expect(sendCodeError).toBeFalsy()
    await doVerifyCode(f)
    const screen = await f.frontend.findByTestId(SpacesFrontend.TEST_ID.SPACE_LIST_SCREEN)
    expect(screen).toBeTruthy()
  })

  test('show alert on verifying code', async (e) => {
    await using f = await Fixture(e)
    await doVerifyCode(f)
    const [alert] = await f.frontend.find(`[role='alert'][data-info='true']`)
    expect(alert).toBeTruthy()
  })

  test('enter wrong code does stays on verify code screen', async (e) => {
    await using f = await Fixture(e)
    await doVerifyCode(f, { code: '111' })
    const verifyCodeScreen = await f.frontend.findByTestId(AuthFrontend.TEST_ID.VERIFY_CODE_SCREEN)
    expect(verifyCodeScreen).toBeTruthy()
  })

  test('show error alert when code is wrong', async (e) => {
    await using f = await Fixture(e)
    await doVerifyCode(f, { code: '111' })
    const [error] = await f.frontend.find(`[role='alert'][data-error='true']`)
    expect(error).toBeTruthy()
  })

  test('fail for correct code after enough wrong attempts', async (e) => {
    await using f = await Fixture(e)
    for (let i = 0; i < 5; i++) {
      await doVerifyCode(f, { code: '111' })
      await f.frontend.findByTestId(AuthFrontend.TEST_ID.VERIFY_CODE_SCREEN)
    }
    await doVerifyCode(f, { code: '123' })
    const [error] = await f.frontend.find(`[role='alert'][data-error='true']`)
    expect(error).toBeTruthy()
  })
})
