import { describe, expect, test } from '~/@/test-runner'
import { FixtureAppE2E } from '../@/test/app-fixture'
import { TEST_ID_LOGIN_SCREEN } from './frontend'
import { TEST_ID_SEND_CODE_SCREEN } from './login-with-sms/frontend'

const Fixture = FixtureAppE2E

describe('login', () => {
  test('login screen', async (e) => {
    await using f = await Fixture(e)
    const screen = await f.frontend.findByTestId(TEST_ID_LOGIN_SCREEN)

    expect(screen).toBeTruthy()
  })

  test('continue with sms', async (e) => {
    await using f = await Fixture(e)
    const loginScreen = await f.frontend.findByTestId(TEST_ID_LOGIN_SCREEN)
    expect(loginScreen).toBeTruthy()
    const button = await f.frontend.findByRole('button', 'Continue with phone')
    expect(button).toBeTruthy()
    await button!.do({ t: 'click' })
    const sendCodeScreen = await f.frontend.findByTestId(TEST_ID_SEND_CODE_SCREEN)
    expect(sendCodeScreen).toBeTruthy()
  })
})
