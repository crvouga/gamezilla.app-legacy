import { registerRootComponent } from 'expo'
import { ComponentType } from 'react'
import { h, VDomEngine } from '~/@/vdom/vdom-engine/impl'
import { AudioPlayer } from './@/audio-player'
import { KeyValueDbSync } from './@/key-value-db-sync'
import { KeyBoard } from './@/keyboard'
import { Logger } from './@/logger'
import { Navigation } from './@/navigation'
import { Program } from './@/program/program'
import { StoreSingleListener, useStore } from './@/react/store'
import { SqlDbImplExpoSqlite } from './@/sql-db/impl-expo-sqlite'
import { Url } from './@/url/url'
import { ImplReactNative } from './@/vdom/vdom-engine/impl-react-native'
import { ViewportImplReactNative } from './@/viewport/impl-react-native'
import { AppFrontend } from './app/frontend'
import './frontend.css'

const store = StoreSingleListener<Parameters<typeof AppFrontend.View>[0] | null>(null)
const App = () => {
  const input = useStore(store)
  if (!input) return null
  return h(AppFrontend.View, input, [])
}

const main = async () => {
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

  const httpProtocol = 'https'
  const backendUrl = Url.derive(BACKEND_URL, httpProtocol)
  const topicUrl = Url.derive(TOPIC_URL, httpProtocol)

  const sqlDb = SqlDbImplExpoSqlite.init({ t: 'expo-sqlite', dbName: 'gamezilla.db', logger })
  const keyValueDbSync = KeyValueDbSync.init({ t: 'web-standard-storage', logger, storage: localStorage })
  const audioPlayer = AudioPlayer.init({ t: 'fake', logger })
  const keyboard = KeyBoard.init({ t: 'noop' })
  const viewport = ViewportImplReactNative.init({ t: 'react-native' })
  const navigation = Navigation.init({ t: 'key-value-db-sync', keyValueDbSync, key: 'navigation-history', logger })

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
  })

  await Program.run({
    crash: (input) => console.error(input),
    init: () => AppFrontend.init({ ctx }),
    update: (input) => AppFrontend.update({ ...input, ctx }),
    subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
    render: (input) => store.update({ ...input, ctx }),
  })
}

registerRootComponent(App as ComponentType<unknown>)

main()
