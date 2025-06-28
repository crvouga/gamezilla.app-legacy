import { ILogger, Logger } from '~/@/logger'
import { SqlDb } from '~/@/sql-db/backend/impl'
import { Topic } from '~/@/topic'
import { AppTypes } from '~/app'
import { TestBackend } from './test-backend'
import { TestFrontend } from './test-frontend'

export const FixtureApp = async () => {
  let logger: ILogger
  logger ??= Logger({ t: 'noop' })
  logger ??= Logger({ t: 'console', namespace: ['fixture'], newLinePerMsg: false })

  const sqlDb = await SqlDb({ t: 'bun-sqlite', fs: { t: 'in-memory' }, logger: Logger({ t: 'noop' }) })

  const topic = Topic.initClient({ t: 'local', contract: AppTypes.topicContract, logger })

  const backend = await TestBackend({ sqlDb, topic, logger })

  const frontend = await TestFrontend({ rpcServer: backend.rpcServer, topic, sqlDb, logger })

  const cleanUp = async () => {
    await backend.cleanUp()
    await frontend.cleanUp()
  }

  return {
    frontend,
    backend,
    cleanUp,
    [Symbol.asyncDispose]: cleanUp,
  }
}
