import { Loading } from '~/@/result'
import { Sub } from '~/@/sub'
import { FrontendModule, ModelFrontend, MsgFrontend } from './types'

const init: ModelFrontend = {
  currentUser_currentUser: Loading,
  currentUser_currentUserId: null,
  currentUser_userSessions: [],
}

const update: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-current-user-account': {
      return { model: input.model }
    }
    case 'got-user-sessions': {
      return { model: { ...input.model, userSessions: input.msg.userSessions } }
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
