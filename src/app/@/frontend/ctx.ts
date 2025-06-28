import { IAudioPlayer } from '~/@/audio-player'
import { IHttpClient } from '~/@/http-client'
import type { LanguageCodeISO_639_1 } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { ILogger } from '~/@/logger'
import type { Screen } from '~/@/screen/generated/screens'
import { ISqlDb } from '~/@/sql-db'
import { UnixMs } from '~/@/time/unix-ms'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { UserAccount } from '../data/user-account'
import { UserId } from '../data/user-id'
import { UserProfile } from '../data/user-profile'
import { UserRole } from '../data/user-role'
import { ParentScreenProps } from '../ui/screen/layout/screen-layout-props'
import { ScreenSize } from '../ui/screen/screen-size'

export type AppFrontendCtxBase = {
  parentScreen: ParentScreenProps | null
  screenSize: ScreenSize
  sqlDb: ISqlDb
  logger: ILogger
  t: Translator
  navigatorLanguage: LanguageCodeISO_639_1
  currentScreen: Screen
  now: UnixMs
  profilesByUserId: {
    [userId: UserId]: UserProfile
  }
  documentVisibilityState: DocumentVisibilityState
  clientSessionId: ClientSessionId
  currentUser?: UserAccount | null
  currentUserId?: UserId | null
  currentUserRole?: UserRole | null
  httpClient: IHttpClient
  audioPlayer: IAudioPlayer
}

export type AnonymousFrontendCtx = AppFrontendCtxBase

export const isAnonymous = (ctx: AppFrontendCtxBase): ctx is AnonymousFrontendCtx => {
  return ctx.currentUser === null
}

export type AppFrontendCtx = AppFrontendCtxBase & {
  currentUser: UserAccount
  currentUserId: UserId
  currentUserRole: UserRole
}

export const isAppFrontendCtx = (ctx: AppFrontendCtxBase): ctx is AppFrontendCtx => {
  return ctx.currentUser !== null
}
