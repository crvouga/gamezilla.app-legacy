import { AudioPlayer } from '~/@/audio-player'
import { HttpClient } from '~/@/http-client'
import { KeyValueDb } from '~/@/key-value-db'
import { KeyBoard } from '~/@/keyboard'
import { Translator } from '~/@/l18n/generated'
import { ILogger } from '~/@/logger'
import { Navigation } from '~/@/navigation'
import { Program } from '~/@/program/program'
import { RPC } from '~/@/rpc'
import { ISqlDb } from '~/@/sql-db'
import { TestClient } from '~/@/test-client'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Topic } from '~/@/topic'
import { h, render, VDomEngine } from '~/@/vdom/h'
import { Viewport } from '~/@/viewport'
import { ClientSessionIdStorage } from '~/@/wire/client-session-id-storage'
import { SessionId } from '~/@/wire/session-id'
import { AuthFrontend } from '~/app/auth/frontend'
import { AppFrontend } from '~/app/frontend'
import { ProfileFrontend } from '~/app/profile/frontend'
import { SpacesFrontend } from '~/app/spaces/frontend'
import { FrontendCtxModule, rpcContract, topicContract } from '~/app/types'
import { WireFrontend } from '~/app/wire/frontend'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { AppFrontendCtxBase } from '../../../frontend/ctx'

export const TestFrontend = async (config: {
  rpcServer: RPC.Server<typeof rpcContract>
  topic: Topic.Client<typeof topicContract>
  sqlDb: ISqlDb
  logger: ILogger
}) => {
  const sessionId = SessionId.generate()

  const logger = config.logger.child(['frontend'])

  const clientSessionId = ClientSessionIdStorage().get()

  const rpc = RPC.initClient({
    t: 'local',
    contract: rpcContract,
    clientSessionId,
    server: config.rpcServer,
    sessionId,
  })

  const httpClient = HttpClient({ t: 'fetch' })

  const navigation = Navigation({ t: 'web-standard', logger })

  const audioPlayer = AudioPlayer({ t: 'fake', logger })

  const viewport = Viewport({ t: 'web-standard' })

  const keyboard = KeyBoard({ t: 'web-standard' })

  const keyValueDb = await KeyValueDb({ t: 'web-standard-storage', storage: localStorage, logger })

  const ctxBase: AppFrontendCtxBase = {
    keyValueDb,
    audioPlayer,
    keyboard,
    navigation,
    viewport,
    clientSessionId,
    sqlDb: config.sqlDb,
    logger,
    now: UnixMs.now(),
    navigatorLanguage: 'en',
    currentScreen: { t: 'login', n: 'auth' },
    t: Translator('en'),
    viewportVisibility: 'visible',
    profilesByUserId: {},
    screenSize: 'mobile',
    parentScreen: null,
    currentUser: null,
    currentUserState: {
      t: 'loading',
    },
    httpClient,
    backendConnectionStatus: {
      t: 'connected',
      averagePing: TimeSpan.milliseconds(100),
      latestPing: TimeSpan.milliseconds(100),
    },
  }

  const auth = await AuthFrontend.initCtx({ ctx: ctxBase, rpc })
  const profile = ProfileFrontend.initCtx({ ctx: ctxBase })
  const spaces = await SpacesFrontend.initCtx({ ctx: ctxBase, rpc, topic: config.topic })
  const wire = WireFrontend.initCtx({ ctx: ctxBase, rpc, topic: config.topic })

  const ctx: FrontendCtxModule = {
    ...ctxBase,
    ...auth,
    ...profile,
    ...spaces,
    ...wire,
    rpc,
    topic: config.topic,
  }

  const client = await TestClient({
    t: 'happydom',
    maxWait: TimeSpan.milliseconds(500),
    poll: TimeSpan.milliseconds(1),
    audioPlayer: ctx.audioPlayer,
  })

  await navigation.clear()
  document.body.innerHTML = '<div id="root"></div>'
  const root = document.getElementById('root')!
  await VDomEngine.initialize(CONFIG_FRONTEND.VDOM_IMPL)

  const program = await Program.run({
    init: () => AppFrontend.init({ ctx }),
    update: (input) => AppFrontend.update({ ...input, ctx }),
    subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
    render: (input) => render(h(AppFrontend.View, { ...input, ctx }), root),
    crash: (input) => logger.error(input),
  })

  const cleanUp = async () => {
    program.cleanUp()
  }

  return {
    ...client,
    ...program,
    cleanUp,
  }
}
