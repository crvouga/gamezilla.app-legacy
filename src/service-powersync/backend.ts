// https://docs.powersync.com/installation/authentication-setup/custom
import { IHttpServer } from '~/@/http-server/interface'
import { Ctx } from './@/backend/ctx'
import { PowerSyncCredentialsBackend } from './credentials/backend'
import { PowerSyncCredentialsTypes } from './credentials/index'
import { PowerSyncJwksBackend } from './jwks/backend'
import { PowerSyncJwksTypes } from './jwks/index'
import { PowerSyncUploadDataBackend } from './upload-data/backend'
import { PowerSyncUploadDataTypes } from './upload-data/index'

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
