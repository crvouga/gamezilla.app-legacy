// https://docs.powersync.com/installation/authentication-setup/custom
import { IHttpServer } from '~/@/http-server/interface'
import { Ctx } from './@/backend/ctx'
import { PowerSyncCredentialsBackend } from './credentials/backend'
import { PowerSyncCredentialsTypes } from './credentials/index'
import { PowerSyncJwksBackend } from './jwks/backend'
import { PowerSyncJwksTypes } from './jwks/index'
import { PowerSyncUploadDataBackend } from './upload-data/backend'
import { PowerSyncPushEntryTypes } from './upload-data/index'

const respond = async (input: { req: Request; ctx: Ctx }): Promise<Response | null> => {
  const pathname = new URL(input.req.url).pathname
  const logger = input.ctx.logger.child(['powersync'])
  switch (pathname) {
    case PowerSyncCredentialsTypes.ENDPOINT: {
      return PowerSyncCredentialsBackend.respond({ ...input, logger })
    }

    case PowerSyncJwksTypes.ENDPOINT: {
      return PowerSyncJwksBackend.respond({ ...input, logger })
    }

    case PowerSyncPushEntryTypes.ENDPOINT: {
      return PowerSyncUploadDataBackend.respond({ ...input, logger })
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
