import { registerRootComponent } from 'expo'
import { ComponentType } from 'react'
import { AudioPlayerImplFake } from './@/audio-player/impl-fake'
import { KeyValueDbSyncImplHashMap } from './@/key-value-db-sync/impl-hash-map'
import { KeyboardImplNoop } from './@/keyboard/impl-noop'
import { Logger } from './@/logger'
import { NavigationImplKeyValueDbSync } from './@/navigation/impl-key-value-db-sync'
import { Program } from './@/program/program'
import { StoreSingleListener, useStore } from './@/react/store'
import { SqlDbImplExpoSqlite } from './@/sql-db/impl-expo-sqlite'
import { Url } from './@/url/url'
import { h, VDomEngine } from './@/vdom'
import { ImplReactNative } from './@/vdom/vdom-engine/impl-react-native'
import { ViewportImplReactNative } from './@/viewport/impl-react-native'
import { SplashScreen } from './app/@/ui/logo/splash-screen'
import { AppFrontend } from './app/frontend'
import './frontend.css'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AudioPlayerImplExpoAudio } from './@/audio-player/impl-expo-audio'

const logger = Logger.init({
  t: 'console',
  namespace: ['frontend'],
  newLinePerMsg: false,
  maxLogLevel: 'info',
})

logger.info('Initializing VDOM engine')
const vdomEngine = ImplReactNative.init({ t: 'react-native' })
VDomEngine.set(vdomEngine)
logger.info('VDOM engine initialized')

const store = StoreSingleListener<Parameters<typeof AppFrontend.View>[0] | null>(null)
const App = () => {
  const input = useStore(store)

  if (!input) {
    return h(SplashScreen, {}, [])
  }

  return h(
    // @ts-expect-error
    SafeAreaProvider,
    {},
    [h(AppFrontend.View, input, [])],
  )
}

const main = async () => {
  logger.info('Starting main')
  const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'
  if (!BACKEND_URL) throw new Error('BACKEND_URL is not set')
  logger.info('BACKEND_URL', BACKEND_URL)
  const TOPIC_URL = process.env.TOPIC_URL ?? 'ws://localhost:3001'
  if (!TOPIC_URL) throw new Error('TOPIC_URL is not set')
  logger.info('TOPIC_URL', TOPIC_URL)
  const httpProtocol = 'https'
  logger.info('Using protocol', httpProtocol)
  const backendUrl = Url.derive(BACKEND_URL, httpProtocol)
  const topicUrl = Url.derive(TOPIC_URL, httpProtocol)
  logger.info('Derived URLs', { backendUrl, topicUrl })
  logger.info('Initializing sqlDb')
  const sqlDb = SqlDbImplExpoSqlite.init({ t: 'expo-sqlite', dbName: 'gamezilla.db', logger })
  logger.info('Initializing keyValueDbSync')
  const keyValueDbSync = KeyValueDbSyncImplHashMap.init({ t: 'hash-map', logger })
  logger.info('Initializing audioPlayer')
  const audioPlayer = AudioPlayerImplExpoAudio.init({ t: 'expo-audio', logger })
  logger.info('Initializing keyboard')
  const keyboard = KeyboardImplNoop.init({ t: 'noop' })
  logger.info('Initializing viewport')
  const viewport = ViewportImplReactNative.init({ t: 'react-native' })
  logger.info('Initializing navigation')
  const navigation = NavigationImplKeyValueDbSync.init({
    t: 'key-value-db-sync',
    keyValueDbSync,
    key: 'navigation-history',
    logger,
  })
  logger.info('Initializing app context')
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
  logger.info('Starting program')

  try {
    await Program.run({
      crash: (input) => {
        logger.error('Program crashed', input)
        console.error(input)
      },
      init: () => {
        logger.info('Initializing program')
        const result = AppFrontend.init({ ctx })
        logger.info('Initialized program', result)
        return result
      },
      update: (input) => {
        const result = AppFrontend.update({ ...input, ctx })
        return result
      },
      subscriptions: (input) => {
        logger.debug('Running subscriptions', input)
        return AppFrontend.subscriptions({ ...input, ctx })
      },
      render: (input) => {
        logger.debug('Rendering', input)

        store.update({ ...input, ctx })
      },
    })
  } catch (error) {
    logger.error('Program crashed', error)
    console.error(error)
    console.trace()
  }
  logger.info('Program started')
}
main()

registerRootComponent(App as ComponentType<unknown>)
