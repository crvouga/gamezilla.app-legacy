import { Hashing } from '~/@/hashing'
import { ILogger } from '~/@/logger'
import { SecretString } from '~/@/secrets/secret-string'
import { SMS } from '~/@/sms'
import { ISqlDb } from '~/@/sql-db'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { BackendRole } from '~/app/@/backend/backend-role'
import { Env } from '~/app/@/data/env'
import { Translator } from '~/app/@/frontend/translator'
import { CONFIG_BACKEND } from '~/config/backend'
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
  createInHouse: (config: { logger: ILogger; sqlDb: ISqlDb }): IVerifySMS => {
    const logger = config.logger.child(['verify-sms'])
    const hashing = Hashing({ t: 'bun' })
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
  createInHouseUnitTest: (config: { logger: ILogger }): IVerifySMS => {
    const logger = config.logger.child(['verify-sms'])
    const hashing = Hashing({ t: 'bun' })
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
  createForEnvironment: (config: {
    logger: ILogger
    backendRole: BackendRole
    env: Env
    sqlDb: ISqlDb
  }): IVerifySMS => {
    if (config.backendRole === 'edge') {
      config.logger.info('Using fake verify SMS for edge backend')
      return VerifySMS({ t: 'fake', logger: config.logger })
    }

    if (config.backendRole === 'primary' && config.env === 'prod') {
      config.logger.info('Using Twilio for production and primary backend')
      return VerifySMSFactory.createTwilio({
        logger: config.logger,
        twilioAccountSid: CONFIG_BACKEND.TWILIO_ACCOUNT_SID(),
        twilioAuthToken: CONFIG_BACKEND.TWILIO_AUTH_TOKEN(),
        twilioMessagingServiceSid: CONFIG_BACKEND.TWILIO_MESSAGING_SERVICE_SID(),
      })
    }

    config.logger.info('Using fake for non-production and primary backend')
    return VerifySMSFactory.createInHouseUnitTest({ logger: config.logger })
  },
}
