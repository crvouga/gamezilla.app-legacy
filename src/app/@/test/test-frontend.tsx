import { AudioPlayer } from '~/@/audio-player'
import { HttpClient } from '~/@/http-client'
import { ILogger } from '~/@/logger'
import { Program } from '~/@/program/program'
import { RPC } from '~/@/rpc'
import { ISqlDb } from '~/@/sql-db'
import { TestClient } from '~/@/test-client'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Topic } from '~/@/topic'
import { Render } from '~/@/vdom/render'
import { ClientSessionIdStorage } from '~/@/wire/client-session-id-storage'
import { SessionId } from '~/@/wire/session-id'
import { AuthFrontend } from '~/app/auth/frontend'
import { AppFrontend } from '~/app/frontend'
import { ProfileFrontend } from '~/app/profile/frontend'
import { SpacesFrontend } from '~/app/spaces/frontend'
import { FrontendCtxModule, rpcContract, topicContract } from '~/app/types'
import { WireFrontend } from '~/app/wire/frontend'
import { AppFrontendCtxBase } from '../frontend/ctx'
import { Translator } from '../frontend/translator'

export const TestFrontend = async (config: {
  rpcServer: RPC.Server<typeof rpcContract>
  topic: Topic.Client<typeof topicContract>
  sqlDb: ISqlDb
  logger: ILogger
}) => {
  const sessionId = SessionId.generate()

  const ctx = await initCtx({
    sessionId,
    rpcServer: config.rpcServer,
    topic: config.topic,
    sqlDb: config.sqlDb,
    logger: config.logger,
  })

  const client = await TestClient({
    t: 'happydom',
    maxWait: TimeSpan.milliseconds(100),
    poll: TimeSpan.milliseconds(10),
  })

  document.body.innerHTML = `<div id="root"></div>`

  const root = document.getElementById(`root`)!

  const render = await Render('react', root)

  const program = await Program.run({
    init: () => AppFrontend.init({ ctx }),
    update: (input) => AppFrontend.update({ ...input, ctx }),
    subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
    render: (input) => render(<AppFrontend.View {...input} ctx={ctx} />),
  })

  const cleanUp = async () => {
    window.history.replaceState({}, '', '/')
    program.cleanUp()
  }

  return {
    ...client,
    ...program,
    audio: ctx.audioPlayer,
    cleanUp,
  }
}

const initCtx = async (config: {
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
    audioPlayer: AudioPlayer({ t: 'fake', logger }),
    clientSessionId,
    sqlDb: config.sqlDb,
    logger,
    now: UnixMs.now(),
    navigatorLanguage: 'en',
    currentScreen: { t: 'login', n: 'auth' },
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
