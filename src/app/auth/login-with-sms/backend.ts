import { PhoneNumber } from '~/@/phone-number'
import { Err, isErr, Ok } from '~/@/result'
import { RPC } from '~/@/rpc'
import { UnixMs } from '~/@/time/unix-ms'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { ProfileAvatar } from '~/app/@/data/profile-avatar'
import type { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { Username } from '~/app/@/data/username'
import { Translator } from '~/@/l18n/generated'
import { AuthBackendCtx } from '../@/backend/ctx'
import { SendCodeInput, SendCodeOutput, VerifyCodeInput } from '../@/backend/verify-sms'
import { SendCodeProblem } from '../@/backend/verify-sms/send-code-problem'
import { VerifyCodeProblem } from '../@/backend/verify-sms/verify-code-problem'
import { UserSession } from '../@/user-session/user-session'
import { UserSessionId } from '../@/user-session/user-session-id'
import { rpcContract, VerifyCodeOutput } from './types'
import { UserProfileId } from '~/app/@/data/user-profile-id'
import { ILogger } from '~/@/logger'

const rpc = (config: { ctx: AuthBackendCtx }) => {
  const logger = config.ctx.logger.child(['login-with-sms'])
  return RPC.initServer(rpcContract, {
    'auth/login-with-sms/send-code': async (input) => {
      const sent = await sendCode({ ...input, ctx: config.ctx, logger })
      return sent
    },
    'auth/login-with-sms/verify-code': async (input, reqCtx) => {
      const verified = await verifyCode({
        ...input,
        sessionId: reqCtx.sessionId,
        ctx: config.ctx,
        clientSessionId: reqCtx.clientSessionId,
        logger,
      })

      return verified
    },
  })
}

const sendCode = async (
  input: SendCodeInput & {
    ctx: AuthBackendCtx
    logger: ILogger
  },
): Promise<SendCodeOutput> => {
  const logger = input.logger.child(['send-code'])
  logger.info(`Sending code to ${PhoneNumber.toString(input.phoneNumber)}`)
  const sent = await input.ctx.verifySMS.sendCode({
    phoneNumber: input.phoneNumber,
    preferredLanguage: input.preferredLanguage,
  })

  if (isErr(sent)) {
    logger.error(
      `Failed to send code. ${SendCodeProblem.toString({
        problem: sent.error,
        t: Translator('en'),
      })}`,
    )
  } else {
    logger.info(`Successfully sent code to ${PhoneNumber.toString(input.phoneNumber)}`)
  }

  return sent
}

const verifyCode = async (
  input: VerifyCodeInput & {
    sessionId: SessionId
    ctx: AuthBackendCtx
    clientSessionId: ClientSessionId
    logger: ILogger
  },
): Promise<VerifyCodeOutput> => {
  const logger = input.logger.child(['verify-code'])

  logger.info(`Verifying code for phone number ${PhoneNumber.toString(input.phoneNumber)}`)

  const verified = await input.ctx.verifySMS.verifyCode(input)

  if (isErr(verified)) {
    logger.error(
      `Code verification failed: ${VerifyCodeProblem.toString({
        problem: verified.error,
        t: Translator('en'),
      })}`,
    )
    return verified
  }

  logger.info(`Code verification successful for ${PhoneNumber.toString(input.phoneNumber)}`)

  logger.info(`Looking up user account for ${PhoneNumber.toString(input.phoneNumber)}`)
  const foundAccount = await input.ctx.userAccountDb.findOneByPhoneNumber({
    phoneNumber: input.phoneNumber,
  })

  if (isErr(foundAccount)) {
    logger.error(`Database error while looking up user: ${foundAccount.error}`)
    return Err({
      t: 'database-error',
      error: foundAccount.error,
    })
  }

  if (!foundAccount.value) {
    logger.info(`No existing account found for ${PhoneNumber.toString(input.phoneNumber)}`)
  }

  const accountNew: UserAccount = {
    createdAt: input.ctx.now,
    phoneNumber: input.phoneNumber,
    role: 'normal',
    userId: UserId.generate(),
  }

  const account: UserAccount = foundAccount.value ?? accountNew

  const insertedAccount = foundAccount.value ? Ok(null) : await input.ctx.userAccountDb.upsert(account)

  if (isErr(insertedAccount)) {
    logger.error(`Failed to insert new account: ${insertedAccount.error}`)
    return Err({ t: 'database-error', error: insertedAccount.error })
  }

  logger.info(`Successfully created new account for ${PhoneNumber.toString(input.phoneNumber)}`)

  const foundProfiles = await input.ctx.userProfileDb.findByUserIds([account.userId])

  if (isErr(foundProfiles)) {
    logger.error(`Failed to find profile: ${foundProfiles.error}`)
    return Err({ t: 'database-error', error: foundProfiles.error })
  }

  const profileFound = foundProfiles.value[0] ?? null

  const profileNew: UserProfile = {
    id: UserProfileId.generate(),
    userId: account.userId,
    username: await Username.generate(),
    avatarSeed: ProfileAvatar.randomSeed(),
    avatarStyle: ProfileAvatar.randomStyle(),
    createdAt: input.ctx.now,
    updatedAt: input.ctx.now,
  }

  const profile: UserProfile = profileFound ?? profileNew

  const insertedProfile = profileFound ? Ok(null) : await input.ctx.userProfileDb.put(profile)

  if (isErr(insertedProfile)) {
    logger.error(`Failed to insert new profile: ${insertedProfile.error}`)
    return Err({ t: 'database-error', error: insertedProfile.error })
  }

  logger.info(`Successfully created new profile for ${PhoneNumber.toString(input.phoneNumber)}`)

  const userSessionNew: UserSession = {
    userSessionId: UserSessionId.generate(),
    sessionId: input.sessionId,
    clientSessionId: input.clientSessionId,
    userId: account.userId,
    createdAt: UnixMs.now(),
    endedAt: null,
  }

  const insertedSession = await input.ctx.userSessionDb.upsert({ entities: [userSessionNew] })

  if (isErr(insertedSession)) {
    logger.error(`Failed to insert new session: ${insertedSession.error}`)
    return Err({ t: 'database-error', error: insertedSession.error.message })
  }

  return Ok({ userAccount: account, userSession: userSessionNew })
}

export const LoginWithSMSBackend = {
  rpc,
  sendCode,
  verifyCode,
}
