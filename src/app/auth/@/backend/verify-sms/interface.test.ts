import { Logger } from '~/@/logger'
import { PhoneNumber } from '~/@/phone-number'
import { isErr, unwrap } from '~/@/result'
import { SecretString } from '~/@/secrets/secret-string'
import { describe, expect, test } from '~/@/test-runner'
import { Config, VerifySMS } from './impl'
import { VerifySMSInHouseFixture } from './impl/impl-in-house/@/fixture'

const Fixture = (config: Config) => {
  const verifySMS = VerifySMS(config)
  const phone = PhoneNumber.fromString('+14802098698')
  return {
    verifySMS,
    phone,
  }
}

const Fixtures = async () => {
  const configs: Config[] = []

  const inHouseFixture = await VerifySMSInHouseFixture()
  configs.push(inHouseFixture)

  const TEST_TWILIO = false
  if (TEST_TWILIO) {
    const TWILIO_ACCOUNT_SID = process.env?.TWILIO_ACCOUNT_SID!
    if (!TWILIO_ACCOUNT_SID) throw new Error('TWILIO_ACCOUNT_SID is not set')

    const TWILIO_AUTH_TOKEN = SecretString.init('TWILIO_AUTH_TOKEN', process.env?.TWILIO_AUTH_TOKEN)!
    if (!TWILIO_AUTH_TOKEN) throw new Error('TWILIO_AUTH_TOKEN is not set')

    const TWILIO_MESSAGING_SERVICE_SID = process.env?.TWILIO_MESSAGING_SERVICE_SID!
    if (!TWILIO_MESSAGING_SERVICE_SID) throw new Error('TWILIO_MESSAGING_SERVICE_SID is not set')

    configs.push({
      t: 'twilio',
      logger: Logger({ t: 'console', namespace: ['verify-sms'], newLinePerMsg: false, maxLogLevel: 'info' }),
      twilioAccountSid: TWILIO_ACCOUNT_SID,
      twilioAuthToken: TWILIO_AUTH_TOKEN,
      twilioMessagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
    })
  }

  return configs.map(Fixture)
}

describe('VerifySMS', () => {
  test('should be ok sending code', async () => {
    for (const f of await Fixtures()) {
      const phoneNumber = unwrap(f.phone)
      const result = await f.verifySMS.sendCode({
        phoneNumber,
        preferredLanguage: 'en',
      })
      expect(result.t).toEqual('ok')
    }
  })

  test('should return code incorrect', async () => {
    for (const f of await Fixtures()) {
      const phoneNumber = unwrap(f.phone)
      await f.verifySMS.sendCode({
        phoneNumber,
        preferredLanguage: 'en',
      })
      const result = await f.verifySMS.verifyCode({
        phoneNumber,
        code: '42',
        preferredLanguage: 'en',
      })
      expect(result.t).toEqual('err')
      isErr(result) && expect(result.error.t).toEqual('code-incorrect')
    }
  })
})
