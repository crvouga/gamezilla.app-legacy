import { AudioPlayer } from '~/@/audio-player'
import { HttpClient } from '~/@/http-client'
import { KeyValueDb } from '~/@/key-value-db'
import { KeyValueDbSync } from '~/@/key-value-db-sync'
import { KeyBoard } from '~/@/keyboard'
import { Translator } from '~/@/l18n/generated'
import { ILogger, Logger } from '~/@/logger'
import { Navigation } from '~/@/navigation'
import { Program } from '~/@/program/program'
import { RPC } from '~/@/rpc'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { ISqlDb } from '~/@/sql-db/interface'
import { CrudTransactionDb } from '~/@/sync-engine/crud-transaction-db/impl'
import { SyncEngineClient } from '~/@/sync-engine/sync-engine-client'
import { TestClient } from '~/@/test-client'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { ITopicClient } from '~/@/topic/topic-client/types'
import { h, render } from '~/@/vdom/h'
import { SwapVDomEngine } from '~/@/vdom/swap-vdom-engine'
import { Viewport } from '~/@/viewport'
import { ClientSessionIdStorage } from '~/@/wire/client-session-id-storage'
import { SessionId } from '~/@/wire/session-id'
import { AuthFrontend } from '~/app/auth/frontend'
import { AppFrontend } from '~/app/frontend'
import { QueryCache } from '~/app/frontend/query-cache/query-cache'
import { ProfileFrontend } from '~/app/profile/frontend'
import { SpacesFrontend } from '~/app/spaces/frontend'
import { FrontendCtxModule, rpcContract, topicContract } from '~/app/types'
import { WireFrontend } from '~/app/wire/frontend'
import { AppFrontendCtxBase } from '../../../frontend/ctx'
import { MAX_WAIT, POLL } from '../test-max-wait'

export const TestFrontend = async (config: {
  rpcServer: RPC.Server<typeof rpcContract>
  topic: ITopicClient<typeof topicContract>
  sqlDb: ISqlDb
  logger: ILogger
}) => {
  const sessionId = SessionId.generate()

  const logger = config.logger.child(['frontend'])

  const keyValueDbSync = KeyValueDbSync.init({ t: 'hash-map', logger })

  const clientSessionId = ClientSessionIdStorage.init({ keyValueDbSync }).get()

  const rpc = RPC.initClient({
    t: 'local',
    contract: rpcContract,
    clientSessionId,
    server: config.rpcServer,
    sessionId,
  })

  const httpClient = HttpClient.init({ t: 'fetch' })

  const navigation = Navigation.init({ t: 'web-standard', logger })

  const audioPlayer = AudioPlayer.init({ t: 'fake', logger })

  const viewport = Viewport.init({ t: 'web-standard' })

  const keyboard = KeyBoard.init({ t: 'web-standard' })

  const keyValueDb = KeyValueDb.init({ t: 'web-standard-storage', storage: localStorage, logger })

  const migrationPolicy = SqlDbMigrationPolicy.init({ t: 'always-run', logger: Logger.init({ t: 'noop' }) })

  const syncEngine = SyncEngineClient.init({
    crudTransactionDb: CrudTransactionDb.init({
      t: 'sql-db',
      logger: Logger.init({ t: 'noop' }),
      migrationPolicy,
      sqlDb: config.sqlDb,
    }),
    logger: Logger.init({ t: 'noop' }),
  })

  const ctxBase: AppFrontendCtxBase = {
    syncEngine,
    keyValueDb,
    migrationPolicy,
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
    queryCache: QueryCache.init,
  }

  const auth = await AuthFrontend.initCtx({ ctx: ctxBase, rpc })
  const profile = ProfileFrontend.initCtx({ ctx: ctxBase })
  const spaces = await SpacesFrontend.initCtx({ ctx: ctxBase, rpc, topic: config.topic })
  const wire = WireFrontend.initCtx({ ctx: ctxBase, topic: config.topic })

  const ctx: FrontendCtxModule = {
    ...ctxBase,
    ...auth,
    ...profile,
    ...spaces,
    ...wire,
    rpc,
    topic: config.topic,
  }

  const client = await TestClient.init({
    t: 'happydom',
    maxWait: MAX_WAIT,
    poll: POLL,
    audioPlayer: ctx.audioPlayer,
  })

  await navigation.clear()

  const { swapped, getRoot } = await SwapVDomEngine.init()

  const program = await Program.run({
    init: () => AppFrontend.init({ ctx }),
    update: (input) => AppFrontend.update({ ...input, ctx }),
    subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
    render: (input) => render(h(AppFrontend.View, { ...input, ctx }), getRoot()),
    crash: (input) => logger.error(input),
  })

  swapped.sub(() => program.render())

  const cleanUp = async () => {
    program.cleanUp()
  }

  return {
    ...client,
    ...program,
    cleanUp,
  }
}
