import { IHttpServer } from '~/@/http-server'
import type { IKeyValueDb } from '~/@/key-value-db'
import type { ILogger } from '~/@/logger/interface'
import { IMigrationPolicy } from '~/@/migration-policy'
import type { IPubSubTopicBased } from '~/@/pub-sub-topic-based'
import type { IRuntime } from '~/@/runtime'
import type { ISqlDb } from '~/@/sql-db'
import type { TimeSpan } from '~/@/time/time-span'
import type { UnixMs } from '~/@/time/unix-ms'
import { IUserProfileDb } from '~/app/profile/@/user-profile/user-profile-db'
import { Env } from '../data/env'
import type { BackendInstanceId } from './backend-instance/backend-instance-id'
import { BackendRole } from './backend-role'
import { ISyncEngine } from '~/@/sync-engine'

export type AppBackendCtxBase = {
  now: UnixMs
  backendRole: BackendRole
  backendInstanceId: BackendInstanceId
  sqlDb: ISqlDb
  keyValueDbDurable: IKeyValueDb
  logger: ILogger
  env: Env
  sleep: (time: TimeSpan) => Promise<unknown>
  pubSub: IPubSubTopicBased
  userProfileDb: IUserProfileDb
  httpServer: IHttpServer
  runtime: IRuntime
  migrationPolicy: IMigrationPolicy
  syncEngine: ISyncEngine
  port: number
}
