import { expect, TestRunnerEnv } from '~/@/test-runner'
import { FixtureAuthE2E } from '../@/test/e2e'
import { PhoneNumber } from '~/@/phone-number'

const randomPhoneNumber = (): number => {
  const basePhoneNumber = 480_209_0000
  const random4Digits = Math.floor(Math.random() * 10000)
  const phoneNumber = basePhoneNumber + random4Digits
  PhoneNumber.unsafeParse(phoneNumber.toString())
  return phoneNumber
}

export const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAuthE2E(e)

  const [button] = await f.frontend.query(`[data-testid='auth/continue-with-phone-button']`)
  await button!.do({ t: 'click' })
  const [screen] = await f.frontend.query(`[data-testid='auth/send-code-screen']`)
  expect(screen).toBeDefined()

  const sendCode = async (config?: { phoneNumber?: string }) => {
    await f.frontend.query(`[data-testid='auth/send-code-screen']`)
    const [input] = await f.frontend.query(`input[type='tel']`)
    await input!.do({
      t: 'input',
      value: config?.phoneNumber ?? String(randomPhoneNumber()),
    })
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
