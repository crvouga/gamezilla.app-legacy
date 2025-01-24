// https://docs.powersync.com/installation/authentication-setup/custom
import { IHttpServer } from '~/@/http-server/interface.js'
import { PowerSyncCredentials } from './credentials/respond.js'
import { Ctx } from './ctx.js'
import { PowerSyncJwks } from './jwks/respond.js'

const respond = async (input: { request: Request; ctx: Ctx }): Promise<Response | null> => {
  const pathname = new URL(input.request.url).pathname
  switch (pathname) {
    case '/powersync/credentials': {
      return PowerSyncCredentials.respond(input)
    }

    case '/powersync/jwks': {
      return PowerSyncJwks.respond(input)
    }

    default: {
      return null
    }
  }
}

const withHandlers = (config: { httpServer: IHttpServer; ctx: Ctx }) => {
  config.httpServer.registerRespond((request) => {
    return respond({ request, ctx: config.ctx })
  })
}

export const PowerSyncBackendApp = {
  withHandlers,
}
