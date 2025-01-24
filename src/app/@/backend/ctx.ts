import type { IDbConnSql } from '~/@/db-conn-sql/interface'
import type { IHttpServer } from '~/@/http-server'
import type { IKeyValueDb } from '~/@/key-value-db'
import type { ILogger } from '~/@/logger/interface'
import type { IPubSubTopicBased } from '~/@/pub-sub-topic-based'
import type { IRuntime } from '~/@/runtime'
import type { ISMS } from '~/@/sms'
import type { Posix } from '~/@/time/posix'
import type { TimeSpan } from '~/@/time/time-span'
import type { BackendInstanceId } from './backend-instance/backend-instance-id'
import type { IProfileCache } from './profile-cache'

export type AppBackendCtx = {
  dbConnSql: IDbConnSql
  keyValueDb: IKeyValueDb
  now: Posix
  logger: ILogger
  sms: ISMS
  env: 'prod' | 'test' | 'dev'
  sleep: (time: TimeSpan) => Promise<unknown>
  pubSub: IPubSubTopicBased
  profileCache: IProfileCache
  backendInstanceId: BackendInstanceId
  httpServer: IHttpServer
  runtime: IRuntime
}
