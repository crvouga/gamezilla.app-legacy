import { FileSystem } from '~/@/file-system'
import { HttpServer } from '~/@/http-server'
import { KeyValueDb } from '~/@/key-value-db'
import { ILogger, Logger } from '~/@/logger'
import { TopicBasedPubSub } from '~/@/pub-sub-topic-based'
import { Runtime } from '~/@/runtime'
import { ISqlDb } from '~/@/sql-db'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy'
import { SyncEngineServer } from '~/@/sync-engine/sync-engine-server'
import { randomServerPort } from '~/@/test/random-server-port'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Topic } from '~/@/topic'
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
  topic: Topic.Client<typeof topicContract>
  logger: ILogger
}) => {
  const logger = config.logger.child(['backend'])

  const runtime = Runtime({
    t: 'process',
    shutoffFGracePeriod: TimeSpan.seconds(1),
    logger,
  })

  const keyValueDbDurable = KeyValueDb({
    t: 'sql-db',
    sqlDb: config.sqlDb,
    logger,
  })

  const pubSub = TopicBasedPubSub({ t: 'in-memory', subscribersByTopic: new Map() })

  const httpServer = HttpServer({
    t: 'noop',
    logger,
  })

  const userProfileDb = ProfileDb({
    t: 'sql',
    sqlDb: config.sqlDb,
    logger,
  })

  const now = UnixMs.now()

  const migrationPolicy = SqlDbMigrationPolicy({ t: 'always-run', logger: Logger({ t: 'noop' }) })

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
    fileSystem: FileSystem({ t: 'node' }),
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
