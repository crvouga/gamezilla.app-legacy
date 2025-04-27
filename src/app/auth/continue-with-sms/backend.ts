import { PhoneNumber } from '~/@/phone-number'
import { Err, isErr, Ok } from '~/@/result'
import { RPC } from '~/@/rpc'
import { SessionId } from '~/@/wire/session-id'
import type { UserAccount } from '~/app/@/data/account'
import { UserId } from '~/app/@/data/user-id'
import { Translator } from '~/app/@/frontend/translator'
import { BackendCtx } from '../@/backend/ctx'
import { SendCodeInput, SendCodeOutput, VerifyCodeInput } from '../@/backend/verify-sms'
import { SendCodeProblem } from '../@/backend/verify-sms/send-code-problem'
import { VerifyCodeProblem } from '../@/backend/verify-sms/verify-code-problem'
import { rpcContract, VerifyCodeOutput } from './types'
import { UserSession } from '../@/user-session/user-session'
import { UserSessionId } from '../@/user-session/user-session-id'
import { Posix } from '~/@/time/posix'
import { ClientSessionId } from '~/@/wire/client-session-id'

const rpc = (config: { ctx: BackendCtx }) => {
  return RPC.initServer(rpcContract, {
    async sendCode(input) {
      const sent = await handleSendCode({
        phoneNumber: input.phoneNumber,
        preferredLanguage: input.preferredLanguage,
        ctx: config.ctx,
      })
      return sent
    },
    async verifyCode(input, reqCtx) {
      const verified = await handleVerifyCode({
        sessionId: reqCtx.sessionId,
        phoneNumber: input.phoneNumber,
        code: input.code,
        ctx: config.ctx,
        clientSessionId: reqCtx.clientSessionId,
      })

      return verified
    },
  })
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
    sessionId: SessionId
    ctx: BackendCtx
    clientSessionId: ClientSessionId
  },
): Promise<VerifyCodeOutput> => {
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
  const found = await input.ctx.userAccountDb.findOneByPhoneNumber({
    phoneNumber: input.phoneNumber,
  })

  if (isErr(found)) {
    input.ctx.logger.error(`Database error while looking up user: ${found.error}`)
    return Err({
      t: 'database-error',
      error: found.error,
    })
  }

  if (!found.value) {
    input.ctx.logger.info(`No existing account found for ${PhoneNumber.toString(input.phoneNumber)}`)
  }

  const accountNew: UserAccount = {
    createdAt: input.ctx.now,
    phoneNumber: input.phoneNumber,
    role: 'normal',
    userId: UserId.generate(),
  }

  const account: UserAccount = found.value ?? accountNew

  const inserted = found.value ? Ok(null) : await input.ctx.userAccountDb.insert(account)

  if (isErr(inserted)) {
    input.ctx.logger.error(`Failed to insert new account: ${inserted.error}`)
    return Err({ t: 'database-error', error: inserted.error })
  }

  input.ctx.logger.info(`Successfully created new account for ${PhoneNumber.toString(input.phoneNumber)}`)

  const userSessionNew: UserSession = {
    userSessionId: UserSessionId.generate(),
    sessionId: input.sessionId,
    clientSessionId: input.clientSessionId,
    userId: account.userId,
    createdAt: Posix.now(),
    endedAt: null,
  }

  const insertedSession = await input.ctx.userSessionDb.insert(userSessionNew)

  if (isErr(insertedSession)) {
    input.ctx.logger.error(`Failed to insert new session: ${insertedSession.error}`)
    return Err({ t: 'database-error', error: insertedSession.error })
  }

  return Ok({ userAccount: account, userSession: userSessionNew })
}

export const ContinueWithSmsBackend = {
  rpc,
}
