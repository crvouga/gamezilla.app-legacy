import { PhoneNumber } from '~/@/phone-number'
import { Err, isErr, Ok } from '~/@/result'
import { RPC } from '~/@/rpc'
import { UnixMs } from '~/@/time/posix'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { ProfileAvatar } from '~/app/@/data/profile-avatar'
import type { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { Username } from '~/app/@/data/username'
import { Translator } from '~/app/@/frontend/translator'
import { AuthBackendCtx } from '../@/backend/ctx'
import { SendCodeInput, SendCodeOutput, VerifyCodeInput } from '../@/backend/verify-sms'
import { SendCodeProblem } from '../@/backend/verify-sms/send-code-problem'
import { VerifyCodeProblem } from '../@/backend/verify-sms/verify-code-problem'
import { UserSession } from '../@/user-session/user-session'
import { UserSessionId } from '../@/user-session/user-session-id'
import { rpcContract, VerifyCodeOutput } from './types'

const rpc = (config: { ctx: AuthBackendCtx }) => {
  return RPC.initServer(rpcContract, {
    'auth/login-with-sms/send-code': async (input) => {
      const sent = await sendCode({ ...input, ctx: config.ctx })
      return sent
    },
    'auth/login-with-sms/verify-code': async (input, reqCtx) => {
      const verified = await verifyCode({
        ...input,
        sessionId: reqCtx.sessionId,
        ctx: config.ctx,
        clientSessionId: reqCtx.clientSessionId,
      })

      return verified
    },
  })
}

const sendCode = async (
  input: SendCodeInput & {
    ctx: AuthBackendCtx
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

const verifyCode = async (
  input: VerifyCodeInput & {
    sessionId: SessionId
    ctx: AuthBackendCtx
    clientSessionId: ClientSessionId
  },
): Promise<VerifyCodeOutput> => {
  input.ctx.logger.info(`Verifying code for phone number ${PhoneNumber.toString(input.phoneNumber)}`)

  const verified = await input.ctx.verifySMS.verifyCode(input)

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
  const foundAccount = await input.ctx.userAccountDb.findOneByPhoneNumber({
    phoneNumber: input.phoneNumber,
  })

  if (isErr(foundAccount)) {
    input.ctx.logger.error(`Database error while looking up user: ${foundAccount.error}`)
    return Err({
      t: 'database-error',
      error: foundAccount.error,
    })
  }

  if (!foundAccount.value) {
    input.ctx.logger.info(`No existing account found for ${PhoneNumber.toString(input.phoneNumber)}`)
  }

  const accountNew: UserAccount = {
    createdAt: input.ctx.now,
    phoneNumber: input.phoneNumber,
    role: 'normal',
    userId: UserId.generate(),
  }

  const account: UserAccount = foundAccount.value ?? accountNew

  const insertedAccount = foundAccount.value ? Ok(null) : await input.ctx.userAccountDb.insert(account)

  if (isErr(insertedAccount)) {
    input.ctx.logger.error(`Failed to insert new account: ${insertedAccount.error}`)
    return Err({ t: 'database-error', error: insertedAccount.error })
  }

  input.ctx.logger.info(`Successfully created new account for ${PhoneNumber.toString(input.phoneNumber)}`)

  const foundProfiles = await input.ctx.userProfileDb.findByUserIds([account.userId])

  if (isErr(foundProfiles)) {
    input.ctx.logger.error(`Failed to find profile: ${foundProfiles.error}`)
    return Err({ t: 'database-error', error: foundProfiles.error })
  }

  const profileFound = foundProfiles.value[0] ?? null

  const profileNew: UserProfile = {
    id: account.userId,
    username: await Username.generate(),
    avatarSeed: ProfileAvatar.randomSeed(),
    avatarStyle: ProfileAvatar.randomStyle(),
    createdAt: input.ctx.now,
    updatedAt: input.ctx.now,
  }

  const profile: UserProfile = profileFound ?? profileNew

  const insertedProfile = profileFound ? Ok(null) : await input.ctx.userProfileDb.put(profile)

  if (isErr(insertedProfile)) {
    input.ctx.logger.error(`Failed to insert new profile: ${insertedProfile.error}`)
    return Err({ t: 'database-error', error: insertedProfile.error })
  }

  input.ctx.logger.info(`Successfully created new profile for ${PhoneNumber.toString(input.phoneNumber)}`)

  const userSessionNew: UserSession = {
    userSessionId: UserSessionId.generate(),
    sessionId: input.sessionId,
    clientSessionId: input.clientSessionId,
    userId: account.userId,
    createdAt: UnixMs.now(),
    endedAt: null,
  }

  const insertedSession = await input.ctx.userSessionDb.insert(userSessionNew)

  if (isErr(insertedSession)) {
    input.ctx.logger.error(`Failed to insert new session: ${insertedSession.error}`)
    return Err({ t: 'database-error', error: insertedSession.error })
  }

  return Ok({ userAccount: account, userSession: userSessionNew })
}

export const LoginWithSMSBackend = {
  rpc,
  sendCode,
  verifyCode,
}
