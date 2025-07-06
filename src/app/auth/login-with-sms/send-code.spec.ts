import { difference } from '~/@/array/difference'
import { Iso3166Alpha2Code } from '~/@/country/iso-3166-alpha-2-code'
import { describe, expect, test, TestRunnerEnv } from '~/@/test-runner'
import { eventually } from '~/@/test/eventually'
import { FixtureAppE2E } from '~/app/@/test/app-fixture/impl'
import { doClickBackButton } from '~/app/@/test/setup/do-click-back-button'
import { doOpenSendCodeScreen } from './test/do-open-send-code-screen'
import { doSendCode } from './test/do-send-code'

export const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAppE2E(e)
  await doOpenSendCodeScreen(f)
  return { ...f }
}

describe('send code', () => {
  test('country should match navigator country', async (e) => {
    await using f = await Fixture(e)
    const [countryCodeSelect] = await f.frontend.find(
      `[data-testid='auth/country-code-select'] option[data-selected='true']`,
    )
    expect(countryCodeSelect).toBeTruthy()
    const countryCode = await countryCodeSelect?.text()
    expect(countryCode).toBeTruthy()
    expect(countryCode).toEqual(Iso3166Alpha2Code.toNameWithEmoji('US'))
  })

  test('send code screen back button', async (e) => {
    await using f = await Fixture(e)
    const sendCodeScreen = await f.frontend.findByTestId('auth/send-code-screen')
    expect(sendCodeScreen).toBeTruthy()
    await doClickBackButton(f)
    const loginScreen = await f.frontend.findByTestId('auth/login-screen')
    expect(loginScreen).toBeTruthy()
  })

  test('go to verify code screen', async (e) => {
    await using f = await Fixture(e)
    await doSendCode(f)
    const [screen] = await f.frontend.find(`[data-testid='auth/verify-code-screen']`)
    expect(screen).toBeTruthy()
  })

  test('show alert on sending code', async (e) => {
    await using f = await Fixture(e)
    await doSendCode(f)
    const [alert] = await f.frontend.find(`[role='alert'][data-info='true']`)
    expect(alert).toBeTruthy()
  })

  test('should error alert when phone number is invalid', async (e) => {
    await using f = await Fixture(e)
    await doSendCode(f, { phoneNumber: '123' })
    const [alert] = await f.frontend.find(`[role='alert'][data-error='true']`)
    expect(alert).toBeTruthy()
  })

  test('play sound on sending code', async (e) => {
    if (e.e2e) return
    await using f = await Fixture(e)
    const before = await f.frontend.audio()
    await doSendCode(f)
    await eventually(async () => {
      const after = await f.frontend.audio()
      const played = difference(after, before, (x) => x.id)
      expect(played.map((x) => x.tag)).toEqual(['interaction.tap', 'interaction.navigate'])
    })
  })
})
