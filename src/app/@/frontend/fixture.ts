import { AudioPlayer } from '~/@/audio-player'
import { HttpClient } from '~/@/http-client'
import { KeyValueDb } from '~/@/key-value-db'
import { KeyBoard } from '~/@/keyboard'
import { Translator } from '~/@/l18n/generated'
import { Logger } from '~/@/logger'
import { Navigation } from '~/@/navigation'
import { PhoneNumber } from '~/@/phone-number'
import type { Screen } from '~/@/screens/generated/screens'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { FrontendSqlDb } from '~/@/sql-db/frontend-impl'
import { CrudTransactionDb } from '~/@/sync-engine/crud-transaction-db/impl-sql'
import { SyncEngineClient } from '~/@/sync-engine/sync-engine-client'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Viewport } from '~/@/viewport'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { UserSession } from '~/app/auth/@/user-session/user-session'
import { UserAccount } from '../data/user-account'
import { UserId } from '../data/user-id'
import { UserProfile } from '../data/user-profile'
import type { AppFrontendCtx } from './ctx'

export const FixtureAppFrontend = async (input?: { currentScreen?: Screen }) => {
  const currentUserId = UserId.generate()
  const currentUser: UserAccount = {
    userId: currentUserId,
    createdAt: UnixMs.now(),
    phoneNumber: PhoneNumber.random(),
    role: 'normal',
  }
  const keyValueDb = KeyValueDb.init({ t: 'in-memory' })
  const migrationPolicy = SqlDbMigrationPolicy.init({
    t: 'dangerously-wipe-on-new-schema',
    logger: Logger.init({ t: 'noop' }),
    kvDb: keyValueDb,
  })
  const syncEngine = SyncEngineClient({
    logger: Logger.init({ t: 'noop' }),
    crudTransactionDb: CrudTransactionDb({
      t: 'sql-db',
      logger: Logger.init({ t: 'noop' }),
      migrationPolicy,
      sqlDb: FrontendSqlDb.init({ t: 'noop' }),
    }),
  })
  const ctx: AppFrontendCtx = {
    syncEngine,
    keyValueDb,
    migrationPolicy,
    keyboard: KeyBoard({ t: 'noop' }),
    audioPlayer: AudioPlayer({ t: 'fake', logger: Logger.init({ t: 'noop' }) }),
    navigation: Navigation({ t: 'in-memory', logger: Logger.init({ t: 'noop' }) }),
    viewport: Viewport({ t: 'noop' }),
    clientSessionId: ClientSessionId.generate(),
    parentScreen: null,
    sqlDb: FrontendSqlDb.init({ t: 'noop' }),
    logger: Logger.init({ t: 'noop' }),
    currentScreen: input?.currentScreen ?? {
      n: 'auth',
      t: 'login',
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
    httpClient: HttpClient({
      t: 'fetch',
    }),
  }

  return {
    ctx,
  }
}
