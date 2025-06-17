// https://docs.powersync.com/installation/authentication-setup/custom
import { IHttpServer } from '~/@/http-server/interface.js'
import { Ctx } from './@/backend/ctx.js'
import { PowerSyncCredentialsBackend } from './credentials/backend.js'
import { PowerSyncCredentialsTypes } from './credentials/index.js'
import { PowerSyncJwksBackend } from './jwks/backend.js'
import { PowerSyncJwksTypes } from './jwks/index.js'
import { PowerSyncUploadDataBackend } from './upload-data/backend.js'
import { PowerSyncUploadDataTypes } from './upload-data/index.js'

const respond = async (input: { req: Request; ctx: Ctx }): Promise<Response | null> => {
  const pathname = new URL(input.req.url).pathname
  switch (pathname) {
    case PowerSyncCredentialsTypes.ENDPOINT: {
      return PowerSyncCredentialsBackend.respond(input)
    }

    case PowerSyncJwksTypes.ENDPOINT: {
      return PowerSyncJwksBackend.respond(input)
    }

    case PowerSyncUploadDataTypes.ENDPOINT: {
      return PowerSyncUploadDataBackend.respond(input)
    }

    default: {
      return null
    }
  }
}

const registerRespond = (config: { httpServer: IHttpServer; ctx: Ctx }) => {
  config.httpServer.registerRespond((request) => {
    return respond({ req: request, ctx: config.ctx })
  })
}

export const PowerSyncBackend = {
  registerRespond,
}
