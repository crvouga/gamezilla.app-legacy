import { FileSystem } from '~/@/file-system'
import { HttpClient } from '~/@/http-client/impl'
import { HttpServer } from '~/@/http-server'
import { KeyValueDb } from '~/@/key-value-db'
import { ILogger, Logger } from '~/@/logger'
import { TopicBasedPubSub } from '~/@/pub-sub-topic-based'
import { Runtime } from '~/@/runtime'
import { ServerRegistry } from '~/@/server-registry/server-registry'
import { ISqlDb } from '~/@/sql-db/interface'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { SyncEngineServer } from '~/@/sync-engine/sync-engine-server'
import { randomServerPort } from '~/@/test/random-server-port'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Url } from '~/@/url/url'
import { ITopicClient } from '~/@/topic/topic-client/interface'
import { AuthBackend } from '~/app/auth/backend'
import { AppBackend } from '~/app/backend'
import { ProfileDb } from '~/app/profile/@/user-profile/user-profile-db'
import { ProfileBackend } from '~/app/profile/backend'
import { SpacesBackend } from '~/app/spaces/backend'
import { BackendCtxModule, topicContract } from '~/app/types'
import { WireBackend } from '~/app/wire/backend'
import { AppBackendCtxBase } from '../../../backend/ctx'

export const TestBackend = async (config: {
  sqlDb: ISqlDb
  topic: ITopicClient<typeof topicContract>
  logger: ILogger
}) => {
  const logger = config.logger.child(['backend'])

  const runtime = Runtime({
    t: 'process',
    shutoffFGracePeriod: TimeSpan.seconds(1),
    logger,
  })

  const migrationPolicy = SqlDbMigrationPolicy.init({ t: 'never-run', logger: Logger.init({ t: 'noop' }) })

  const serverRegistry = ServerRegistry.init({
    httpClient: HttpClient.init({ t: 'fetch' }),
    logger,
    migrationPolicy,
    serverRegistrySrcUrl: Url.derive('http://localhost:5173/server-registry.local.json', 'http'),
    sqlDb: config.sqlDb,
    pollRate: TimeSpan.seconds(10),
  })

  const keyValueDbDurable = KeyValueDb.init({
    t: 'sql-db',
    sqlDb: config.sqlDb,
    migrationPolicy,
    logger,
  })

  const pubSub = TopicBasedPubSub.init({ t: 'in-memory', subscribersByTopic: new Map() })

  const httpServer = HttpServer.init({
    t: 'noop',
    logger,
  })

  const userProfileDb = ProfileDb({
    t: 'sql',
    sqlDb: config.sqlDb,
    migrationPolicy,
    logger,
  })

  const now = UnixMs.now()

  const syncEngine = SyncEngineServer({ logger })

  const ctxBase: AppBackendCtxBase = {
    port: randomServerPort(),
    syncEngine,
    migrationPolicy,
    env: 'dev',
    sqlDb: config.sqlDb,
    keyValueDbDurable,
    logger,
    now,
    pubSub,
    userProfileDb,
    httpServer,
    runtime,
    fileSystem: FileSystem.init({ t: 'node' }),
    serverRegistry,
  }

  const wire = await WireBackend.initCtx({ ctx: ctxBase, topic: config.topic })
  const profile = await ProfileBackend.initCtx({ ctx: ctxBase })
  const spaces = await SpacesBackend.initCtx({ ctx: ctxBase, topic: config.topic })
  const auth = await AuthBackend.initCtx({ ctx: ctxBase })

  const ctx: BackendCtxModule = {
    ...ctxBase,
    ...auth,
    ...spaces,
    ...profile,
    ...wire,
    topic: config.topic,
  }

  const rpcServer = AppBackend.rpc({ ctx })

  const abortController = new AbortController()

  AppBackend.worker(abortController.signal, { ctx })

  const cleanUp = async () => {
    abortController.abort()
  }

  return {
    rpcServer,
    abortController,
    cleanUp,
  }
}
