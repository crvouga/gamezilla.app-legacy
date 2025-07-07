import { describe, expect, test } from '~/@/test-runner'
import { FixtureAppE2E } from '../@/test/app-fixture'
import { AuthFrontend } from './frontend'

const Fixture = FixtureAppE2E

describe('login', () => {
  test('login screen', async (e) => {
    await using f = await Fixture(e)
    const screen = await f.frontend.findByTestId(AuthFrontend.TEST_ID.LOGIN_SCREEN)
    expect(screen).toBeTruthy()
  })

  test('continue with sms', async (e) => {
    await using f = await Fixture(e)
    const loginScreen = await f.frontend.findByTestId(AuthFrontend.TEST_ID.LOGIN_SCREEN)
    expect(loginScreen).toBeTruthy()
    const continueWithPhoneButton = await f.frontend.findByTestId(AuthFrontend.TEST_ID.CONTINUE_WITH_PHONE_BUTTON)
    expect(continueWithPhoneButton).toBeTruthy()
    await continueWithPhoneButton!.do({ t: 'click' })
    const sendCodeScreen = await f.frontend.findByTestId(AuthFrontend.TEST_ID.SEND_CODE_SCREEN)
    expect(sendCodeScreen).toBeTruthy()
  })
})
