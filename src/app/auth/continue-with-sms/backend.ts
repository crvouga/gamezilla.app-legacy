import { PhoneNumber } from '~/@/phone-number'
import { Err, Ok, Result, isErr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { AppBackendCtx } from '~/app/@/backend/ctx'
import type { UserAccount } from '~/app/@/data/account'
import { UserId } from '~/app/@/data/user-id'
import { Translator } from '~/app/@/frontend/translator'
import { UserAccountDb } from '../@/backend/user-account-db/impl'
import { BackendCtx, rpcContract } from './types'
import { SendCodeInput, SendCodeOutput, VerifyCodeInput } from '../@/backend/verify-sms'
import { VerifySMSFactory } from '../@/backend/verify-sms/impl/factory'
import { SendCodeProblem } from '../@/backend/verify-sms/send-code-problem'
import { VerifyCodeProblem } from '../@/backend/verify-sms/verify-code-problem'

const initCtx = (input: { ctx: AppBackendCtx }): BackendCtx => {
  const accountDb = UserAccountDb({ t: 'postgres', dbConnSql: input.ctx.dbConnSql })
  const verifySMS = VerifySMSFactory.createForEnvironment({
    logger: input.ctx.logger,
    env: input.ctx.env,
    dbConnSql: input.ctx.dbConnSql,
  })

  return {
    ...input.ctx,
    accountDb: accountDb,
    verifySMS: verifySMS,
  }
}

const handleSendCode = async (
  input: SendCodeInput & {
    ctx: BackendCtx
  },
): Promise<SendCodeOutput> => {
  input.ctx.logger.info(`Sending code to ${PhoneNumber.toString(input.phoneNumber)}`)
  const sent = await input.ctx.verifySMS.sendCode({
    phoneNumber: input.phoneNumber,
    preferredLanguage: input.preferredLanguage,
  })

  if (isErr(sent)) {
    input.ctx.logger.error(
      `Failed to send code. ${SendCodeProblem.toString({
        problem: sent.error,
        t: Translator('en'),
      })}`,
    )
  } else {
    input.ctx.logger.info(`Successfully sent code to ${PhoneNumber.toString(input.phoneNumber)}`)
  }

  return sent
}

const handleVerifyCode = async (
  input: VerifyCodeInput & {
    ctx: BackendCtx
  },
): Promise<Result<VerifyCodeProblem, UserAccount>> => {
  input.ctx.logger.info(`Verifying code for phone number ${PhoneNumber.toString(input.phoneNumber)}`)

  const verified = await input.ctx.verifySMS.verifyCode({
    code: input.code,
    phoneNumber: input.phoneNumber,
  })

  if (isErr(verified)) {
    input.ctx.logger.error(
      `Code verification failed: ${VerifyCodeProblem.toString({
        problem: verified.error,
        t: Translator('en'),
      })}`,
    )
    return verified
  }

  input.ctx.logger.info(`Code verification successful for ${PhoneNumber.toString(input.phoneNumber)}`)

  input.ctx.logger.info(`Looking up user account for ${PhoneNumber.toString(input.phoneNumber)}`)
  const found = await input.ctx.accountDb.findOneByPhoneNumber({
    phoneNumber: input.phoneNumber,
  })

  if (isErr(found)) {
    input.ctx.logger.error(`Database error while looking up user: ${found.error}`)
    return Err({
      t: 'database-error',
      error: found.error,
    })
  }

  const accountFound = found.value

  if (accountFound) {
    input.ctx.logger.info(`Found existing account for ${PhoneNumber.toString(input.phoneNumber)}`)
    return Ok(accountFound)
  }

  input.ctx.logger.info(`Creating new account for ${PhoneNumber.toString(input.phoneNumber)}`)
  const accountNew: UserAccount = {
    createdAt: input.ctx.now,
    phoneNumber: input.phoneNumber,
    role: 'normal',
    userId: UserId.generate(),
  }

  const inserted = await input.ctx.accountDb.insert({
    account: accountNew,
  })

  if (isErr(inserted)) {
    input.ctx.logger.error(`Failed to insert new account: ${inserted.error}`)
    return Err({
      t: 'database-error',
      error: inserted.error,
    })
  }

  input.ctx.logger.info(`Successfully created new account for ${PhoneNumber.toString(input.phoneNumber)}`)
  return Ok(accountNew)
}

const rpc = (config: { ctx: BackendCtx }) => {
  return RPC.initServer(rpcContract, {
    sendCode: async (input) => {
      const sent = await handleSendCode({
        phoneNumber: input.phoneNumber,
        preferredLanguage: input.preferredLanguage,
        ctx: config.ctx,
      })
      return sent
    },
    verifyCode: async (input) => {
      const verified = await handleVerifyCode({
        phoneNumber: input.phoneNumber,
        code: input.code,
        ctx: config.ctx,
      })
      return verified
    },
  })
}

export const ContinueWithSmsBackend = {
  initCtx,
  rpc,
}
