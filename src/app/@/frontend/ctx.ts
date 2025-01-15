import { IDbConnSql } from '~/@/db-conn-sql'
import type { LanguageCodeISO_639_1 } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import { ILogger } from '~/@/logger'
import type { Screen } from '~/@/screen/generated/screens'
import { Posix } from '~/@/time/posix'
import { UserAccount } from '../data/account'
import { UserId } from '../data/user-id'
import { UserRole } from '../data/user-role'
import { Username } from '../data/username'

type Profile = {
  userId: UserId
  username: Username
  avatarUrl: string
}

export type BaseFrontendCtx = {
  dbConnSql: IDbConnSql
  logger: ILogger
  t: Translator
  navigatorLanguage: LanguageCodeISO_639_1
  currentScreen: Screen
  now: Posix
  profiles: { [userId: UserId]: Profile }
  documentVisibilityState: DocumentVisibilityState
  currentUser?: UserAccount | null
  currentUserId?: UserId | null
  currentUserRole?: UserRole | null
}

export type AnonymousFrontendCtx = BaseFrontendCtx

export const isAnonymous = (ctx: BaseFrontendCtx): ctx is AnonymousFrontendCtx => {
  return ctx.currentUserId === null
}

export type AppFrontendCtx = BaseFrontendCtx & {
  currentUser: UserAccount
  currentUserId: UserId
  currentUserRole: UserRole
}

export const isAppFrontendCtx = (ctx: BaseFrontendCtx): ctx is AppFrontendCtx => {
  return ctx.currentUserId !== null && ctx.currentUser !== null && ctx.currentUserRole !== null
}
