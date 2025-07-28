import { Program } from '~/@/program/program'
import { AppFrontend } from '~/app/frontend'
import { AudioPlayer } from './@/audio-player/impl'
import { HttpProtocol } from './@/http/protocol'
import { KeyValueDb } from './@/key-value-db'
import { KeyValueDbSync } from './@/key-value-db-sync'
import { KeyBoard } from './@/keyboard/impl'
import { Logger } from './@/logger'
import { Navigation } from './@/navigation/impl'
import { Pglite } from './@/pglite/impl'
import { DebuggerReduxDevTools } from './@/program/debugger'
import { FrontendSqlDb } from './@/sql-db/frontend-impl'
import { Url } from './@/url/url'
import { h, render } from './@/vdom'
import { SwapVDomEngine } from './@/vdom/swap-vdom-engine'
import { Viewport } from './@/viewport/impl'
import './frontend.css'
import { SqlDbMigrationPolicy } from './@/sql-db-migration-policy/impl'
import { VdomImplWebStorage } from './@/vdom/vdom-impl-web-storage'

const main = async () => {
  const logger = Logger.init({ t: 'console', namespace: ['frontend'], newLinePerMsg: false, maxLogLevel: 'debug' })

  const BACKEND_URL = process.env.BACKEND_URL
  if (!BACKEND_URL) throw new Error('BACKEND_URL is not set')
  logger.info('BACKEND_URL', BACKEND_URL)

  const TOPIC_URL = process.env.TOPIC_URL
  if (!TOPIC_URL) throw new Error('TOPIC_URL is not set')
  logger.info('TOPIC_URL', TOPIC_URL)

  const windowProtocol = HttpProtocol.fromWindow() ?? 'https'

  const backendUrl = Url.derive(BACKEND_URL, windowProtocol)
  const topicUrl = Url.derive(TOPIC_URL, windowProtocol)

  const sqlDb = FrontendSqlDb.init({
    t: 'pglite',
    pglite: Pglite.init({ t: 'worker-thread', config: { t: 'indexed-db', databaseName: 'db' } }),
    logger,
  })

  const keyValueDbSync = KeyValueDbSync.init({ t: 'web-standard-storage', storage: localStorage, logger })
  const audioPlayer = AudioPlayer.init({ t: 'web-standard', logger })
  const keyboard = KeyBoard.init({ t: 'web-standard' })
  const viewport = Viewport.init({ t: 'web-standard' })
  const navigation = Navigation.init({ t: 'web-standard', logger })
  const keyValueDb = KeyValueDb.init({
    t: 'sql-db',
    sqlDb,
    logger,
    migrationPolicy: SqlDbMigrationPolicy.init({ t: 'always-run', logger }),
  })

  const vdomImplStorage = VdomImplWebStorage.init({ keyValueDb, fallback: 'inferno' })

  const ctx = await AppFrontend.initCtx({
    backendUrl,
    topicUrl,
    sqlDb,
    logger,
    audioPlayer,
    keyboard,
    viewport,
    navigation,
    keyValueDbSync,
    platform: 'web',
    keyValueDb,
  })

  const { swapped, getRoot } = await SwapVDomEngine.init({ vdomImplStorage })
  const program = await Program.run({
    crash: (input) => console.error(input),
    init: () => AppFrontend.init({ ctx }),
    update: (input) => AppFrontend.update({ ...input, ctx }),
    subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
    render: (input) => render(h(AppFrontend.View, { ...input, ctx }), getRoot()),
    debugger: DebuggerReduxDevTools,
  })
  swapped.sub(program.render)
}

main()
