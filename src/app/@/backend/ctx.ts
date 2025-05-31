import type { IDbConnSql } from '~/@/db-conn-sql/interface'
import { HttpServerBun } from '~/@/http-server/impl-bun'
import type { IKeyValueDb } from '~/@/key-value-db'
import type { ILogger } from '~/@/logger/interface'
import type { IPubSubTopicBased } from '~/@/pub-sub-topic-based'
import type { IRuntime } from '~/@/runtime'
import type { ISMS } from '~/@/sms'
import type { Posix } from '~/@/time/posix'
import type { TimeSpan } from '~/@/time/time-span'
import { IUserProfileDb } from '~/app/profile/@/user-profile/user-profile-db'
import { Env } from '../data/env'
import type { BackendInstanceId } from './backend-instance/backend-instance-id'

export type AppBackendCtxBase = {
  dbConnSql: IDbConnSql
  keyValueDb: IKeyValueDb
  now: Posix
  logger: ILogger
  sms: ISMS
  env: Env
  sleep: (time: TimeSpan) => Promise<unknown>
  pubSub: IPubSubTopicBased
  userProfileDb: IUserProfileDb
  backendInstanceId: BackendInstanceId
  httpServer: HttpServerBun
  runtime: IRuntime
}
