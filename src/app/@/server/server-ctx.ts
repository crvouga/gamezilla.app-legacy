import type { Posix, TimeSpan } from '~/@/core'
import { IRuntime } from '~/@/runtime'
import { IWebServer } from '~/@/web-server'
import type { IDbConnKv } from './db-conn-kv'
import type { IDbConnSql } from './db-conn-sql/interface'
import type { ILogger } from './logger/interface'
import { IProfileCache } from './profile-cache'
import { IPubSubTopicBased } from './pub-sub-topic-based'
import { ServerInstanceId } from './server-instance/server-instance-id'
import type { ISMS } from './sms'

export type AppServerCtx = {
  dbConnSql: IDbConnSql
  dbConnKv: IDbConnKv
  now: Posix
  logger: ILogger
  sms: ISMS
  env: 'prod' | 'test' | 'dev'
  sleep: (time: TimeSpan) => Promise<unknown>
  pubSub: IPubSubTopicBased
  profileCache: IProfileCache
  serverInstanceId: ServerInstanceId
  webServer: IWebServer
  runtime: IRuntime
}
