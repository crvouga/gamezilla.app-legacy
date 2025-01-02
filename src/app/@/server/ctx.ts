import { IRuntime } from '~/@/runtime'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { IWebServer } from '~/@/web-server'
import type { IDbConnKv } from '../../../@/db-conn-kv'
import type { IDbConnSql } from '../../../@/db-conn-sql/interface'
import type { ILogger } from '../../../@/logger/interface'
import { IPubSubTopicBased } from '../../../@/pub-sub-topic-based'
import type { ISMS } from '../../../@/sms'
import { IProfileCache } from './profile-cache'
import { ServerInstanceId } from './server-instance/server-instance-id'

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
