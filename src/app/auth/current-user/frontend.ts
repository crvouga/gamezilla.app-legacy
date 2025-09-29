import { QueryInput } from '~/@/db/interface/query-input/query-input'
import { Eff } from '~/@/eff'
import { isAnyMsg } from '~/@/msg/msg'
import { Err, isErr, Ok, RemoteResult, Result } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { UserProfileId } from '~/app/@/data/user-profile-id'
import { Username } from '~/app/@/data/username'
import { andThen } from '~/app/@/frontend/and-then'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { AuthFrontendCtx } from '../@/frontend/ctx'
import { UserAccountDbQueryCache } from '../@/user-account/user-account-db-query-cache'
import { UserSession } from '../@/user-session/user-session'
import { UserSessionDbQueryCache } from '../@/user-session/user-session-db-query-cache'
import { UserSessionId } from '../@/user-session/user-session-id'
import { rpcContract } from './types'

export type ModelFrontend = {
  currentUser_status?: RemoteResult<string, null>
}

export type MsgFrontend = {
  t: 'currentUser_gotMsgOut'
  msgOut: unknown
}

export const isMsgFrontend = (msg: unknown): msg is MsgFrontend => {
  return isAnyMsg(msg) && msg.t.startsWith('currentUser_')
}

type Ctx = AuthFrontendCtx & {
  rpc: RPC.Client<typeof rpcContract>
}

export type CurrentUserState =
  | {
      t: 'loading'
    }
  | {
      t: 'logged-out'
    }
  | {
      t: 'logged-in'
      userAccount: UserAccount
      userSession: UserSession
      userProfile: UserProfile
    }

const toQueryUserSessionByClientSessionId = (input: { clientSessionId: ClientSessionId }): QueryInput<UserSession> => {
  return {
    where: {
      op: '=',
      column: 'clientSessionId',
      value: input.clientSessionId,
    },
    orderBy: [{ column: 'createdAt', direction: 'desc' }],
    limit: 10,
    offset: 0,
  }
}

const toQueryUserAccountByUserId = (input: { userId: UserId }): QueryInput<UserAccount> => {
  return {
    where: {
      op: '=',
      column: 'userId',
      value: input.userId,
    },
    orderBy: [{ column: 'createdAt', direction: 'desc' }],
    limit: 1,
    offset: 0,
  }
}

export const toCurrentUserState = (input: { model: ModelFrontend; ctx: AppFrontendCtxBase }): CurrentUserState => {
  const userSessions = UserSessionDbQueryCache.query(input.ctx, toQueryUserSessionByClientSessionId(input.ctx))
  if (userSessions.length > 0) {
    debugger
  }
  const maybeUserSession = userSessions.find((userSession) => userSession.clientSessionId === input.ctx.clientSessionId)

  if (!maybeUserSession) return { t: 'loading' }

  const userAccounts = UserAccountDbQueryCache.query(
    input.ctx,
    toQueryUserAccountByUserId({ userId: maybeUserSession.userId }),
  )

  const maybeUserAccount = userAccounts.find((userAccount) => userAccount.userId === maybeUserSession.userId)

  const userAccountFallback: UserAccount = {
    createdAt: input.ctx.now,
    phoneNumber: null,
    role: 'normal',
    userId: maybeUserSession.userId,
  }

  const userAccount: UserAccount = maybeUserAccount ?? userAccountFallback

  const maybeUserProfile = input.ctx.profilesByUserId[maybeUserSession.userId]

  const userProfile: UserProfile = maybeUserProfile ?? {
    id: UserProfileId.generate(),
    userId: maybeUserSession.userId,
    username: Username.of(''),
    avatarSeed: null,
    avatarStyle: null,
    createdAt: input.ctx.now,
    updatedAt: input.ctx.now,
  }

  return {
    t: 'logged-in',
    userSession: maybeUserSession,
    userAccount,
    userProfile,
  }
}

export const update = <T extends ModelFrontend>(input: {
  ctx: AuthFrontendCtx
  model: T
  msg?: unknown
}): {
  model: T
  eff?: Eff<MsgFrontend>
  msgOut?: unknown[]
} => {
  return andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => watchForLogin({ ...input, model, modelBefore: input.model, modelAfter: model }),
    (model) => {
      const flag = false
      if (flag) {
        return {
          model,
          async eff() {
            await ensureGuestRecords(input)
          },
        }
      }
      return { model: input.model }
    },
  )
}

const ensureGuestRecords = async (input: { ctx: AuthFrontendCtx }): Promise<Result<string, null>> => {
  const logger = input.ctx.logger.child(['ensure-guest-records'])
  logger.info('querying sessions')
  const sessions = await input.ctx.userSessionDb.query({
    where: {
      op: 'and',
      clauses: [
        {
          op: '=',
          column: 'clientSessionId',
          value: input.ctx.clientSessionId,
        },
        {
          op: '=',
          column: 'endedAt',
          value: null,
        },
      ],
    },
  })
  if (isErr(sessions)) {
    logger.error('error querying sessions', { error: sessions.error })
    return Err(sessions.error.message)
  }
  logger.info('found sessions', { count: sessions.value.entities.items.length })

  logger.info('querying guest accounts')
  const guestAccounts = await input.ctx.userAccountDb.query({
    where: {
      op: 'and',
      clauses: [
        {
          op: '=',
          column: 'role',
          value: 'guest',
        },
        {
          op: 'in',
          column: 'userId',
          value: sessions.value.entities.items.map((s) => s.userId),
        },
      ],
    },
  })
  if (isErr(guestAccounts)) {
    logger.error('error querying guest accounts', { error: guestAccounts.error })
    return Err(guestAccounts.error.message)
  }
  logger.info('found guest accounts', { count: guestAccounts.value.entities.items.length })

  const maybeGuestAccount = guestAccounts.value.entities.items.find((a) => a.role === 'guest')
  const newGuestAccount: UserAccount = {
    role: 'guest',
    userId: UserId.generate(),
    createdAt: input.ctx.now,
    phoneNumber: null,
  }
  const guestAccount: UserAccount = maybeGuestAccount ?? newGuestAccount
  logger.info('using guest account', { isNew: !maybeGuestAccount, userId: guestAccount.userId })

  const guestSessions = sessions.value.entities.items.filter((s) =>
    guestAccounts.value.entities.items.some((a) => a.userId === s.userId),
  )
  const maybeGuestSession = guestSessions[0]
  const newGuestSession: UserSession = {
    userSessionId: UserSessionId.generate(),
    sessionId: null,
    clientSessionId: input.ctx.clientSessionId,
    userId: guestAccount.userId,
    createdAt: input.ctx.now,
    endedAt: null,
  }
  const guestSession: UserSession = maybeGuestSession ?? newGuestSession
  logger.info('using guest session', { isNew: !maybeGuestSession, sessionId: guestSession.userSessionId })

  logger.info('upserting records')
  await input.ctx.userSessionDb.upsert({ entities: [guestSession] })
  await input.ctx.userAccountDb.upsert({ entities: [guestAccount] })
  logger.info('finished upserting records')

  return Ok(null)
}

const watchForLogin = <T extends ModelFrontend>(input: {
  ctx: AuthFrontendCtx
  model: T
  modelBefore: T
  modelAfter: T
}): {
  model: T
  msgOut?: unknown[]
} => {
  const before = toCurrentUserState({ model: input.modelBefore, ctx: input.ctx })
  const after = toCurrentUserState({ model: input.modelAfter, ctx: input.ctx })
  if (before.t === 'logged-out' && after.t === 'logged-in') {
    return {
      model: input.modelAfter,
      msgOut: [
        PushScreenCmd.init({ n: 'spaces', t: 'space-list' }, false),
        PlaySoundCmd.init(APP_SOUND.celebration),
        ShowToastCmd.init(input.ctx.t('auth.logged-in')),
      ],
    }
  }

  if (before.t === 'logged-in' && after.t === 'logged-out') {
    return {
      model: input.modelAfter,
      msgOut: [
        ShowToastCmd.init(input.ctx.t('auth.current-user-logged-out')),
        PlaySoundCmd.init(APP_SOUND.navBackwardMin),
        PushScreenCmd.init({ t: 'login', n: 'auth' }, false),
      ],
    }
  }

  return { model: input.modelAfter }
}

const updateFromMsg: typeof update = (input) => {
  const { msg } = input
  if (!isMsgFrontend(msg)) return { model: input.model }
  switch (msg.t) {
    case 'currentUser_gotMsgOut': {
      return { model: input.model, msgOut: [msg.msgOut] }
    }
    default: {
      return { model: input.model }
    }
  }
}

export const subscriptions = (input: { ctx: Ctx; model: ModelFrontend }): Sub<MsgFrontend> => {
  return Sub.batch<MsgFrontend>([subscriptionsUserSession(input), subscriptionsUserAccount(input)])
}

const subscriptionsUserSession: typeof subscriptions = (input) => {
  return UserSessionDbQueryCache.watch(
    input.ctx.userSessionDb,
    toQueryUserSessionByClientSessionId(input.ctx),
    (msgOut) => ({ t: 'currentUser_gotMsgOut', msgOut }),
  )
}

const subscriptionsUserAccount: typeof subscriptions = (input) => {
  const queryUserSession = toQueryUserSessionByClientSessionId(input.ctx)
  const userSessions = UserSessionDbQueryCache.query(input.ctx, queryUserSession)
  const userSession = userSessions[0]
  if (!userSession) return Sub.none()
  return UserAccountDbQueryCache.watch(
    input.ctx.userAccountDb,
    toQueryUserAccountByUserId({ userId: userSession.userId }),
    (msgOut) => ({ t: 'currentUser_gotMsgOut', msgOut }),
  )
}
