import { isErr } from '~/@/result'
import { AppBackendModule } from '~/app/@/architecture/app-server'
import type { BackendModule } from '../types'

const update: BackendModule['update'] = async (input) => {
  return AppBackendModule.andThen({}, () => updateFromClient(input))
}

const updateFromClient: BackendModule['update'] = async (input) => {
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
            t: 'auth-evt.client-unauthenticated',
          },
        ],
      }
    }

    default: {
      return {}
    }
  }
}

export const LogoutBackend = {
  update,
}
