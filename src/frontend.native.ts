// @ts-nocheck
import { registerRootComponent } from 'expo'
import { ComponentType } from 'react'
import { AudioPlayerImplFake } from './@/audio-player/impl-fake'
import { KeyValueDbSyncImplHashMap } from './@/key-value-db-sync/impl-hash-map'
import { KeyboardImplNoop } from './@/keyboard/impl-noop'
import { Logger } from './@/logger'
import { NavigationImplKeyValueDbSync } from './@/navigation/impl-key-value-db-sync'
import { StoreSingleListener, useStore } from './@/react/store'
import { SqlDbImplExpoSqlite } from './@/sql-db/impl-expo-sqlite'
import { Url } from './@/url/url'
import { VDomEngine } from './@/vdom'
import { Text } from './@/vdom/primitives/text'
import { ImplReactNative } from './@/vdom/vdom-engine/impl-react-native'
import { ViewportImplReactNative } from './@/viewport/impl-react-native'
import { AppFrontend } from './app/frontend'
import './frontend.css'

const logger = Logger.init({
  t: 'console',
  namespace: ['frontend'],
  newLinePerMsg: false,
  maxLogLevel: 'debug',
})

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

const store = StoreSingleListener<Parameters<typeof AppFrontend.View>[0] | null>(null)
const App = () => {
  const input = useStore(store)
  if (!input) {
    return Text({
      text: 'Loading...',
      class: 'text-white bg-black text-7xl pt-10',
    })
  }
  return Text({
    text: 'Hello, world!',
    class: 'text-white bg-black text-7xl pt-10',
  })
  // return h(AppFrontend.View, input, [])
}

registerRootComponent(App as ComponentType<unknown>)

const httpProtocol = 'https'
const backendUrl = Url.derive(BACKEND_URL, httpProtocol)
const topicUrl = Url.derive(TOPIC_URL, httpProtocol)
const sqlDb = SqlDbImplExpoSqlite.init({ t: 'expo-sqlite', dbName: 'gamezilla.db', logger })
const keyValueDbSync = KeyValueDbSyncImplHashMap.init({ t: 'hash-map', logger })
const audioPlayer = AudioPlayerImplFake.init({ t: 'fake', logger })
const keyboard = KeyboardImplNoop.init({ t: 'noop' })
const viewport = ViewportImplReactNative.init({ t: 'react-native' })
const navigation = NavigationImplKeyValueDbSync.init({
  t: 'key-value-db-sync',
  keyValueDbSync,
  key: 'navigation-history',
  logger,
})
const main = async () => {
  debugger
  // const ctx = await AppFrontend.initCtx({
  //   backendUrl,
  //   topicUrl,
  //   sqlDb,
  //   logger,
  //   audioPlayer,
  //   keyboard,
  //   viewport,
  //   navigation,
  //   keyValueDbSync,
  // })
  // await Program.run({
  //   crash: (input) => console.error(input),
  //   init: () => AppFrontend.init({ ctx }),
  //   update: (input) => AppFrontend.update({ ...input, ctx }),
  //   subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
  //   render: (input) => store.update({ ...input, ctx }),
  // })
  logger.info('Program started')
}
main()
