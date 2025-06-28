import { AudioPlayer } from '~/@/audio-player'
import { ILogger, Logger } from '~/@/logger'
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
import { initBackendCtx } from './ctx/backend'
import { initFrontendCtx } from './ctx/frontend'

export const FixtureApp = async () => {
  let logger: ILogger
  logger ??= Logger({ t: 'noop' })
  logger ??= Logger({ t: 'console', namespace: ['fixture'], newLinePerMsg: false })

  const sqlDb = await SqlDb({
    t: 'bun-sqlite',
    fs: { t: 'in-memory' },
    logger: Logger({ t: 'noop' }),
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

  const frontend = await TestFrontend({ frontendCtx })

  const backend = await TestBackend({ backendCtx })

  const cleanUp = async () => {
    await frontend.cleanUp()
  }

  return {
    frontend,
    backend,
    cleanUp,
    [Symbol.asyncDispose]: cleanUp,
  }
}

const TestBackend = async (config: { backendCtx: BackendCtxModule }) => {
  const ctx = config.backendCtx

  const abortController = new AbortController()

  AppBackend.worker(abortController.signal, { ctx })

  return {
    abortController,
  }
}

export const TestFrontend = async (config: { frontendCtx: FrontendCtxModule }) => {
  const client = await TestClient({
    t: 'happydom',
    maxWait: TimeSpan.milliseconds(100),
    poll: TimeSpan.milliseconds(10),
  })

  document.body.innerHTML = `<div id="root"></div>`

  const root = document.getElementById(`root`)

  if (!root) throw new Error('Root element not found')

  const render = await Render('react', root)

  const audio = AudioPlayer({ t: 'fake', logger: config.frontendCtx.logger })

  const ctx = {
    ...config.frontendCtx,
    audioPlayer: audio,
  }

  const program = await Program.run({
    init: () => AppFrontend.init({ ctx }),
    update: (input) => AppFrontend.update({ ...input, ctx }),
    subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
    render: (input) => render(<AppFrontend.View {...input} ctx={ctx} />),
  })

  const cleanUp = async () => {
    window.history.replaceState({}, '', '/')
    program.cleanUp()
  }

  return {
    ...client,
    ...program,
    audio,
    cleanUp,
  }
}
