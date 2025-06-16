// https://docs.powersync.com/installation/authentication-setup/custom
import { IHttpServer } from '~/@/http-server/interface.js'
import { Ctx } from './@/backend/ctx.js'
import { CredentialsBackend } from './credentials/backend.js'
import { CredentialsTypes } from './credentials/index.js'
import { JwksBackend } from './jwks/backend.js'
import { JwksTypes } from './jwks/index.js'
import { PowerSyncUploadData } from './upload-data/backend.js'
import { UploadDataTypes } from './upload-data/index.js'

const respond = async (input: { request: Request; ctx: Ctx }): Promise<Response | null> => {
  const pathname = new URL(input.request.url).pathname
  switch (pathname) {
    case CredentialsTypes.ENDPOINT: {
      return CredentialsBackend.respond(input)
    }

    case JwksTypes.ENDPOINT: {
      return JwksBackend.respond(input)
    }

    case UploadDataTypes.ENDPOINT: {
      return PowerSyncUploadData.respond(input)
    }

    default: {
      return null
    }
  }
}

const registerRespond = (config: { httpServer: IHttpServer; ctx: Ctx }) => {
  config.httpServer.registerRespond((request) => {
    return respond({ request, ctx: config.ctx })
  })
}

export const PowerSyncBackend = {
  registerRespond,
}
