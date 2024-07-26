import type { UserId, UserRole, Username } from 'gamezilla-app/app/@/data'
import type { Posix } from 'gamezilla-app/@/core'
import type { LanguageCodeISO_639_1 } from 'gamezilla-app/@/l18n'
import type { Translator } from 'gamezilla-app/@/l18n/generated'
import type { Route } from 'gamezilla-app/@/routing/generated/routes'

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
  currentUserId?: UserId | null
  currentUserRole?: UserRole
  profiles: { [userId: UserId]: Profile }
  documentVisibilityState: DocumentVisibilityState
}

export type AnonymousClientCtx = BaseClientCtx & {
  currentUserId: null
}

export const isAnonymous = (ctx: BaseClientCtx): ctx is AnonymousClientCtx => {
  return ctx.currentUserId === null
}

export type ClientCtx = BaseClientCtx & {
  currentUserId: UserId
  currentUserRole: UserRole
}
