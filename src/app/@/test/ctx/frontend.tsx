import { Browser } from '~/@/browser'
import { HttpClient } from '~/@/http-client'
import { ILogger } from '~/@/logger'
import { RPC } from '~/@/rpc'
import { ISqlDb } from '~/@/sql-db'
import { UnixMs } from '~/@/time/unix-ms'
import { Topic } from '~/@/topic'
import { ClientSessionIdStorage } from '~/@/wire/client-session-id-storage'
import { SessionId } from '~/@/wire/session-id'
import { AuthFrontend } from '~/app/auth/frontend'
import { ProfileFrontend } from '~/app/profile/frontend'
import { SpacesFrontend } from '~/app/spaces/frontend'
import { FrontendCtxModule, rpcContract, topicContract } from '~/app/types'
import { WireFrontend } from '~/app/wire/frontend'
import { AppFrontendCtxBase } from '../../frontend/ctx'
import { Translator } from '../../frontend/translator'

export const initFrontendCtx = async (config: {
  rpcServer: RPC.Server<typeof rpcContract>
  sessionId: SessionId
  topic: Topic.Client<typeof topicContract>
  sqlDb: ISqlDb
  logger: ILogger
}): Promise<FrontendCtxModule> => {
  const logger = config.logger.child(['frontend'])

  const clientSessionId = ClientSessionIdStorage().get()

  const rpc = RPC.initClient({
    t: 'local',
    contract: rpcContract,
    clientSessionId,
    server: config.rpcServer,
    sessionId: config.sessionId,
  })

  const httpClient = HttpClient({ t: 'fetch' })

  const ctx: AppFrontendCtxBase = {
    location: Browser.location(),
    clientSessionId,
    sqlDb: config.sqlDb,
    logger,
    now: UnixMs.now(),
    navigatorLanguage: 'en',
    currentScreen: { t: 'login', n: 'auth-login' },
    t: Translator('en'),
    documentVisibilityState: 'visible',
    profilesByUserId: {},
    screenSize: 'mobile',
    parentScreen: null,
    currentUser: null,
    currentUserId: null,
    currentUserRole: null,
    httpClient,
  }

  const auth = await AuthFrontend.initCtx({ ctx, rpc })
  const profile = ProfileFrontend.initCtx({ ctx })
  const spaces = await SpacesFrontend.initCtx({ ctx, rpc, topic: config.topic })
  const wire = WireFrontend.initCtx({ ctx, rpc, topic: config.topic })

  const ctxModule: FrontendCtxModule = {
    ...ctx,
    ...auth,
    ...profile,
    ...spaces,
    ...wire,
    rpc,
    topic: config.topic,
  }

  return ctxModule
}
