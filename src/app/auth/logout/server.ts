import { isErr } from '~/@/result'
import { AppServerModule } from '~/app/@/architecture/app-server'
import type { ServerModule } from '../types'

const update: ServerModule['update'] = async (input) => {
  return AppServerModule.andThen({}, () => updateFromClient(input))
}

const updateFromClient: ServerModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'user-clicked-confirm-logout-button': {
      const zapped = await input.ctx.userSessionDb.zapBySessionId(input.msgClient.sessionId)

      if (isErr(zapped)) {
        return {}
      }

      return {
        msgEvt: [
          {
            ...input.msgClient,
            t: 'auth-evt.client-unauthenticated'
          }
        ]
      }
    }

    default: {
      return {}
    }
  }
}

export const LogoutServer = {
  update
}
