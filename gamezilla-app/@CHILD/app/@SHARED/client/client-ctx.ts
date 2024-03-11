import { UserId, Username } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Posix } from "gamezilla-app/@SHARED/core"
import * as Route from "./client-route"
import { Translator } from "gamezilla-app/@SHARED/l18n/generated"
import { LanguageCodeISO_639_1 } from "gamezilla-app/@SHARED/l18n"

type Profile = {
  userId: UserId
  username: Username
  avatarUrl: string
}

export type BaseClientCtx = {
  navigatorLanguage: LanguageCodeISO_639_1
  t: Translator
  currentRoute: Route.AppRoute
  currentRouteV2: Record<string, unknown>
  now: Posix
  currentUserId?: UserId | null
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
}
