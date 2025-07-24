import { Program } from '~/@/program/program'
import { AppFrontend } from '~/app/frontend'
import { HttpProtocol } from './@/http/protocol'
import { Logger } from './@/logger'
import { PgliteInstance } from './@/pglite/pglite-instance'
import { PgliteWorkerInstance } from './@/pglite/pglite-worker-instance/pglite-worker-instance'
import { IPgliteInstance } from './@/pglite/types'
import { DebuggerReduxDevTools } from './@/program/debugger'
import { Psql } from './@/psql'
import { FrontendSqlDb } from './@/sql-db/frontend-impl'
import { Url } from './@/url/url'
import { h, render, VDomEngine } from './@/vdom'
import { ImplWeb } from './@/vdom/vdom-engine/impl-web'
import { VDomImplWeb } from './@/vdom/vdom-impl-web'
import './frontend.css'

const main = async () => {
  const logger = Logger.init({ t: 'console', namespace: ['frontend'], newLinePerMsg: false, maxLogLevel: 'debug' })

  const BACKEND_URL = process.env.BACKEND_URL
  if (!BACKEND_URL) throw new Error('BACKEND_URL is not set')
  logger.info('BACKEND_URL', BACKEND_URL)

  const TOPIC_URL = process.env.TOPIC_URL
  if (!TOPIC_URL) throw new Error('TOPIC_URL is not set')
  logger.info('TOPIC_URL', TOPIC_URL)

  const root = document.createElement('div')
  document.body.prepend(root)
  const VDOM_IMPL = VDomImplWeb.getUrl()
  logger.info('VDOM_IMPL', VDOM_IMPL)
  const vdomEngine = await ImplWeb.init({ t: VDOM_IMPL })
  VDomEngine.set(vdomEngine)

  const windowProtocol = HttpProtocol.fromWindow() ?? 'https'

  const backendUrl = Url.derive(BACKEND_URL, windowProtocol)
  const topicUrl = Url.derive(TOPIC_URL, windowProtocol)

  let pglite: Promise<IPgliteInstance>
  pglite ??= PgliteWorkerInstance({ t: 'indexed-db', databaseName: 'db' })
  pglite ??= PgliteWorkerInstance({ t: 'in-memory' })
  pglite ??= PgliteInstance({ t: 'indexed-db', databaseName: 'db' })
  pglite ??= PgliteInstance({ t: 'in-memory' })

  const sqlDb = FrontendSqlDb.init({
    t: 'pglite',
    pglite,
    logger,
  })

  // @ts-expect-error
  window.q = Psql({ sqlDb }).psql

  const ctx = await AppFrontend.initCtx({ backendUrl, topicUrl, sqlDb, logger })

  const program = await Program.run({
    crash: (input) => console.error(input),
    init: () => AppFrontend.init({ ctx }),
    update: (input) => AppFrontend.update({ ...input, ctx }),
    subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
    render: (input) => render(h(AppFrontend.View, { ...input, ctx }), root),
    debugger: DebuggerReduxDevTools,
  })

  VDomImplWeb.events.sub(async (event) => {
    VDomImplWeb.setUrl(event.vdomImpl)
    const vdomEngine = await ImplWeb.init({ t: event.vdomImpl })
    VDomEngine.set(vdomEngine)
    root.innerHTML = ''
    program.render()
  })
}

main()
