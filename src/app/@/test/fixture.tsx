import { Logger } from '~/@/logger'
import { Program } from '~/@/program/program'
import { SqlDb } from '~/@/sql-db/backend/impl'
import { TestClient } from '~/@/test-client'
import { TimeSpan } from '~/@/time/time-span'
import { Topic } from '~/@/topic'
import { Render } from '~/@/vdom/render'
import { SessionId } from '~/@/wire/session-id'
import { AppTypes } from '~/app'
import { AppBackend } from '~/app/backend'
import { AppFrontend } from '~/app/frontend'
import { BackendCtxModule, FrontendCtxModule } from '~/app/types'
import { CONFIG_BACKEND } from '~/config/backend'
import { initBackendCtx } from './ctx/backend'
import { initFrontendCtx } from './ctx/frontend'

export const FixtureApp = async () => {
  const logger = Logger({
    t: 'console',
    namespace: ['test', 'fixture'],
    newLinePerMsg: false,
  })

  const sqlDb = await SqlDb({
    t: 'postgres',
    databaseUrl: CONFIG_BACKEND.DATABASE_URL(),
    logger,
  })

  const topic = Topic.initClient({
    t: 'local',
    contract: AppTypes.topicContract,
    logger,
  })

  const backendCtx = await initBackendCtx({
    backendRole: 'primary',
    sqlDb,
    topic,
    logger,
  })

  const rpcServer = AppBackend.rpc({ ctx: backendCtx })

  const sessionId = SessionId.generate()

  const frontendCtx = await initFrontendCtx({
    rpcServer,
    sessionId,
    topic,
    sqlDb,
    logger,
  })

  const client = await TestClientApp({ frontendCtx })
  const backend = await TestBackendPrimary({ backendCtx })

  const dispose = async () => {
    try {
      await backendCtx.httpServer.stop()
      backend.abortController.abort()
    } catch (error) {
      logger.error('Error during test cleanup:', error)
    }
  }

  return {
    client,
    backend,
    dispose,
    [Symbol.asyncDispose]: dispose,
  }
}

const TestBackendPrimary = async (config: { backendCtx: BackendCtxModule }) => {
  const ctx = config.backendCtx

  const abortController = new AbortController()

  AppBackend.worker(abortController.signal, { ctx })

  return {
    abortController,
  }
}

export const TestClientApp = async (config: { frontendCtx: FrontendCtxModule }) => {
  const client = await TestClient({
    t: 'happydom',
    maxWait: TimeSpan.seconds(5),
    poll: TimeSpan.milliseconds(1),
  })

  document.body.innerHTML = '<div id="root"></div>'
  const root = document.getElementById('root')
  const render = await Render('react', root!)
  const ctx = config.frontendCtx

  const p = await Program.run({
    init: () => AppFrontend.init({ ctx }),
    update: (input) => AppFrontend.update({ ...input, ctx }),
    subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
    render: (input) => render(<AppFrontend.View {...input} ctx={ctx} />),
  })

  return {
    ...client,
    ...p,
  }
}
