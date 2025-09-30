import { AudioPlayer } from '~/@/audio-player'
import { HttpClient } from '~/@/http-client'
import { KeyValueDb } from '~/@/key-value-db'
import { KeyValueDbSync } from '~/@/key-value-db-sync'
import { KeyBoard } from '~/@/keyboard'
import { Translator } from '~/@/l18n/generated'
import { Logger } from '~/@/logger'
import { Navigation } from '~/@/navigation'
import { PhoneNumber } from '~/@/phone-number'
import type { Screen } from '~/@/screens/generated/screens'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { FrontendSqlDb } from '~/@/sql-db/frontend-impl'
import { CrudTransactionDb } from '~/@/sync-engine/crud-transaction-db/impl'
import { SyncEngineClient } from '~/@/sync-engine/sync-engine-client'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Viewport } from '~/@/viewport'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { UserSession } from '~/app/auth/@/user-session/user-session'
import { QueryCache } from '~/app/frontend/query-cache'
import { UserAccount } from '../data/user-account'
import { UserId } from '../data/user-id'
import { UserProfile } from '../data/user-profile'
import type { AppFrontendCtx } from './ctx'
import { VdomImplWebStorage } from '~/@/vdom/vdom-impl-web-storage'

export const FixtureAppFrontend = async (input?: { currentScreen?: Screen }) => {
  const currentUserId = UserId.generate()
  const currentUser: UserAccount = {
    userId: currentUserId,
    createdAt: UnixMs.now(),
    phoneNumber: PhoneNumber.random(),
    role: 'normal',
  }
  const logger = Logger.init({ t: 'noop' })
  const keyValueDb = KeyValueDb.init({ t: 'in-memory' })
  const migrationPolicy = SqlDbMigrationPolicy.init({
    t: 'dangerously-wipe-on-new-schema',
    logger,
    kvDb: keyValueDb,
  })
  const syncEngine = SyncEngineClient.init({
    logger,
    crudTransactionDb: CrudTransactionDb.init({
      t: 'sql-db',
      logger,
      migrationPolicy,
      sqlDb: FrontendSqlDb.init({ t: 'noop', logger }),
    }),
  })
  const keyValueDbSync = KeyValueDbSync.init({ t: 'hash-map', logger })
  const vdomImplStorage = VdomImplWebStorage.init({ keyValueDb })
  const vdomImpl = await vdomImplStorage.get()
  const ctx: AppFrontendCtx = {
    syncEngine,
    keyValueDb,
    migrationPolicy,
    platform: 'web',
    keyboard: KeyBoard.init({ t: 'noop' }),
    audioPlayer: AudioPlayer.init({ t: 'fake', logger: Logger.init({ t: 'noop' }) }),
    navigation: Navigation.init({
      t: 'key-value-db-sync',
      keyValueDbSync,
      key: 'navigation-history',
      logger,
      maxHistoryLength: 10,
    }),
    viewport: Viewport.init({ t: 'noop' }),
    clientSessionId: ClientSessionId.generate(),
    parentScreen: null,
    sqlDb: FrontendSqlDb.init({ t: 'noop', logger: Logger.init({ t: 'noop' }) }),
    logger,
    currentScreen: input?.currentScreen ?? {
      n: 'auth',
      t: 'auth_login',
    },
    viewportVisibility: 'visible',
    navigatorLanguage: 'en',
    now: UnixMs.now(),
    profilesByUserId: {},
    screenSize: 'mobile',
    t: Translator('en'),
    currentUser,
    currentUserState: {
      t: 'logged-in',
      userAccount: currentUser,
      userSession: UserSession.random({ userId: currentUserId }),
      userProfile: await UserProfile.random({ userId: currentUserId }),
    },
    backendConnectionStatus: {
      t: 'connected',
      averagePing: TimeSpan.milliseconds(100),
      latestPing: TimeSpan.milliseconds(100),
    },
    httpClient: HttpClient.init({
      t: 'fetch',
    }),
    queryCache: QueryCache.init({}).model,
    vdomImpl,
  }

  return {
    ctx,
  }
}
