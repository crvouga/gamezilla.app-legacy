import { Hashing } from '~/@/hashing'
import { Logger } from '~/@/logger'
import { PhoneNumber } from '~/@/phone-number'
import { Task } from '~/@/promise/task'
import { Err, Ok, isErr } from '~/@/result'
import { SMS } from '~/@/sms'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { Translator } from '~/app/@/frontend/translator'
import type { UserAccount } from '~/app/@/data/account'
import { UserId } from '~/app/@/data/user-id'
import { sendToFrontend } from '~/app/@/backend/cmd'
import type { IUserAccountDb } from '../@/backend/user-account-db'
import { UserAccountDb } from '../@/backend/user-account-db/impl'
import type { BackendModule } from './types'
import { VerifySMS } from './verify-sms/impl/impl'
import { verifyCodeProblemToString, type IVerifySMS, type VerifyCodeProblem } from './verify-sms/interface'
import { VerificationAttemptDb } from './verify-sms/verification-attempt'
import { VerificationCodeGenerator } from './verify-sms/verification-code-generator'
import { VerificationDb } from './verify-sms/verification/verification-db'

//
//
//
//
//
//

const initDeps: BackendModule['initDeps'] = async ({ ctx }) => {
  const logger = Logger.prefix('auth-sms', ctx.logger)
  const accountDb = UserAccountDb({ t: 'postgres', dbConnSql: ctx.dbConnSql })
  const verificationDb = VerificationDb({ t: 'postgres', dbConnSql: ctx.dbConnSql })
  const verificationAttemptDb = VerificationAttemptDb({ t: 'postgres', dbConnSql: ctx.dbConnSql })
  const hashing = Hashing({ t: 'bun' })
  const verificationCodeGenerator = VerificationCodeGenerator({ t: 'fake', code: '123' })
  const sms = SMS({ t: 'fake', logger })
  const verifySMSInHouse = VerifySMS({
    t: 'in-house',
    logger: ctx.logger,
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
  const verifySMSTwilio = VerifySMS({ t: 'twilio', logger })
  const verifySMS = ctx.env === 'prod' ? verifySMSTwilio : verifySMSInHouse
  return {
    AccountDb: accountDb,
    VerifySMS: verifySMS,
  }
}

//
//
//
//
//
//
//

const update: BackendModule['update'] = async (input) => {
  return AppBackendModule.andThen(
    {},
    () => updateSendCode(input),
    () => updateVerifyCode(input),
  )
}

const updateSendCode: BackendModule['update'] = async ({ msgFrontend, deps }) => {
  switch (msgFrontend?.t) {
    case 'user-clicked-send-code-button': {
      const sent = await deps.VerifySMS.sendCode(msgFrontend)
      return {
        msgCmd: [
          sendToFrontend([msgFrontend.frontendId], {
            t: 'sent-code',
            phoneNumber: msgFrontend.phoneNumber,
            sent,
          }),
        ],
      }
    }
    default: {
      return {}
    }
  }
}

const handleVerifyCode = async (input: {
  now: Posix
  phoneNumber: PhoneNumber
  inputtedCode: string
  AccountDb: IUserAccountDb
  VerifySMS: IVerifySMS
}): Task<VerifyCodeProblem, UserAccount> => {
  const verified = await input.VerifySMS.verifyCode({
    code: input.inputtedCode,
    phoneNumber: input.phoneNumber,
  })

  if (isErr(verified)) {
    return verified
  }

  const found = await input.AccountDb.findOneByPhoneNumber({
    phoneNumber: input.phoneNumber,
  })

  if (isErr(found)) {
    return Err({
      t: 'database-error',
      error: found.error,
    })
  }

  const accountFound = found.value

  if (accountFound) {
    return Ok(accountFound)
  }

  const accountNew: UserAccount = {
    createdAt: input.now,
    phoneNumber: input.phoneNumber,
    role: 'normal',
    userId: UserId.generate(),
  }

  const inserted = await input.AccountDb.insert({
    account: accountNew,
  })

  if (isErr(inserted)) {
    return Err({
      t: 'database-error',
      error: inserted.error,
    })
  }

  return Ok(accountNew)
}

const updateVerifyCode: BackendModule['update'] = async ({ msgFrontend, deps, ctx }) => {
  switch (msgFrontend?.t) {
    case 'user-clicked-verify-code-button': {
      ctx.logger.info(`Verifying code for ${PhoneNumber.toString(msgFrontend.phoneNumber)}`)
      const verified = await handleVerifyCode({
        AccountDb: deps.AccountDb,
        VerifySMS: deps.VerifySMS,
        now: ctx.now,
        phoneNumber: msgFrontend.phoneNumber,
        inputtedCode: msgFrontend.inputtedCode,
      })
      ctx.logger.info(`Verified code for ${PhoneNumber.toString(msgFrontend.phoneNumber)}`)

      if (isErr(verified)) {
        ctx.logger.error(
          `Failed to verify code. ${verifyCodeProblemToString({
            problem: verified.error,
            t: Translator('en'),
          })}`,
        )
        return {
          msgCmd: [
            sendToFrontend(msgFrontend, {
              t: 'verified-code',
              verified,
            }),
          ],
        }
      }

      return {
        msgCmd: [
          sendToFrontend(msgFrontend, {
            t: 'verified-code',
            verified,
          }),
        ],
        msgEvt: [
          {
            ...msgFrontend,
            t: 'auth-evt.frontend-authenticated',
            user: verified.value,
            loggedIn: true,
          },
        ],
      }
    }

    default: {
      return {}
    }
  }
}

//
//
//
//
//
//

const subscriptions: BackendModule['subscriptions'] = async () => {
  return Sub.None
}

//
//
//
//
//
//
//

export const AuthSMSBackend = {
  initDeps,
  update,
  subscriptions,
}
