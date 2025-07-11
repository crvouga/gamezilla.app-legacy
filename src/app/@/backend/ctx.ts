import { IFileSystem } from '~/@/file-system'
import { IHttpServer } from '~/@/http-server'
import type { IKeyValueDb } from '~/@/key-value-db'
import type { ILogger } from '~/@/logger/interface'
import type { ITopicBasedPubSub } from '~/@/pub-sub-topic-based'
import type { IRuntime } from '~/@/runtime'
import type { ISqlDb } from '~/@/sql-db'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy'
import { ISyncEngine } from '~/@/sync-engine/sync-engine-server'
import type { UnixMs } from '~/@/time/unix-ms'
import { IUserProfileDb } from '~/app/profile/@/user-profile/user-profile-db'
import { Env } from '../data/env'

export type AppBackendCtxBase = {
  now: UnixMs
  sqlDb: ISqlDb
  keyValueDbDurable: IKeyValueDb
  logger: ILogger
  env: Env
  pubSub: ITopicBasedPubSub
  userProfileDb: IUserProfileDb
  httpServer: IHttpServer
  runtime: IRuntime
  migrationPolicy: ISqlDbMigrationPolicy
  syncEngine: ISyncEngine
  port: number
  fileSystem: IFileSystem
}
