import { isErr } from '~/@/result'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import type { BackendModule } from '../types'

const update: BackendModule['update'] = async (input) => {
  return AppBackendModule.andThen({}, () => updateFromFrontend(input))
}

const updateFromFrontend: BackendModule['update'] = async (input) => {
  switch (input.msgFrontend?.t) {
    case 'user-clicked-confirm-logout-button': {
      const zapped = await input.ctx.userSessionDb.zapBySessionId(input.msgFrontend.sessionId)

      if (isErr(zapped)) {
        return {}
      }

      return {
        msgEvt: [
          {
            ...input.msgFrontend,
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
