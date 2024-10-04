import type { Posix, TimeSpan } from 'gamezilla-app/@/core'
import type { IDbConnKv } from './db-conn-kv'
import type { IDbConnSql } from './db-conn-sql/interface'
import type { ILogger } from './logger/interface'
import type { ISMS } from './sms'

export type AppServerCtx = {
  dbConnSql: IDbConnSql
  dbConnKv: IDbConnKv
  now: Posix
  logger: ILogger
  sms: ISMS
  env: 'prod' | 'test' | 'dev'
  sleep: (time: TimeSpan) => Promise<unknown>
}
