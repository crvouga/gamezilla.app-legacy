import { isErr } from 'gamezilla-app/@/core'
import { AppServerModule } from 'gamezilla-app/app/@/architecture/app-server'
import type { ServerModule } from '../auth.types'

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
