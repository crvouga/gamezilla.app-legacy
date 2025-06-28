import { HttpServer } from '~/@/http-server'
import { KeyValueDb } from '~/@/key-value-db'
import { ILogger } from '~/@/logger'
import { PubSubTopicBased } from '~/@/pub-sub-topic-based'
import { Runtime } from '~/@/runtime'
import { ISqlDb } from '~/@/sql-db'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Topic } from '~/@/topic'
import { AppTypes } from '~/app'
import { AuthBackend } from '~/app/auth/backend'
import { ProfileDb } from '~/app/profile/@/user-profile/user-profile-db'
import { ProfileBackend } from '~/app/profile/backend'
import { SpacesBackend } from '~/app/spaces/backend'
import { BackendCtxModule } from '~/app/types'
import { WireBackend } from '~/app/wire/backend'
import { BackendInstanceId } from '../../backend/backend-instance/backend-instance-id'
import { BackendRole } from '../../backend/backend-role'
import { AppBackendCtxBase } from '../../backend/ctx'

export const initBackendCtx = async (config: {
  backendRole: BackendRole
  sqlDb: ISqlDb
  topic: Topic.Client<typeof AppTypes.topicContract>
  logger: ILogger
}): Promise<BackendCtxModule> => {
  const logger = config.logger.child(['backend'])

  const runtime = Runtime({
    t: 'process',
    shutoffFGracePeriod: TimeSpan.seconds(1),
    logger,
  })

  const keyValueDbDurable = await KeyValueDb({
    t: 'sql-db',
    sqlDb: config.sqlDb,
    logger,
  })

  const pubSub = await PubSubTopicBased({ t: 'in-memory', subscribersByTopic: new Map() })

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

  const backendInstanceId = BackendInstanceId.generate()

  const ctxBase: AppBackendCtxBase = {
    backendRole: config.backendRole,
    env: 'dev',
    sqlDb: config.sqlDb,
    keyValueDbDurable,
    logger,
    now,
    backendInstanceId,
    sleep: () => Promise.resolve(),
    pubSub,
    userProfileDb,
    httpServer,
    runtime,
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

  return ctx
}
