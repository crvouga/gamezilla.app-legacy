import { Hashing } from '~/@/hashing'
import { Translator } from '~/@/l18n/generated'
import { ILogger } from '~/@/logger'
import { SecretString } from '~/@/secrets/secret-string'
import { SMS } from '~/@/sms'
import { ISqlDb } from '~/@/sql-db/interface'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Env } from '~/app/@/data/env'
import type { IVerifySMS } from '../interface'
import { VerifySMS } from './impl'
import { VerificationAttemptDb } from './impl-in-house/verification-attempt'
import { VerificationCodeGenerator } from './impl-in-house/verification-code-generator'
import { VerificationDb } from './impl-in-house/verification/verification-db'

/**
 * Factory for creating VerifySMS implementations
 */
export const VerifySMSFactory = {
  /**
   * Creates an in-house implementation of VerifySMS
   */
  createInHouse: async (config: { logger: ILogger; sqlDb: ISqlDb }): Promise<IVerifySMS> => {
    const logger = config.logger.child(['verify-sms'])
    const hashing = await Hashing({ t: 'node' })
    const sms = SMS({ t: 'fake', logger })
    const verificationCodeGenerator = VerificationCodeGenerator({ t: 'fake', code: '123' })
    const verificationAttemptDb = VerificationAttemptDb({ t: 'sql-db', sqlDb: config.sqlDb })
    const verificationDb = VerificationDb({ t: 'sql-db', sqlDb: config.sqlDb })
    return VerifySMS({
      t: 'in-house',
      logger,
      hashing,
      now: UnixMs.now,
      sendCodeDailyLimit: 1000,
      sendCodeHourlyLimit: 100,
      verificationAttemptDb,
      verificationDb,
      verifyCodeExpiresIn: TimeSpan.minutes(5),
      verifyCodeMaxAttempts: 3,
      sms,
      Translator,
      verificationCodeGenerator,
    })
  },

  /**
   * Creates an in-house implementation of VerifySMS
   */
  createInHouseUnitTest: async (config: { logger: ILogger }): Promise<IVerifySMS> => {
    const logger = config.logger.child(['verify-sms'])
    const hashing = await Hashing({ t: 'node' })
    const sms = SMS({ t: 'fake', logger })
    const verificationCodeGenerator = VerificationCodeGenerator({ t: 'fake', code: '123' })
    const verificationAttemptDb = VerificationAttemptDb({ t: 'hash-map' })
    const verificationDb = VerificationDb({ t: 'hash-map' })
    return VerifySMS({
      t: 'in-house',
      logger,
      hashing,
      now: UnixMs.now,
      sendCodeDailyLimit: 1000,
      sendCodeHourlyLimit: 100,
      verificationAttemptDb,
      verificationDb,
      verifyCodeExpiresIn: TimeSpan.minutes(5),
      verifyCodeMaxAttempts: 3,
      sms,
      Translator,
      verificationCodeGenerator,
    })
  },

  /**
   * Creates a Twilio implementation of VerifySMS
   */
  createTwilio: (config: {
    logger: ILogger
    twilioAccountSid: string
    twilioAuthToken: SecretString
    twilioMessagingServiceSid: string
  }): IVerifySMS => {
    const logger = config.logger.child(['verify-sms'])
    return VerifySMS({
      t: 'twilio',
      logger,
      twilioAccountSid: config.twilioAccountSid,
      twilioAuthToken: config.twilioAuthToken,
      twilioMessagingServiceSid: config.twilioMessagingServiceSid,
    })
  },

  /**
   * Creates the appropriate VerifySMS implementation based on environment
   */
  createForEnvironment: async (config: {
    logger: ILogger

    env: Env
    sqlDb: ISqlDb
  }): Promise<IVerifySMS> => {
    if (config.env === 'prod') {
      config.logger.info('Using Twilio for production')

      const TWILIO_ACCOUNT_SID = process.env?.TWILIO_ACCOUNT_SID!
      if (!TWILIO_ACCOUNT_SID) throw new Error('TWILIO_ACCOUNT_SID is not set')

      const TWILIO_AUTH_TOKEN = SecretString.init('TWILIO_AUTH_TOKEN', process.env?.TWILIO_AUTH_TOKEN)!
      if (!TWILIO_AUTH_TOKEN) throw new Error('TWILIO_AUTH_TOKEN is not set')

      const TWILIO_MESSAGING_SERVICE_SID = process.env?.TWILIO_MESSAGING_SERVICE_SID!
      if (!TWILIO_MESSAGING_SERVICE_SID) throw new Error('TWILIO_MESSAGING_SERVICE_SID is not set')

      return VerifySMSFactory.createTwilio({
        logger: config.logger,
        twilioAccountSid: TWILIO_ACCOUNT_SID,
        twilioAuthToken: TWILIO_AUTH_TOKEN,
        twilioMessagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
      })
    }

    config.logger.info('Using fake for non-production')
    return await VerifySMSFactory.createInHouseUnitTest({ logger: config.logger })
  },
}
