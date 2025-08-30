import '@expo/metro-runtime'
import { registerRootComponent } from 'expo'
import { ComponentType, useEffect, useState } from 'react'
import { AudioPlayerImplExpoAudio } from './@/audio-player/impl-expo-audio'
import { KeyValueDb } from './@/key-value-db'
import { KeyValueDbSyncImplHashMap } from './@/key-value-db-sync/impl-hash-map'
import { KeyboardImplNoop } from './@/keyboard/impl-noop'
import { Logger } from './@/logger'
import { NavigationImplKeyValueDb } from './@/navigation/impl-key-value-db'
import { IPlatform } from './@/platform/platform'
import { Program } from './@/program/program'
import { SqlDbMigrationPolicy } from './@/sql-db-migration-policy/impl'
import { FrontendNativeSqlDb } from './@/sql-db/frontend-native-impl'
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
  maxLogLevel: 'debug',
})

const vdomEngine = ImplReactNative.init({ t: 'react-native' })
VDomEngine.set(vdomEngine)

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
const sqlDb = FrontendNativeSqlDb.init({
  t: 'expo-sqlite',
  dbName: 'gamezilla.db',
  logger,
})

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

const platform: IPlatform = 'native'

const Main = () => {
  const [input, setInput] = useState<Parameters<typeof AppFrontend.View>[0] | null>(null)

  useEffect(() => {
    const main = async () => {
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
        platform,
        keyValueDb,
      })

      logger.info('Starting program')

      await new Promise((resolve) => setTimeout(resolve, 3000))

      await Program.run({
        crash: (input) => logger.error('Program crashed', input),
        init: () => AppFrontend.init({ ctx }),
        update: (input) => AppFrontend.update({ ...input, ctx }),
        subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
        render: (input) => setInput({ ...input, ctx }),
      })

      logger.info('Program started')
    }

    main()
  }, [])

  if (!input) return h(SplashScreen, {}, [])

  return h(AppFrontend.View, input, [])
}

registerRootComponent(Main as ComponentType<unknown>)
