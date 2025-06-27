import { describe, expect, it } from 'bun:test'
import { isErr, isOk, unwrap } from '~/@/result'
import { eq } from '~/@/equals/equals'
import { Hashing } from '~/@/hashing'
import { UnixMs } from '~/@/time/unix-ms'
import { TimeSpan } from '~/@/time/time-span'
import { Translator } from '~/app/@/frontend/translator'
import { VerificationDb } from './verification/verification-db'
import { VerifySMSInHouseFixture } from './@/fixture'
import { PhoneNumber } from '~/@/phone-number'

const Fixture = VerifySMSInHouseFixture

describe('VerifySMS', () => {
  it('should be ok', async () => {
    const f = await Fixture()

    const sent = await f.verifySMS.sendCode(f)

    const verified = await f.verifySMS.verifyCode({
      phoneNumber: f.phoneNumber,
      code: f.CODE,
      preferredLanguage: 'en',
    })

    expect(isOk(sent)).toBe(true)
    expect(isOk(verified)).toBe(true)
  })

  it('should send a sms message with the code in it', async () => {
    const f = await Fixture()
    await f.verifySMS.sendCode({
      ...f,
      phoneNumber: f.phoneNumber,
    })
    expect(f.sms.sent[0]?.message.includes(f.CODE)).toBe(true)
  })

  it('should send a sms message to the phone number inputted', async () => {
    const f = await Fixture()
    await f.verifySMS.sendCode({
      ...f,
      phoneNumber: f.phoneNumber,
    })
    expect(f.sms.sent.every((smsMessage) => eq(smsMessage.phoneNumber, f.phoneNumber))).toBe(true)
  })

  it('should sent a sms message with the "verify-sms.code-message" translation', async () => {
    const f = await Fixture()
    await f.verifySMS.sendCode({
      ...f,
      phoneNumber: f.phoneNumber,
    })
    expect(f.sms.sent[0]?.message === Translator(f.preferredLanguage)('verify-sms.code-message', f.CODE)).toBe(true)
  })

  it('should never send an empty sms message with the "verify-sms.code-message" translation', async () => {
    const f = await Fixture()
    await f.verifySMS.sendCode({
      ...f,
      phoneNumber: f.phoneNumber,
    })
    expect((f.sms.sent[0]?.message.length ?? 0) > 0).toBe(true)
  })

  it('should fail if the code is not the same as the code sent', async () => {
    const f = await Fixture()

    await f.verifySMS.sendCode(f)

    const verified = await f.verifySMS.verifyCode({
      phoneNumber: f.phoneNumber,
      code: f.WRONG_CODE,
      preferredLanguage: 'en',
    })

    expect(isErr(verified) && verified.error.t === 'code-incorrect').toBe(true)
  })

  it('should eventually error after enough failed attempts', async () => {
    const f = await Fixture({
      verifyCodeMaxAttempts: 1,
    })

    await f.verifySMS.sendCode(f)

    await f.verifySMS.verifyCode({
      phoneNumber: f.phoneNumber,
      code: f.WRONG_CODE,
      preferredLanguage: 'en',
    })
    const verified = await f.verifySMS.verifyCode({
      phoneNumber: f.phoneNumber,
      code: f.WRONG_CODE,
      preferredLanguage: 'en',
    })
    expect(isErr(verified) && verified.error.t === 'verification-expired-too-many-failed-attempts').toBe(true)
  })

  it('should error if the verification id is not found', async () => {
    const f = await Fixture()

    await f.verifySMS.sendCode(f)

    const verified = await f.verifySMS.verifyCode({
      phoneNumber: PhoneNumber.random(),
      code: f.CODE,
      preferredLanguage: 'en',
    })

    expect(isErr(verified) && verified.error.t === 'verification-not-found').toBe(true)
  })

  it('should error if verification expired', async () => {
    const verifyCodeExpiresIn = TimeSpan.minutes(5)

    let now = UnixMs.now()

    const f = await Fixture({
      verifyCodeExpiresIn,
      now: () => now,
    })

    await f.verifySMS.sendCode(f)

    now = UnixMs.future(now, verifyCodeExpiresIn)

    const verified = await f.verifySMS.verifyCode({
      phoneNumber: f.phoneNumber,
      code: f.CODE,
      preferredLanguage: 'en',
    })

    expect(isErr(verified) && verified.error.t === 'verification-expired').toBe(true)
  })

  it('should fail if the code has expired, even if no new code has been sent', async () => {
    const verifyCodeExpiresIn = TimeSpan.minutes(5)

    let now = UnixMs.now()
    const f = await Fixture({
      verifyCodeExpiresIn,
      now: () => now,
    })

    await f.verifySMS.sendCode({
      ...f,
      phoneNumber: f.phoneNumber,
    })

    now = UnixMs.future(now, verifyCodeExpiresIn)
    now = UnixMs.future(now, TimeSpan.seconds(1))

    const verified = await f.verifySMS.verifyCode({
      phoneNumber: f.phoneNumber,
      code: f.CODE,
      preferredLanguage: 'en',
    })

    expect(isErr(verified)).toBe(true)
    isErr(verified) && expect(verified.error.t).toBe('verification-expired')
  })

  it('should error if using previous unused code', async () => {
    const CODE_A = '123'
    const CODE_B = '456'
    let now = UnixMs.now()
    let code = CODE_A
    const f = await Fixture({
      now: () => now,
      codeGenerator: {
        generate() {
          return code
        },
      },
    })

    await f.verifySMS.sendCode(f)

    now = UnixMs.future(now, TimeSpan.seconds(1))

    code = CODE_B

    await f.verifySMS.sendCode(f)

    now = UnixMs.future(now, TimeSpan.seconds(1))

    const verifiedA = await f.verifySMS.verifyCode({
      phoneNumber: f.phoneNumber,
      code: CODE_A,
      preferredLanguage: 'en',
    })

    now = UnixMs.future(now, TimeSpan.seconds(1))

    const verifiedB = await f.verifySMS.verifyCode({
      phoneNumber: f.phoneNumber,
      code: CODE_B,
      preferredLanguage: 'en',
    })

    expect(isErr(verifiedA)).toBe(true)
    isErr(verifiedA) && expect(verifiedA.error.t).toBe('code-incorrect')
    expect(isOk(verifiedB)).toBe(true)
  })

  it('should error sending code if hourly limit is reached', async () => {
    const sendCodeHourlyLimit = 3
    const f = await Fixture({
      sendCodeHourlyLimit,
    })
    for (let i = 0; i < sendCodeHourlyLimit; i++) {
      await f.verifySMS.sendCode({
        ...f,
        phoneNumber: f.phoneNumber,
      })
    }
    const sent = await f.verifySMS.sendCode({
      ...f,
      phoneNumber: f.phoneNumber,
    })
    expect(sent.t).toBe('err')
    if (isErr(sent)) expect(sent.error.t).toBe('hourly-limit-reached')
  })

  it('should let user send code again after it has been over an hour after they hit the hourly limit', async () => {
    const sendCodeHourlyLimit = 3
    let now = UnixMs.now()
    const f = await Fixture({
      sendCodeHourlyLimit,
      now: () => now,
    })
    for (let i = 0; i < sendCodeHourlyLimit; i++) {
      await f.verifySMS.sendCode({
        ...f,
        phoneNumber: f.phoneNumber,
      })
    }
    now = UnixMs.future(now, TimeSpan.add(TimeSpan.hours(1), TimeSpan.milliseconds(1)))
    const sent = await f.verifySMS.sendCode({
      ...f,
      phoneNumber: f.phoneNumber,
    })
    expect(isOk(sent)).toBe(true)
  })

  it('should only apply hourly limit to a single phone number', async () => {
    const sendCodeHourlyLimit = 3

    const f = await Fixture({
      sendCodeHourlyLimit,
    })

    const phoneNumberA = unwrap(PhoneNumber.fromString('+1 480-209-8698'))
    const phoneNumberB = unwrap(PhoneNumber.fromString('+1 480-209-8699'))

    for (let i = 0; i < sendCodeHourlyLimit + 1; i++) {
      await f.verifySMS.sendCode({
        ...f,
        phoneNumber: phoneNumberA,
      })
    }
    const sent = await f.verifySMS.sendCode({
      ...f,
      phoneNumber: phoneNumberB,
    })
    expect(isOk(sent)).toBe(true)
  })

  it('should error sending code if daily limit is reached', async () => {
    const sendCodeDailyLimit = 3
    const f = await Fixture({
      sendCodeDailyLimit,
    })
    for (let i = 0; i < sendCodeDailyLimit; i++) {
      await f.verifySMS.sendCode({
        ...f,
        phoneNumber: f.phoneNumber,
      })
    }
    const sent = await f.verifySMS.sendCode({
      ...f,
      phoneNumber: f.phoneNumber,
    })
    expect(sent.t).toBe('err')
    if (isErr(sent)) expect(sent.error.t).toBe('daily-limit-reached')
  })

  it('should let user send code again after it has been over a day after they hit the daily limit', async () => {
    const sendCodeDailyLimit = 3
    let now = UnixMs.now()
    const f = await Fixture({
      sendCodeDailyLimit,
      now: () => now,
    })
    for (let i = 0; i < sendCodeDailyLimit; i++) {
      await f.verifySMS.sendCode({
        ...f,
        phoneNumber: f.phoneNumber,
      })
    }
    now = UnixMs.future(now, TimeSpan.add(TimeSpan.days(1), TimeSpan.milliseconds(1)))
    const sent = await f.verifySMS.sendCode({
      ...f,
      phoneNumber: f.phoneNumber,
    })
    expect(isOk(sent)).toBe(true)
  })

  it('should only apply daily limit to a single phone number', async () => {
    const sendCodeDailyLimit = 3

    const f = await Fixture({
      sendCodeDailyLimit,
    })

    const phoneNumberA = unwrap(PhoneNumber.fromString('+1 480-209-8698'))
    const phoneNumberB = unwrap(PhoneNumber.fromString('+1 480-209-8699'))
    for (let i = 0; i < sendCodeDailyLimit + 1; i++) {
      await f.verifySMS.sendCode({
        ...f,
        phoneNumber: phoneNumberA,
      })
    }
    const sent = await f.verifySMS.sendCode({
      ...f,
      phoneNumber: phoneNumberB,
    })
    expect(isOk(sent)).toBe(true)
  })

  it('should only allow verifications to be used once', async () => {
    const f = await Fixture()
    await f.verifySMS.sendCode({
      ...f,
      phoneNumber: f.phoneNumber,
    })
    const firstVerification = await f.verifySMS.verifyCode({
      phoneNumber: f.phoneNumber,
      code: f.CODE,
      preferredLanguage: 'en',
    })
    const secondVerification = await f.verifySMS.verifyCode({
      phoneNumber: f.phoneNumber,
      code: f.CODE,
      preferredLanguage: 'en',
    })
    expect(firstVerification.t).toBe('ok')
    expect(secondVerification.t).toBe('err')
    if (isErr(secondVerification)) expect(secondVerification.error.t).toBe('verification-already-verified')
  })

  it('should hash sent codes stored in the database', async () => {
    const f = await Fixture({
      hashing: Hashing({
        t: 'bun',
      }),
    })
    await f.verifySMS.sendCode({
      ...f,
      phoneNumber: f.phoneNumber,
    })
    const code = f.CODE
    const verification = await f.verifySMS.verifyCode({
      phoneNumber: f.phoneNumber,
      code,
      preferredLanguage: 'en',
    })

    const found = await f.verificationDb.find({
      where: {
        phoneNumber: {
          '=': f.phoneNumber,
        },
      },
      order: {
        createdAt: 'desc',
      },
      limit: 1,
      offset: 0,
    })

    const codeHash = unwrap(found).items[0]?.codeHash?.value

    expect(isOk(verification)).toBe(true)
    expect(codeHash).not.toEqual(code)
  })

  it('should return database error when database returns an error', async () => {
    const f = await Fixture({
      verificationDb: VerificationDb({
        t: 'always-err',
        error: 'some error',
      }),
    })
    const verification = await f.verifySMS.verifyCode({
      phoneNumber: f.phoneNumber,
      code: '123',
      preferredLanguage: 'en',
    })

    expect(verification.t).toBe('err')
    if (isErr(verification)) expect(verification.error.t).toBe('database-error')
  })
})
