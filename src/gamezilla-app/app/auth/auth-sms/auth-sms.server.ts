import { Err, Ok, PhoneNumber, Posix, Sub, TimeSpan, isErr, type Task } from 'gamezilla-app/@/core'
import { Hashing } from 'gamezilla-app/@/hashing'
import { AppServerModule } from 'gamezilla-app/app/@/architecture/app-server'
import { Translator } from 'gamezilla-app/app/@/client/translator'
import { UserId } from 'gamezilla-app/app/@/data'
import type { UserAccount } from 'gamezilla-app/app/@/data/account'
import { sendToClient } from 'gamezilla-app/app/@/server'
import { Logger } from 'gamezilla-app/app/@/server/logger'
import { SMS } from 'gamezilla-app/app/@/server/sms'
import type { IUserAccountDb } from '../@/server/user-account-db'
import { UserAccountDb } from '../@/server/user-account-db/impl'
import type { ServerModule } from './auth-sms.types'
import { VerificationAttemptDb } from './verify-sms/verification-attempt'
import { VerificationCodeGenerator } from './verify-sms/verification-code-generator'
import { VerificationDb } from './verify-sms/verification/verification-db'
import { verifyCodeProblemToString, type IVerifySMS, type VerifyCodeProblem } from './verify-sms/verify-sms'
import { VerifySMS } from './verify-sms/verify-sms-impl/verify-sms-impl'

//
//
//
//
//
//

const initDeps: ServerModule['initDeps'] = async ({ ctx }) => {
  const accountDb = UserAccountDb({ t: 'postgres', dbConnSql: ctx.dbConnSql })
  const verificationDb = VerificationDb({ t: 'postgres', dbConnSql: ctx.dbConnSql })
  const verificationAttemptDb = VerificationAttemptDb({ t: 'postgres', dbConnSql: ctx.dbConnSql })
  const hashing = Hashing({ t: 'bun' })
  const verificationCodeGenerator = VerificationCodeGenerator({ t: 'fake', code: '123' })
  const sms = SMS({ t: 'fake', logger: Logger.prefix('sms', ctx.logger) })
  const verifySMSTwilio = VerifySMS({ t: 'twilio', logger: Logger.prefix('twilio-verify', ctx.logger) })
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
    verificationCodeGenerator
  })
  const verifySMS = ctx.env === 'prod' ? verifySMSTwilio : verifySMSInHouse
  return {
    AccountDb: accountDb,
    VerifySMS: verifySMS
  }
}

//
//
//
//
//
//
//

const update: ServerModule['update'] = async (input) => {
  return AppServerModule.andThen(
    {},
    () => updateSendCode(input),
    () => updateVerifyCode(input)
  )
}

const updateSendCode: ServerModule['update'] = async ({ msgClient, deps }) => {
  switch (msgClient?.t) {
    case 'user-clicked-send-code-button': {
      const sent = await deps.VerifySMS.sendCode(msgClient)
      return {
        msgCmd: [
          sendToClient([msgClient.clientId], {
            t: 'sent-code',
            phoneNumber: msgClient.phoneNumber,
            sent
          })
        ]
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
    phoneNumber: input.phoneNumber
  })

  if (isErr(verified)) {
    return verified
  }

  const found = await input.AccountDb.findOneByPhoneNumber({
    phoneNumber: input.phoneNumber
  })

  if (isErr(found)) {
    return Err({
      t: 'database-error',
      error: found.error
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
    userId: UserId.generate()
  }

  const inserted = await input.AccountDb.insert({
    account: accountNew
  })

  if (isErr(inserted)) {
    return Err({
      t: 'database-error',
      error: inserted.error
    })
  }

  return Ok(accountNew)
}

const updateVerifyCode: ServerModule['update'] = async ({ msgClient, deps, ctx }) => {
  switch (msgClient?.t) {
    case 'user-clicked-verify-code-button': {
      ctx.logger.info(`Verifying code for ${PhoneNumber.toString(msgClient.phoneNumber)}`)
      const verified = await handleVerifyCode({
        AccountDb: deps.AccountDb,
        VerifySMS: deps.VerifySMS,
        now: ctx.now,
        phoneNumber: msgClient.phoneNumber,
        inputtedCode: msgClient.inputtedCode
      })
      ctx.logger.info(`Verified code for ${PhoneNumber.toString(msgClient.phoneNumber)}`)

      if (isErr(verified)) {
        ctx.logger.error(
          `Failed to verify code. ${verifyCodeProblemToString({
            problem: verified.error,
            t: Translator('en')
          })}`
        )
        return {
          msgCmd: [
            sendToClient(msgClient, {
              t: 'verified-code',
              verified
            })
          ]
        }
      }

      return {
        msgCmd: [
          sendToClient(msgClient, {
            t: 'verified-code',
            verified
          })
        ],
        msgEvt: [
          {
            ...msgClient,
            t: 'auth/client-authenticated',
            account: verified.value,
            loggedIn: true
          }
        ]
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

const subscriptions: ServerModule['subscriptions'] = async () => {
  return Sub.None
}

//
//
//
//
//
//
//

export const AuthSMSServer = {
  initDeps,
  update,
  subscriptions
}
