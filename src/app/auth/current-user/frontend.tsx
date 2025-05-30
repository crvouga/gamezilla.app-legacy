import { NotAsked, Ok } from '~/@/result'
import { Sub } from '~/@/sub'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { ReplaceScreenCmd } from '~/app/@/frontend/replace-screen-cmd'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd'
import { AuthFrontendCtx } from '../@/frontend/ctx'
import { UserSession } from '../@/user-session/user-session'
import { FrontendModule, ModelFrontend, MsgFrontend } from './types'

const init: ModelFrontend = {
  status: NotAsked,
  userSessions: {},
  userAccounts: {},
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
    }

export const toCurrentUserState = (input: { model: ModelFrontend; ctx: AuthFrontendCtx }): CurrentUserState => {
  if (input.model.status.t === 'not-asked') {
    return { t: 'loading' }
  }
  if (input.model.status.t === 'loading') {
    return { t: 'loading' }
  }
  if (input.model.status.t === 'err') {
    return { t: 'logged-out' }
  }

  const userSession = Object.values(input.model.userSessions).find(
    (userSession) => userSession.clientSessionId === input.ctx.clientSessionId,
  )

  if (!userSession) {
    return { t: 'logged-out' }
  }

  const userAccount: UserAccount = Object.values(input.model.userAccounts).find(
    (userAccount) => userAccount.userId === userSession.userId,
  ) ?? {
    createdAt: input.ctx.now,
    phoneNumber: null,
    role: 'normal',
    userId: userSession.userId,
  }

  return {
    t: 'logged-in',
    userSession,
    userAccount,
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
        ReplaceScreenCmd.init({ n: 'spaces', t: 'space-list' }, false),
        PlaySoundCmd.init(APP_SOUND.celebration),
        ShowToastCmd.init(input.ctx.t('auth.logged-in')),
      ],
    }
  }
  return { model: input.modelAfter }
}

const updateFromMsg: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-user-accounts': {
      return {
        model: {
          ...input.model,
          userAccounts: input.msg.userAccounts.reduce(
            (acc, userAccount) => ({ ...acc, [userAccount.userId]: userAccount }),
            {},
          ),
        },
      }
    }
    case 'got-user-sessions': {
      return {
        model: {
          ...input.model,
          status: Ok(null),
          userSessions: input.msg.userSessions.reduce(
            (acc, userSession) => ({ ...acc, [userSession.userSessionId]: userSession }),
            {},
          ),
        },
      }
    }
  }
  return {
    model: input.model,
  }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch<MsgFrontend>([
    Sub.map(
      input.ctx.userSessionDb.sub({
        whereAnd: {
          clientSessionId: {
            equals: input.ctx.clientSessionId,
          },
        },
        order: {
          createdAt: 'desc',
        },
        pagination: {
          limit: 10,
          offset: 0,
        },
      }),
      (userSessions): MsgFrontend => ({
        t: 'got-user-sessions',
        userSessions,
      }),
    ),
    // input.ctx.userAccountDb.sub({
    //   where: {
    //     userId: input.model.currentUserId,
    //   },
    // }),
    // input.ctx.guestSessionMappingDb.sub({
    //   where: {
    //     clientSessionId: input.ctx.clientSessionId,
    //   },
    // }),
  ])
}

export const CurrentUserFrontend = {
  subscriptions,
  update,
  init,
}
