import { IHttpServer } from '~/@/http-server'
import type { IKeyValueDb } from '~/@/key-value-db'
import type { ILogger } from '~/@/logger/interface'
import type { IPubSubTopicBased } from '~/@/pub-sub-topic-based'
import type { IRuntime } from '~/@/runtime'
import type { ISqlDb } from '~/@/sql-db/interface'
import type { Posix } from '~/@/time/posix'
import type { TimeSpan } from '~/@/time/time-span'
import { IUserProfileDb } from '~/app/profile/@/user-profile/user-profile-db'
import { Env } from '../data/env'
import type { BackendInstanceId } from './backend-instance/backend-instance-id'

export type AppBackendCtxBase = {
  sqlDb: ISqlDb
  keyValueDbDurable: IKeyValueDb
  now: Posix
  logger: ILogger
  env: Env
  sleep: (time: TimeSpan) => Promise<unknown>
  pubSub: IPubSubTopicBased
  userProfileDb: IUserProfileDb
  backendInstanceId: BackendInstanceId
  httpServer: IHttpServer
  runtime: IRuntime
}
