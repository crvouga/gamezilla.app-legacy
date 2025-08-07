import { FileSystem } from '~/@/file-system'
import { ILogger, Logger } from '~/@/logger'
import { Pglite } from '~/@/pglite/impl'
import { BackendSqlDb } from '~/@/sql-db/backend-impl'
import { ISqlDb } from '~/@/sql-db/interface'
import { TopicClient } from '~/@/topic/topic-client/topic-client'
import { AppTypes } from '~/app'
import { IFixtureApp } from '../interface'
import { TestBackend } from './test-backend'
import { TestFrontend } from './test-frontend'

export const FixtureAppUnitTestE2E = async (): Promise<IFixtureApp> => {
  let logger: ILogger
  logger ??= Logger.init({ t: 'noop' })
  logger ??= Logger.init({ t: 'console', namespace: ['fixture'], newLinePerMsg: false, maxLogLevel: 'info' })

  const fs = FileSystem.init({ t: 'node' })

  let sqlDb: ISqlDb
  sqlDb ??= BackendSqlDb.init({
    t: 'pglite',
    pglite: Pglite.init({ t: 'main-thread', config: { t: 'in-memory' } }),
    logger,
  })
  sqlDb ??= BackendSqlDb.init({ t: 'better-sqlite3', databasePath: ':memory:', logger, fs })

  const topic = TopicClient.init({ t: 'local', contract: AppTypes.topicContract, logger })

  const backend = await TestBackend({ sqlDb, topic, logger })

  const frontend = await TestFrontend({ rpcServer: backend.rpcServer, topic, sqlDb, logger })

  const cleanUp = async () => {
    await backend.cleanUp()
    await frontend.cleanUp()
  }

  return {
    frontend,
    t: frontend.ctx.t,
    [Symbol.asyncDispose]: cleanUp,
  }
}
