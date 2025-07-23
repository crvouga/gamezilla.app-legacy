import { registerRootComponent } from 'expo'
import { useSyncExternalStore } from 'react'
import { Program } from '~/@/program/program'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import { h } from '~/@/vdom/vdom-engine/impl'
import { AppFrontend } from '~/app/frontend'
import { HttpProtocol } from './@/http/protocol'
import { Logger } from './@/logger'
import { DebuggerReduxDevTools } from './@/program/debugger'
import { FrontendSqlDb } from './@/sql-db/frontend-impl'
import { Url } from './@/url/url'
import { VDomEngine } from './@/vdom/vdom-engine/impl'
import { ImplReactNative } from './@/vdom/vdom-engine/impl-react-native'

let latestRenderInput: any = null
let listeners: (() => void)[] = []
const renderStore = {
  get: () => latestRenderInput,
  subscribe: (listener: () => void) => {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
  update: (newValue: any) => {
    latestRenderInput = newValue
    listeners.forEach((l) => l())
  },
}

const App = () => {
  const renderInput = useSyncExternalStore(renderStore.subscribe, renderStore.get)
  if (!renderInput) return h(Box, { class: 'bg-black' }, [Text({ class: 'text-white', text: 'Loading...' })])

  return h(AppFrontend.View, renderInput)

  // return h(Box, { class: 'bg-black' }, [
  //   Text({ class: 'text-white', text: JSON.stringify(renderInput, null, 2).slice(0, 1000) }),
  // ])
}

const main = async () => {
  const logger = Logger.init({ t: 'console', namespace: ['frontend'], newLinePerMsg: false, maxLogLevel: 'debug' })

  logger.info('Initializing VDOM engine')
  const vdomEngine = ImplReactNative.init({ t: 'react-native' })
  VDomEngine.set(vdomEngine)
  logger.info('VDOM engine initialized')

  const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'
  if (!BACKEND_URL) throw new Error('BACKEND_URL is not set')
  logger.info('BACKEND_URL', BACKEND_URL)

  const TOPIC_URL = process.env.TOPIC_URL ?? 'ws://localhost:3001'
  if (!TOPIC_URL) throw new Error('TOPIC_URL is not set')
  logger.info('TOPIC_URL', TOPIC_URL)

  const httpProtocol = HttpProtocol.fromWindow() ?? 'https'
  const backendUrl = Url.derive(BACKEND_URL, httpProtocol)
  const topicUrl = Url.derive(TOPIC_URL, httpProtocol)

  const sqlDb = FrontendSqlDb.init({
    t: 'noop',
    // logger,
    // pglite: PgliteInstance({ t: 'indexed-db', databaseName: 'pglite-db' }),
  })

  const ctx = await AppFrontend.initCtx({ backendUrl, topicUrl, sqlDb, logger })

  await Program.run({
    crash: (input) => console.error(input),
    init: () => AppFrontend.init({ ctx }),
    update: (input) => AppFrontend.update({ ...input, ctx }),
    subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
    render: (input) => {
      renderStore.update({ ...input, ctx })
    },
    debugger: DebuggerReduxDevTools,
  })

  registerRootComponent(App as any)
}

main()
