import { QueryInput } from '~/@/db/interface/query-input/query-input'
import { NotAsked } from '~/@/result'
import { Sub } from '~/@/sub'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { UserProfileId } from '~/app/@/data/user-profile-id'
import { Username } from '~/app/@/data/username'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { AuthFrontendCtx } from '../@/frontend/ctx'
import { UserAccountDbQueryCache } from '../@/user-account/user-account-db-query-cache'
import { UserSession } from '../@/user-session/user-session'
import { UserSessionDbQueryCache } from '../@/user-session/user-session-db-query-cache'
import { FrontendModule, ModelFrontend, MsgFrontend } from './types'

const init: ModelFrontend = {
  status: NotAsked,
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

export const toCurrentUserState = (input: { model: ModelFrontend; ctx: AppFrontendCtxBase }): CurrentUserState => {
  switch (input.model.status.t) {
    case 'not-asked':
    case 'loading': {
      return { t: 'loading' }
    }
    case 'err': {
      return { t: 'logged-out' }
    }
    case 'ok': {
      const userSessions = UserSessionDbQueryCache.read(input.ctx, toQueryUserSessionByClientSessionId(input.ctx))
      const userSession = userSessions.find((userSession) => userSession.clientSessionId === input.ctx.clientSessionId)

      if (!userSession) return { t: 'logged-out' }

      const maybeUserAccount = UserAccountDbQueryCache.read(input.ctx, { userId: userSession.userId }).find(
        (userAccount) => userAccount.userId === userSession.userId,
      )

      const userAccountFallback: UserAccount = {
        createdAt: input.ctx.now,
        phoneNumber: null,
        role: 'normal',
        userId: userSession.userId,
      }

      const userAccount: UserAccount = maybeUserAccount ?? userAccountFallback

      const maybeUserProfile = input.ctx.profilesByUserId[userSession.userId]

      const userProfile: UserProfile = maybeUserProfile ?? {
        id: UserProfileId.generate(),
        userId: userSession.userId,
        username: Username.of(''),
        avatarSeed: null,
        avatarStyle: null,
        createdAt: input.ctx.now,
        updatedAt: input.ctx.now,
      }

      return {
        t: 'logged-in',
        userSession,
        userAccount,
        userProfile,
      }
    }
  }
}

export const toCurrentUserId = (input: { model: ModelFrontend; ctx: AuthFrontendCtx }): UserId | null => {
  const currentUserState = toCurrentUserState({ model: input.model, ctx: input.ctx })
  switch (currentUserState.t) {
    case 'logged-in':
      return currentUserState.userSession.userId
    default:
      return null
  }
}

const update: FrontendModule['update'] = (input) => {
  return AppFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => watchForLogin({ ...input, model, modelBefore: input.model, modelAfter: model }),
  )
}

const watchForLogin = (
  input: Parameters<FrontendModule['update']>[0] & { modelBefore: ModelFrontend; modelAfter: ModelFrontend },
): ReturnType<FrontendModule['update']> => {
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

const updateFromMsg: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-msg-out': {
      return { model: input.model, msgOut: [input.msg.msgOut] }
    }
    default: {
      return { model: input.model }
    }
  }
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

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch<MsgFrontend>([
    // ?input.ctx.userAccountDb.sub({
    //       whereAnd: {
    //         userId: {
    //           equals: input.ctx.currentUser.userId,
    //         },
    //       },
    //       order: {
    //         createdAt: 'desc',
    //       },
    //       pagination: {
    //         limit: 1,
    //         offset: 0,
    //       },
    //     }),

    UserSessionDbQueryCache.liveQuery(
      input.ctx.userSessionDb,
      toQueryUserSessionByClientSessionId(input.ctx),
      (msgOut): MsgFrontend => ({ t: 'got-msg-out', msgOut }),
    ),
  ])
}

export const CurrentUserFrontend = {
  subscriptions,
  update,
  init,
}
