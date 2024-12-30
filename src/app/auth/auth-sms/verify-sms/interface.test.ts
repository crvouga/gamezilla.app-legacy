import { describe, expect, it } from 'bun:test'
import { isErr, unwrap } from '~/@/result'
import { Logger } from '~/@/logger'
import { AppServerTestEnv } from '~/app/@/server/server-test-env'
import { Config, VerifySMS } from './impl'
import { VerifySMSInHouseFixture } from './impl/impl-in-house/@/fixture'
import { PhoneNumber } from '~/@/phone-number'

const Fixture = (config: Config) => {
  const verifySMS = VerifySMS(config)
  const phone = PhoneNumber.fromString('+14802098698')
  return {
    verifySMS,
    phone
  }
}

const Fixtures = async () => {
  const inHouseFixture = await VerifySMSInHouseFixture()
  const testEnv = await AppServerTestEnv()

  const configs: Config[] = [inHouseFixture]

  if (testEnv.t === 'all') {
    configs.push({ t: 'twilio', logger: Logger({ t: 'console' }) })
  }

  return configs.map(Fixture)
}

describe(import.meta.file, () => {
  it('should be ok sending code', async () => {
    for (const f of await Fixtures()) {
      const phoneNumber = unwrap(f.phone)
      const result = await f.verifySMS.sendCode({
        phoneNumber,
        preferredLanguage: 'en'
      })
      expect(result.t).toBe('ok')
    }
  })

  it('should return code incorrect', async () => {
    for (const f of await Fixtures()) {
      const phoneNumber = unwrap(f.phone)
      await f.verifySMS.sendCode({
        phoneNumber,
        preferredLanguage: 'en'
      })
      const result = await f.verifySMS.verifyCode({
        phoneNumber,
        code: '42'
      })
      expect(result.t).toBe('err')
      isErr(result) && expect(result.error.t).toBe('code-incorrect')
    }
  })
})
