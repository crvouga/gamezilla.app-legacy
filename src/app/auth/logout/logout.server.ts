import { isErr } from '~/@/core'
import { AppServerModule } from '~/app/@/architecture/app-server'
import type { ServerModule } from '../types'

const update: ServerModule['update'] = async (input) => {
  return AppServerModule.andThen({}, () => updateFromClient(input))
}

const updateFromClient: ServerModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'logout': {
      const zapped = await input.ctx.userSessionDb.zapBySessionId(input.msgClient.sessionId)

      if (isErr(zapped)) {
        return {}
      }

      return {
        msgEvt: [
          {
            ...input.msgClient,
            t: 'auth/client-unauthenticated'
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
