// @ts-nocheck
import { Sub } from '~/@/sub'
import { FrontendModule } from './types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-current-user-account': {
      return { model: input.model }
    }
  }
  return {
    model: input.model,
  }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch([
    input.ctx.userSessionDb.sub({
      //   whereAnd: {
      //     clientSessionId: input.ctx.clientSessionId,
      //   },
      //   order: {
      //     createdAt: 'desc',
      //   },
      //   pagination: {
      //     limit: 1,
      //   },
    }),
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
}
