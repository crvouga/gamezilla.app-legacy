import type { LanguageCodeISO_639_1 } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import type { Route } from '~/@/routing/generated/routes'
import { Posix } from '~/@/time/posix'
import { UserAccount } from '../data/account'
import { UserId } from '../data/user-id'
import { Username } from '../data/username'
import { UserRole } from '../data/user-role'

type Profile = {
  userId: UserId
  username: Username
  avatarUrl: string
}

export type BaseFrontendCtx = {
  navigatorLanguage: LanguageCodeISO_639_1
  t: Translator
  currentRoute: Route
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
