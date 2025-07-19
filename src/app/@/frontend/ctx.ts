import { IAudioPlayer } from '~/@/audio-player'
import { IHttpClient } from '~/@/http-client'
import { IKeyValueDb } from '~/@/key-value-db'
import { IKeyBoard } from '~/@/keyboard'
import type { LanguageCodeISO_639_1 } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { ILogger } from '~/@/logger'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/interface'
import { INavigation } from '~/@/navigation'
import type { Screen } from '~/@/screens/generated/screens'
import { ISqlDb } from '~/@/sql-db'
import { ISyncEngine } from '~/@/sync-engine/sync-engine-server'
import { UnixMs } from '~/@/time/unix-ms'
import { IViewport, ViewportVisibility } from '~/@/viewport'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { BackendConnectionStatus } from '~/app/@/wire/backend-connection-status'
import { UserSession } from '~/app/auth/@/user-session/user-session'
import { UserAccount } from '../data/user-account'
import { UserId } from '../data/user-id'
import { UserProfile } from '../data/user-profile'
import { ParentScreenProps } from '../ui/screen/layout/screen-layout-props'
import { ScreenSize } from '../ui/screen/screen-size'

export type CurrentUser =
  | { t: 'loading' }
  | { t: 'logged-out' }
  | { t: 'logged-in'; userAccount: UserAccount; userSession: UserSession; userProfile: UserProfile }

export type AppFrontendCtxBase = {
  parentScreen: ParentScreenProps | null
  screenSize: ScreenSize
  sqlDb: ISqlDb
  logger: ILogger
  migrationPolicy: ISqlDbMigrationPolicy
  keyboard: IKeyBoard
  t: Translator
  navigatorLanguage: LanguageCodeISO_639_1
  currentScreen: Screen
  now: UnixMs
  viewport: IViewport
  viewportVisibility: ViewportVisibility
  keyValueDb: IKeyValueDb
  profilesByUserId: {
    [userId: UserId]: UserProfile
  }
  clientSessionId: ClientSessionId
  currentUser?: UserAccount | null
  currentUserState: CurrentUser
  httpClient: IHttpClient
  audioPlayer: IAudioPlayer
  navigation: INavigation
  backendConnectionStatus: BackendConnectionStatus
  syncEngine: ISyncEngine
}

export type AppFrontendCtx = AppFrontendCtxBase & {
  currentUser: UserAccount
}

export const isAppFrontendCtx = (ctx: AppFrontendCtxBase): ctx is AppFrontendCtx => {
  return ctx.currentUser !== null
}
