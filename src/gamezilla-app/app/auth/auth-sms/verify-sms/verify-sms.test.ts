import { describe, expect, it } from 'bun:test'
import { PhoneNumber, isErr, unwrap } from 'gamezilla-app/@/core'
import { VerifySMSInHouseFixture } from './verify-sms-impl/verify-sms-impl-in-house/@/fixture'

const Fixture = async () => {
  const inHouseFixture = await VerifySMSInHouseFixture()

  return {
    ...inHouseFixture
  }
}

describe(import.meta.file, () => {
  it('should be ok sending code', async () => {
    const f = await Fixture()
    const phoneNumber = unwrap(PhoneNumber.fromString('+14802098698'))
    const result = await f.verifySMS.sendCode({
      phoneNumber,
      preferredLanguage: 'en'
    })
    expect(result.t).toBe('ok')
  })

  it('should return code incorrect', async () => {
    const f = await Fixture()
    const phoneNumber = unwrap(PhoneNumber.fromString('+14802098698'))
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
  })
})
