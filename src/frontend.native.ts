import { registerRootComponent } from 'expo'
import { ComponentType } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AudioPlayerImplExpoAudio } from './@/audio-player/impl-expo-audio'
import { KeyValueDb } from './@/key-value-db'
import { KeyValueDbSyncImplHashMap } from './@/key-value-db-sync/impl-hash-map'
import { KeyboardImplNoop } from './@/keyboard/impl-noop'
import { Logger } from './@/logger'
import { NavigationImplKeyValueDb } from './@/navigation/impl-key-value-db'
import { Program } from './@/program/program'
import { StoreSingleListener, useStore } from './@/react/store'
import { SqlDbMigrationPolicy } from './@/sql-db-migration-policy/impl'
import { SqlDbImplExpoSqlite } from './@/sql-db/impl-expo-sqlite'
import { Url } from './@/url/url'
import { h, VDomEngine } from './@/vdom'
import { ImplReactNative } from './@/vdom/vdom-engine/impl-react-native'
import { ViewportImplReactNative } from './@/viewport/impl-react-native'
import { SplashScreen } from './app/@/ui/logo/splash-screen'
import { AppFrontend } from './app/frontend'
import './frontend.css'

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
  const sqlDb = SqlDbImplExpoSqlite.init({ t: 'expo-sqlite', dbName: ':memory:', logger })
  logger.info('Initializing keyValueDbSync')
  const keyValueDbSync = KeyValueDbSyncImplHashMap.init({ t: 'hash-map', logger })
  logger.info('Initializing audioPlayer')
  const audioPlayer = AudioPlayerImplExpoAudio.init({ t: 'expo-audio', logger })
  logger.info('Initializing keyboard')
  const keyboard = KeyboardImplNoop.init({ t: 'noop' })
  logger.info('Initializing viewport')
  const viewport = ViewportImplReactNative.init({ t: 'react-native' })
  logger.info('Initializing navigation')
  const keyValueDb = KeyValueDb.init({
    t: 'sql-db',
    sqlDb,
    logger,
    migrationPolicy: SqlDbMigrationPolicy.init({ t: 'always-run', logger }),
  })
  const navigation = NavigationImplKeyValueDb.init({
    t: 'key-value-db',
    keyValueDb,
    key: 'navigation-history',
    logger,
    maxHistoryLength: 10,
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
    platform: 'native',
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
