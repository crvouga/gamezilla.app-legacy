import { AudioPlayer } from '~/@/audio-player'
import { HttpClient } from '~/@/http-client'
import { KeyValueDb } from '~/@/key-value-db'
import { KeyBoard } from '~/@/keyboard'
import { Translator } from '~/@/l18n/generated'
import { Logger } from '~/@/logger'
import { Navigation } from '~/@/navigation'
import { PhoneNumber } from '~/@/phone-number'
import type { Screen } from '~/@/screens/generated/screens'
import { SQL_DB_NOOP } from '~/@/sql-db/impl-noop'
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
  const ctx: AppFrontendCtx = {
    keyValueDb: await KeyValueDb({ t: 'in-memory' }),
    keyboard: KeyBoard({ t: 'noop' }),
    audioPlayer: AudioPlayer({ t: 'fake', logger: Logger({ t: 'noop' }) }),
    navigation: Navigation({ t: 'in-memory', logger: Logger({ t: 'noop' }) }),
    viewport: Viewport({ t: 'noop' }),
    clientSessionId: ClientSessionId.generate(),
    parentScreen: null,
    sqlDb: SQL_DB_NOOP,
    logger: Logger({ t: 'noop' }),
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
