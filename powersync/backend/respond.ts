// https://docs.powersync.com/installation/authentication-setup/custom
import { PowerSyncCredentials } from './credentials/respond.js'
import { Ctx } from './ctx.js'
import { PowerSyncKeys } from './keys/respond.js'

const respond = async (input: { request: Request; ctx: Ctx }): Promise<Response | null> => {
  const pathname = new URL(input.request.url).pathname
  switch (pathname) {
    case '/powersync/credentials': {
      return PowerSyncCredentials.respond(input)
    }

    case '/powersync/keys': {
      return PowerSyncKeys.respond(input)
    }

    default: {
      return null
    }
  }
}

export const PowerSyncBackendApp = {
  respond,
}
