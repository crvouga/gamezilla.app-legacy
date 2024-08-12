import { isErr } from 'gamezilla-app/@/core'
import { AppServerModule } from 'gamezilla-app/app/@/architecture/app-server'
import type { ServerModule } from '../auth.types'

const update: ServerModule['update'] = async (input) => {
  return AppServerModule.andThen({}, () => updateFromClient(input))
}

const updateFromClient: ServerModule['update'] = async ({ msgClient, deps }) => {
  switch (msgClient?.t) {
    case 'logout': {
      const zapped = await deps.userSessionDb.zapBySessionId(msgClient.sessionId)

      if (isErr(zapped)) {
        return {}
      }

      return {
        msgEvt: [
          {
            ...msgClient,
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
