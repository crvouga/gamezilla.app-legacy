import { QueryInput } from '~/@/db/interface/query-input/query-input'
import { Eff } from '~/@/eff'
import { Loading, RemoteResult } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { UserProfileId } from '~/app/@/data/user-profile-id'
import { Username } from '~/app/@/data/username'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { QueryCacheMsg, queryCacheMsgs } from '~/app/frontend/query-cache/query-cache-msgs'
import { AuthFrontendCtx } from '../@/frontend/ctx'
import { UserAccountDbQueryCache } from '../@/user-account/user-account-db-query-cache'
import { UserSession } from '../@/user-session/user-session'
import { UserSessionDbQueryCache } from '../@/user-session/user-session-db-query-cache'
import { ensureGuestRecords } from './ensure-guest-records-exists'
import { rpcContract } from './types'

export type ModelFrontend = {
  currentUser_status?: RemoteResult<string, null>
}

export type MsgFrontend = {
  t: 'gotQueryCacheMsg'
  c: QueryCacheMsg
}

type Ctx = AuthFrontendCtx & {
  rpc: RPC.Client<typeof rpcContract>
}

export const init = (input: { ctx: AuthFrontendCtx }): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  return {
    model: {
      currentUser_status: Loading,
    },
    async eff() {
      await ensureGuestRecords(input.ctx)
    },
  }
}

export const update = (input: {
  ctx: AuthFrontendCtx
  model: ModelFrontend
  msg: MsgFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  switch (input.msg.t) {
    case 'gotQueryCacheMsg': {
      const { c } = input.msg
      return {
        model: input.model,
        eff: () => {
          queryCacheMsgs.pub(c)
        },
      }
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
  return UserSessionDbQueryCache.subscribe(
    input.ctx.userSessionDb,
    toQueryUserSessionByClientSessionId(input.ctx),
    (c) => ({ t: 'gotQueryCacheMsg', c }),
  )
}

const subscriptionsUserAccount: typeof subscriptions = (input) => {
  const queryUserSession = toQueryUserSessionByClientSessionId(input.ctx)
  const userSessions = UserSessionDbQueryCache.query(input.ctx, queryUserSession)
  const userSession = userSessions[0]
  if (!userSession) return Sub.none()
  return UserAccountDbQueryCache.subscribe(
    input.ctx.userAccountDb,
    toQueryUserAccountByUserId({ userId: userSession.userId }),
    (c) => ({ t: 'gotQueryCacheMsg', c }),
  )
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
  const query = toQueryUserSessionByClientSessionId(input.ctx)
  const userSessions = UserSessionDbQueryCache.query(input.ctx, query)
  const isLoading = UserSessionDbQueryCache.isLoading(input.ctx, query)

  const maybeUserSession = userSessions.find((userSession) => userSession.clientSessionId === input.ctx.clientSessionId)

  if (!maybeUserSession) {
    if (isLoading) return { t: 'loading' }
    return { t: 'logged-out' }
  }

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
