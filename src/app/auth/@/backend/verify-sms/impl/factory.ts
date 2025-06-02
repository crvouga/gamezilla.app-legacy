import { SqlDb } from '~/@/sql-db'
import { Hashing } from '~/@/hashing'
import { ILogger, Logger } from '~/@/logger'
import { SMS } from '~/@/sms'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { Env } from '~/app/@/data/env'
import { Translator } from '~/app/@/frontend/translator'
import { VerificationAttemptDb } from './impl-in-house/verification-attempt'
import { VerificationCodeGenerator } from './impl-in-house/verification-code-generator'
import { VerificationDb } from './impl-in-house/verification/verification-db'
import type { IVerifySMS } from '../interface'
import { VerifySMS } from './impl'

/**
 * Factory for creating VerifySMS implementations
 */
export const VerifySMSFactory = {
  /**
   * Creates an in-house implementation of VerifySMS
   */
  createInHouse: (config: { logger: ILogger; dbConnSql: SqlDb }): IVerifySMS => {
    const logger = Logger.prefix('verify-sms', config.logger)
    const hashing = Hashing({ t: 'bun' })
    const sms = SMS({ t: 'fake', logger })
    const verificationCodeGenerator = VerificationCodeGenerator({ t: 'fake', code: '123' })
    const verificationAttemptDb = VerificationAttemptDb({ t: 'postgres', dbConnSql: config.dbConnSql })
    const verificationDb = VerificationDb({ t: 'postgres', dbConnSql: config.dbConnSql })
    return VerifySMS({
      t: 'in-house',
      logger,
      hashing,
      now: Posix.now,
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
    const logger = Logger.prefix('verify-sms', config.logger)
    const hashing = Hashing({ t: 'bun' })
    const sms = SMS({ t: 'fake', logger })
    const verificationCodeGenerator = VerificationCodeGenerator({ t: 'fake', code: '123' })
    const verificationAttemptDb = VerificationAttemptDb({ t: 'hash-map' })
    const verificationDb = VerificationDb({ t: 'hash-map' })
    return VerifySMS({
      t: 'in-house',
      logger,
      hashing,
      now: Posix.now,
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
  createTwilio: (config: { logger: ILogger }): IVerifySMS => {
    const logger = Logger.prefix('verify-sms', config.logger)
    return VerifySMS({ t: 'twilio', logger })
  },

  /**
   * Creates the appropriate VerifySMS implementation based on environment
   */
  createForEnvironment: (config: { logger: ILogger; env: Env; dbConnSql: SqlDb }): IVerifySMS => {
    switch (config.env) {
      case 'prod': {
        return VerifySMSFactory.createTwilio(config)
      }
      case 'test': {
        return VerifySMSFactory.createInHouse(config)
      }
      case 'dev': {
        return VerifySMSFactory.createInHouse(config)
      }
    }
  },
}
