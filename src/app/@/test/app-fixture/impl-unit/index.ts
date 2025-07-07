import { FileSystem } from '~/@/file-system'
import { ILogger, Logger } from '~/@/logger'
import { SqlDb } from '~/@/sql-db/backend/impl'
import { Topic } from '~/@/topic'
import { AppTypes } from '~/app'
import { IFixtureApp } from '../interface'
import { TestBackend } from './test-backend'
import { TestFrontend } from './test-frontend'

export const FixtureAppUnitTestE2E = async (): Promise<IFixtureApp> => {
  let logger: ILogger
  logger ??= Logger({ t: 'noop' })
  logger ??= Logger({ t: 'console', namespace: ['fixture'], newLinePerMsg: false, maxLogLevel: 'info' })

  const fs = FileSystem({ t: 'node' })

  const sqlDb = await SqlDb({
    t: 'better-sqlite3',
    databasePath: ':memory:',
    logger,
    fs,
  })

  const topic = Topic.initClient({ t: 'local', contract: AppTypes.topicContract, logger })

  const backend = await TestBackend({ sqlDb, topic, logger })

  const frontend = await TestFrontend({ rpcServer: backend.rpcServer, topic, sqlDb, logger })

  const cleanUp = async () => {
    await backend.cleanUp()
    await frontend.cleanUp()
  }

  return {
    frontend,
    [Symbol.asyncDispose]: cleanUp,
  }
}
