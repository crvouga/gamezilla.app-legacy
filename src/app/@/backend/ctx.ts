import { IRuntime } from '~/@/runtime'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { IHttpServer } from '~/@/http-server'
import type { IDbConnKv } from '../../../@/db-conn-kv'
import type { IDbConnSql } from '../../../@/db-conn-sql/interface'
import type { ILogger } from '../../../@/logger/interface'
import { IPubSubTopicBased } from '../../../@/pub-sub-topic-based'
import type { ISMS } from '../../../@/sms'
import { IProfileCache } from './profile-cache'
import { BackendInstanceId } from './backend-instance/backend-instance-id'

export type AppBackendCtx = {
  dbConnSql: IDbConnSql
  dbConnKv: IDbConnKv
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
