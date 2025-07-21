import { difference } from '~/@/array/difference'
import { describe, expect, test, TestRunnerEnv } from '~/@/test-runner'
import { eventually } from '~/@/test/eventually'
import { FixtureAppE2E } from '~/app/@/test/app-fixture/impl'
import { doClickBackButton } from '~/app/@/test/flows/do-click-back-button'
import { doDismissAlert } from '~/app/@/test/flows/do-dismiss-alert'
import { TEST_ID_SPACE_LIST_SCREEN } from '~/app/spaces/list-spaces/frontend'
import { TEST_ID_SEND_CODE_SCREEN, TEST_ID_VERIFY_CODE_SCREEN } from './frontend'
import { doOpenSendCodeScreen } from './test/do-open-send-code-screen'
import { doSendCode } from './test/do-send-code'
import { doVerifyCode } from './test/do-verify-code'

const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAppE2E(e)

  return { ...f }
}

describe('verify code', () => {
  test('verify code screen back button', async (e) => {
    await using f = await Fixture(e)
    await doOpenSendCodeScreen(f)
    await doSendCode(f)
    const verifyCodeScreen = await f.frontend.findByTestId(TEST_ID_VERIFY_CODE_SCREEN)
    expect(verifyCodeScreen).toBeTruthy()
    await doClickBackButton(f)
    const sendCodeScreen = await f.frontend.findByTestId(TEST_ID_SEND_CODE_SCREEN)
    expect(sendCodeScreen).toBeTruthy()
  })

  test('verify code screen back button play sound', async (e) => {
    if (e.e2e) return
    await using f = await Fixture(e)
    await doOpenSendCodeScreen(f)
    await doSendCode(f)
    const verifyCodeScreen = await f.frontend.findByTestId(TEST_ID_VERIFY_CODE_SCREEN)
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
    await doOpenSendCodeScreen(f)
    await doSendCode(f)
    await doDismissAlert(f.frontend, 'info')
    await doVerifyCode(f)
    const screen = await f.frontend.findByTestId(TEST_ID_SPACE_LIST_SCREEN)
    expect(screen).toBeTruthy()
  })

  test('enter wrong code does stays on verify code screen', async (e) => {
    await using f = await Fixture(e)
    await doOpenSendCodeScreen(f)
    await doSendCode(f)
    await doVerifyCode(f, { code: '111' })
    const verifyCodeScreen = await f.frontend.findByTestId(TEST_ID_VERIFY_CODE_SCREEN)
    expect(verifyCodeScreen).toBeTruthy()
  })

  test('fail for correct code after enough wrong attempts', async (e) => {
    await using f = await Fixture(e)
    await doOpenSendCodeScreen(f)
    await doSendCode(f)
    for (let i = 0; i < 5; i++) {
      await doVerifyCode(f, { code: '111' })
      await f.frontend.findByTestId(TEST_ID_VERIFY_CODE_SCREEN)
    }
    await doVerifyCode(f, { code: '123' })
    await doDismissAlert(f.frontend, 'error')
  })

  test.skip('show alert on verifying code', async (e) => {
    await using f = await Fixture(e)
    await doOpenSendCodeScreen(f)
    await doSendCode(f)
    await doVerifyCode(f)
    await doDismissAlert(f.frontend, 'info')
  })

  test('show error alert when code is wrong', async (e) => {
    await using f = await Fixture(e)
    await doOpenSendCodeScreen(f)
    await doSendCode(f)
    await doVerifyCode(f, { code: '111' })
    await doDismissAlert(f.frontend, 'error')
  })

  test('code input should be empty after code was sent', async (e) => {
    await using f = await Fixture(e)
    await doOpenSendCodeScreen(f)
    await doSendCode(f)
    await doDismissAlert(f.frontend, 'info')
    const [codeInput] = await f.frontend.find(`input[type='tel']`)
    expect(codeInput).toBeTruthy()
    const value = await codeInput!.inputValue()
    expect(value).toEqual('')
  })
})
