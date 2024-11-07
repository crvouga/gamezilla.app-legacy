import type { UserId, UserRole, Username } from 'gamezilla-app/app/@/data'
import type { Posix } from '@/core'
import type { LanguageCodeISO_639_1 } from '@/l18n'
import type { Translator } from '@/l18n/generated'
import type { Route } from '@/routing/generated/routes'
import { UserAccount } from '../data/account'

type Profile = {
  userId: UserId
  username: Username
  avatarUrl: string
}

export type BaseClientCtx = {
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

export type AnonymousClientCtx = BaseClientCtx

export const isAnonymous = (ctx: BaseClientCtx): ctx is AnonymousClientCtx => {
  return ctx.currentUserId === null
}

export type AppClientCtx = BaseClientCtx & {
  currentUser: UserAccount
  currentUserId: UserId
  currentUserRole: UserRole
}

export const isAppClientCtx = (ctx: BaseClientCtx): ctx is AppClientCtx => {
  return ctx.currentUserId !== null && ctx.currentUser !== null && ctx.currentUserRole !== null
}
